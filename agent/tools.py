"""
LangGraph Tool Definitions for CourtroomAI.
4 tools — each a discrete capability the agent can call.
Tools are stateless functions; state lives in the LangGraph graph.
"""

import os
import json
from typing import List
from langchain_core.documents import Document
from langchain_core.tools import tool
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# These get initialized once and reused — don't re-load models on every call
_retriever = None
_reranker = None
_verifier = None
_llm_client = None


def get_retriever():
    global _retriever
    if _retriever is None:
        from rag.hybrid_retriever import LegalHybridRetriever
        _retriever = LegalHybridRetriever()
    return _retriever


def get_reranker():
    global _reranker
    if _reranker is None:
        from rag.reranker import LegalReranker
        _reranker = LegalReranker(top_n=5)
    return _reranker


def get_verifier():
    global _verifier
    if _verifier is None:
        from rag.citation_verifier import CitationVerifier
        _verifier = CitationVerifier()
    return _verifier


def get_llm():
    global _llm_client
    if _llm_client is None:
        _llm_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _llm_client


# ─────────────────────────────────────────────
# TOOL 1: Case Retriever
# ─────────────────────────────────────────────
@tool
def case_retriever(query: str) -> str:
    """
    Retrieve relevant legal judgments from the database for a given legal query.
    Use this when you need to find precedents, case law, or judgment citations.
    Input: natural language legal query
    Output: JSON list of relevant judgment passages with metadata
    """
    retriever = get_retriever()
    reranker = get_reranker()

    raw_docs = retriever.retrieve(query)
    reranked_docs = reranker.rerank(query, raw_docs)

    results = []
    for doc in reranked_docs:
        results.append({
            "title": doc.metadata.get("title", "Unknown"),
            "court": doc.metadata.get("court", "Unknown"),
            "date": doc.metadata.get("date", "Unknown"),
            "doc_id": doc.metadata.get("doc_id", ""),
            "passage": doc.page_content[:600],
            "reranker_score": doc.metadata.get("reranker_score", 0.0),
        })

    return json.dumps(results, indent=2)


# ─────────────────────────────────────────────
# TOOL 2: IPC Section Mapper
# ─────────────────────────────────────────────
@tool
def ipc_section_mapper(case_description: str) -> str:
    """
    Identify relevant IPC sections and legal provisions from a case description or FIR text.
    Use this first when analyzing a new case to understand what legal sections apply.
    Input: FIR text or case description
    Output: JSON list of relevant sections with plain English explanation
    """
    prompt = f"""You are an expert Indian criminal lawyer.
    
Analyze this case description and identify ALL relevant legal sections:
{case_description}

For each relevant section, provide:
1. Section number and act (e.g., "IPC 302", "CRPC 41A")
2. Plain English explanation of what it covers
3. Whether it applies to prosecution or defense
4. Maximum punishment (if criminal)

Respond ONLY in this JSON format:
{{
    "sections": [
        {{
            "section": "IPC 302",
            "title": "Murder",
            "explanation": "Punishment for murder — death or life imprisonment",
            "applies_to": "prosecution",
            "max_punishment": "Death or Life Imprisonment + Fine"
        }}
    ],
    "case_type": "Criminal / Civil / Corporate",
    "primary_charge": "most serious charge identified"
}}"""

    client = get_llm()
    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",  # use 70B for legal reasoning accuracy
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=800,
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────
# TOOL 3: Citation Verifier
# ─────────────────────────────────────────────
@tool
def citation_verifier(argument_and_passages_json: str) -> str:
    """
    Verify that retrieved judgment passages genuinely support a legal argument.
    ALWAYS use this before including any citation in the final strategy.
    Input: JSON with 'argument' (string) and 'passages' (list of passage dicts from case_retriever)
    Output: JSON list of only VERIFIED citations with confidence scores
    """
    verifier = get_verifier()

    try:
        data = json.loads(argument_and_passages_json)
        argument = data["argument"]
        passages = data["passages"]
    except (json.JSONDecodeError, KeyError) as e:
        return json.dumps({"error": f"Invalid input format: {e}"})

    # Convert passage dicts back to Documents for verifier
    documents = [
        Document(
            page_content=p["passage"],
            metadata={
                "title": p.get("title", ""),
                "court": p.get("court", ""),
                "date": p.get("date", ""),
                "doc_id": p.get("doc_id", ""),
            }
        )
        for p in passages
    ]

    results = verifier.verify_batch(argument, documents)

    verified = []
    for r in results:
        verified.append({
            "verdict": r.verdict,
            "confidence": r.confidence,
            "reason": r.reason,
            "title": r.doc_metadata.get("title", ""),
            "court": r.doc_metadata.get("court", ""),
            "date": r.doc_metadata.get("date", ""),
            "passage_preview": r.passage[:200],
        })

    return json.dumps({"verified_citations": verified, "total_verified": len(verified)}, indent=2)


# ─────────────────────────────────────────────
# TOOL 4: Strategy Synthesizer
# ─────────────────────────────────────────────
@tool
def strategy_synthesizer(context_json: str) -> str:
    """
    Generate a structured legal strategy from verified citations and IPC sections.
    Use this as the FINAL step after case_retriever → citation_verifier → ipc_section_mapper.
    Input: JSON with 'case_facts', 'ipc_sections', 'verified_citations', 'perspective' (defense/prosecution)
    Output: Complete structured legal strategy
    """
    try:
        context = json.loads(context_json)
    except json.JSONDecodeError as e:
        return json.dumps({"error": f"Invalid input: {e}"})

    prompt = f"""You are a senior Indian advocate with 20 years of experience.

CASE FACTS:
{context.get('case_facts', 'Not provided')}

RELEVANT IPC SECTIONS:
{json.dumps(context.get('ipc_sections', []), indent=2)}

VERIFIED PRECEDENTS (citations already verified — use these confidently):
{json.dumps(context.get('verified_citations', []), indent=2)}

PERSPECTIVE: {context.get('perspective', 'defense').upper()}

Generate a complete legal strategy. Structure your response as JSON:
{{
    "executive_summary": "2-3 sentence case overview",
    "key_legal_issues": ["issue 1", "issue 2"],
    "primary_arguments": [
        {{
            "argument": "argument text",
            "supporting_citation": "case name if applicable",
            "strength": "Strong / Medium / Weak"
        }}
    ],
    "counter_arguments_to_anticipate": ["counter 1", "counter 2"],
    "recommended_next_steps": ["step 1", "step 2"],
    "overall_case_strength": "Strong / Medium / Weak",
    "risk_factors": ["risk 1", "risk 2"]
}}"""

    client = get_llm()
    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1500,
    )
    return response.choices[0].message.content.strip()


# Export all tools as a list for LangGraph
ALL_TOOLS = [case_retriever, ipc_section_mapper, citation_verifier, strategy_synthesizer]
