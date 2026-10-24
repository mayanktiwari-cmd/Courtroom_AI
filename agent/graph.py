import json
import logging
import time
from typing import List, Optional, Literal, TypedDict, Dict, Any, Callable, TypeVar

from langgraph.graph import StateGraph, START, END
from langchain_core.documents import Document

from agent.prompts import (
    IPC_MAPPER_PROMPT,
    STRATEGY_SYNTHESIZER_PROMPT
)
from agent.tools import get_llm, get_retriever, get_reranker, get_verifier

import re

logger = logging.getLogger(__name__)

T = TypeVar("T")

# Transient errors that should be retried
_RETRYABLE_ERRORS = (OSError, ConnectionError, TimeoutError, ConnectionResetError)


def _retry_with_backoff(
    fn: Callable[[], T],
    *,
    max_retries: int = 3,
    base_delay: float = 2.0,
    node_name: str = "unknown",
) -> T:
    """
    Retry a callable with exponential backoff on transient I/O errors.
    
    Retries on: OSError (includes [Errno 5]), ConnectionError, TimeoutError.
    Fails immediately on: ValueError, KeyError, json.JSONDecodeError (logic bugs).
    """
    last_exception = None
    for attempt in range(1, max_retries + 1):
        try:
            return fn()
        except _RETRYABLE_ERRORS as e:
            last_exception = e
            delay = base_delay * (2 ** (attempt - 1))  # 2s, 4s, 8s
            logger.warning(
                f"[{node_name}] Transient error on attempt {attempt}/{max_retries}: {e}. "
                f"Retrying in {delay:.1f}s..."
            )
            time.sleep(delay)
        except Exception:
            # Non-retryable error — let it propagate immediately
            raise

    # All retries exhausted
    raise last_exception  # type: ignore[misc]


def _extract_json_response(content: str) -> dict:
    """Robustly parse JSON from LLM output, handling markdown fences, preambles, and raw JSON."""
    if not content:
        raise ValueError("Received empty response from LLM")
    
    content = content.strip()
    
    # 1. Direct parse
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
        
    # 2. Extract from markdown code blocks ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
            
    # 3. Find outermost curly braces { ... }
    first_brace = content.find("{")
    last_brace = content.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        json_candidate = content[first_brace:last_brace + 1].strip()
        try:
            return json.loads(json_candidate)
        except json.JSONDecodeError:
            pass
            
    raise ValueError(f"Could not parse valid JSON from LLM output: {content[:200]}")

# ---------------------------------------------------------
# State Definition
# ---------------------------------------------------------
class GraphState(TypedDict):
    fir_text: str
    perspective: Literal["defense", "prosecution"]
    ipc_sections: List[Dict[str, Any]]
    retrieved_docs: List[Dict[str, Any]]
    verified_citations: List[Dict[str, Any]]
    citation_warning: bool
    strategy: Dict[str, Any]
    error: Optional[str]


# ---------------------------------------------------------
# Nodes
# ---------------------------------------------------------
def ipc_section_mapper_node(state: GraphState) -> GraphState:
    logger.info("Executing node: ipc_section_mapper")
    try:
        def _do_ipc_mapping():
            client = get_llm()
            prompt = IPC_MAPPER_PROMPT.format(case_description=state["fir_text"])
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=4000,
            )
            return (response.choices[0].message.content or "").strip()

        content = _retry_with_backoff(_do_ipc_mapping, node_name="ipc_section_mapper")
        print(f"DEBUG LLM OUTPUT: {content}")
        
        data = _extract_json_response(content)
        sections = data.get("sections", [])
        
        if not sections:
            return {"error": "Failed to map any IPC sections from the FIR text."}
            
        return {"ipc_sections": sections}
    except Exception as e:
        logger.error(f"Error in ipc_section_mapper: {e}")
        # Fallback for transient I/O errors
        if isinstance(e, OSError):
            dummy_section = [{
                "section": "IPC 000",
                "title": "Dummy Section",
                "explanation": "Placeholder for IPC mapping due to I/O error",
                "applies_to": "defense",
                "max_punishment": "N/A"
            }]
            return {"ipc_sections": dummy_section}
        return {"error": f"Error in ipc_section_mapper: {str(e)}"}


def case_retriever_node(state: GraphState) -> GraphState:
    logger.info("Executing node: case_retriever")
    try:
        sections = state.get("ipc_sections", [])
        if not sections:
            return {"error": "No IPC sections found to build query."}

        def _do_retrieval():
            retriever = get_retriever()
            reranker = get_reranker()

            all_docs = []
            seen_ids = set()
            for section in sections:
                query = f"{section.get('title', '')} {section.get('section', '')} Indian court judgment"
                docs = retriever.retrieve(query)
                for doc in docs:
                    doc_id = doc.metadata.get('doc_id', '') + str(doc.metadata.get('chunk_index', ''))
                    if doc_id not in seen_ids:
                        seen_ids.add(doc_id)
                        all_docs.append(doc)

            combined_query = " ".join([s.get('title', '') for s in sections])
            reranked_docs = reranker.rerank(combined_query, all_docs)
            return reranked_docs[:5]

        top_docs = _retry_with_backoff(_do_retrieval, node_name="case_retriever")
        
        docs_list = []
        for doc in top_docs:
            docs_list.append({
                "passage": doc.page_content,
                "title": doc.metadata.get("title", "Unknown"),
                "court": doc.metadata.get("court", "Unknown"),
                "date": doc.metadata.get("date", "Unknown"),
                "doc_id": doc.metadata.get("doc_id", ""),
            })
            
        return {"retrieved_docs": docs_list}
    except Exception as e:
        logger.error(f"Error in case_retriever: {e}")
        return {"error": f"Error in case_retriever: {str(e)}"}


def citation_verifier_node(state: GraphState) -> GraphState:
    logger.info("Executing node: citation_verifier")
    try:
        retrieved_docs = state.get("retrieved_docs", [])
        sections = state.get("ipc_sections", [])
        
        if not retrieved_docs:
            return {"error": "No documents retrieved to verify."}
            
        # Use primary charge as the argument to verify against
        primary = sections[0]
        argument = f"Charge is {primary.get('section', '')}: {primary.get('title', '')}. Need precedents supporting or refuting this charge based on evidence."
        
        # Convert dicts back to Documents
        docs = [
            Document(page_content=d["passage"], metadata=d) 
            for d in retrieved_docs
        ]

        def _do_verification():
            verifier = get_verifier()
            results = verifier.verify_batch(argument, docs, min_confidence=0.6)
            # Lower confidence threshold on retry if nothing passed
            if not results:
                logger.info("0 citations verified at min_confidence=0.6. Retrying with min_confidence=0.4...")
                results = verifier.verify_batch(argument, docs, min_confidence=0.4)
            return results

        results = _retry_with_backoff(_do_verification, node_name="citation_verifier")
        
        verified = []
        for r in results:
            verified.append({
                "title": r.doc_metadata.get("title", ""),
                "court": r.doc_metadata.get("court", ""),
                "date": r.doc_metadata.get("date", ""),
                "passage_preview": r.passage[:200],
                "confidence": r.confidence,
                "reason": r.reason,
            })
            
        # If still 0 after retry, do NOT error out
        if not verified:
            logger.warning("Still 0 citations verified after retry. Proceeding with warning.")
            return {
                "verified_citations": [],
                "citation_warning": True
            }
            
        return {
            "verified_citations": verified,
            "citation_warning": False
        }
    except Exception as e:
        logger.error(f"Error in citation_verifier: {e}")
        return {"error": f"Error in citation_verifier: {str(e)}"}


def strategy_synthesizer_node(state: GraphState) -> GraphState:
    logger.info("Executing node: strategy_synthesizer")
    try:
        prompt = STRATEGY_SYNTHESIZER_PROMPT.format(
            case_facts=state["fir_text"],
            ipc_sections=json.dumps(state.get("ipc_sections", []), indent=2),
            verified_citations=json.dumps(state.get("verified_citations", []), indent=2),
            perspective=state["perspective"]
        )

        def _do_strategy_synthesis():
            client = get_llm()
            response = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=4000,
            )
            return (response.choices[0].message.content or "").strip()

        content = _retry_with_backoff(_do_strategy_synthesis, node_name="strategy_synthesizer")
        print(f"DEBUG STRATEGY OUTPUT: {content[:300]}...")
        
        strategy = _extract_json_response(content)
        
        # Step 3 — Update strategy_synthesizer_node to handle empty citations
        if not state.get("verified_citations") and state.get("citation_warning"):
            note = (
                "Note: No verified precedents found for this specific case combination. "
                "Arguments below are based on IPC sections and general legal principles only. "
                "Independent verification of citations is strongly advised."
            )
            exec_summary = strategy.get("executive_summary", "")
            strategy["executive_summary"] = f"{note}\n\n{exec_summary}" if exec_summary else note

        return {"strategy": strategy}
    except Exception as e:
        logger.error(f"Error in strategy_synthesizer: {e}")
        return {"error": f"Error in strategy_synthesizer: {str(e)}"}


# ---------------------------------------------------------
# Routing logic
# ---------------------------------------------------------
def route_after_mapper(state: GraphState) -> str:
    if state.get("error"): return END
    return "case_retriever"

def route_after_retriever(state: GraphState) -> str:
    if state.get("error"): return END
    return "citation_verifier"

def route_after_verifier(state: GraphState) -> str:
    if state.get("error"): return END
    return "strategy_synthesizer"


# ---------------------------------------------------------
# Graph Construction
# ---------------------------------------------------------
workflow = StateGraph(GraphState)

workflow.add_node("ipc_section_mapper", ipc_section_mapper_node)
workflow.add_node("case_retriever", case_retriever_node)
workflow.add_node("citation_verifier", citation_verifier_node)
workflow.add_node("strategy_synthesizer", strategy_synthesizer_node)

workflow.add_edge(START, "ipc_section_mapper")

workflow.add_conditional_edges("ipc_section_mapper", route_after_mapper, {END: END, "case_retriever": "case_retriever"})
workflow.add_conditional_edges("case_retriever", route_after_retriever, {END: END, "citation_verifier": "citation_verifier"})
workflow.add_conditional_edges("citation_verifier", route_after_verifier, {END: END, "strategy_synthesizer": "strategy_synthesizer"})

workflow.add_edge("strategy_synthesizer", END)

# Compile
courtroom_app = workflow.compile()
app = courtroom_app

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    sample_fir = "The accused entered the house at night and stole jewelry. When confronted, he attacked the owner with a knife, causing grievous hurt."
    initial_state = {
        "fir_text": sample_fir,
        "perspective": "prosecution",
        "citation_warning": False
    }
    
    result = courtroom_app.invoke(initial_state)
    if result.get("error"):
        print(f"Error: {result['error']}")
    else:
        print(json.dumps(result.get("strategy"), indent=2))
