import json
import logging
from typing import List, Optional, Literal, TypedDict, Dict, Any

from langgraph.graph import StateGraph, START, END
from langchain_core.documents import Document

from agent.prompts import (
    IPC_MAPPER_PROMPT,
    STRATEGY_SYNTHESIZER_PROMPT
)
from agent.tools import get_llm, get_retriever, get_reranker, get_verifier

logger = logging.getLogger(__name__)

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
        client = get_llm()
        prompt = IPC_MAPPER_PROMPT.format(case_description=state["fir_text"])
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=4000,
        )
        content = response.choices[0].message.content.strip()
        print(f"DEBUG LLM OUTPUT: {content}")
        
        # Groq sometimes wraps json in ```json ... ```
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        data = json.loads(content)
        sections = data.get("sections", [])
        
        if not sections:
            return {"error": "Failed to map any IPC sections from the FIR text."}
            
        return {"ipc_sections": sections}
    except Exception as e:
        logger.error(f"Error in ipc_section_mapper: {e}")
        return {"error": f"Error in ipc_section_mapper: {str(e)}"}


def case_retriever_node(state: GraphState) -> GraphState:
    logger.info("Executing node: case_retriever")
    try:
        sections = state.get("ipc_sections", [])
        if not sections:
            return {"error": "No IPC sections found to build query."}
            
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
        
        # Take top 5
        top_docs = reranked_docs[:5]
        
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
        
        verifier = get_verifier()
        
        # Convert dicts back to Documents
        docs = [
            Document(page_content=d["passage"], metadata=d) 
            for d in retrieved_docs
        ]
        
        results = verifier.verify_batch(argument, docs, min_confidence=0.6)
        
        # Step 1 — Lower confidence threshold on retry
        if not results:
            logger.info("0 citations verified at min_confidence=0.6. Retrying with min_confidence=0.4...")
            results = verifier.verify_batch(argument, docs, min_confidence=0.4)
        
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
            
        # Step 2 — If still 0 after retry, do NOT error out
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
        client = get_llm()
        
        prompt = STRATEGY_SYNTHESIZER_PROMPT.format(
            case_facts=state["fir_text"],
            ipc_sections=json.dumps(state.get("ipc_sections", []), indent=2),
            verified_citations=json.dumps(state.get("verified_citations", []), indent=2),
            perspective=state["perspective"]
        )
        
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=4000,
        )
        content = response.choices[0].message.content.strip()
        
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        strategy = json.loads(content)
        
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
