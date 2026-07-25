"""
POST /api/verify — Standalone citation verification endpoint.
Lets users re-verify individual citations outside the main pipeline.
"""

import json
from fastapi import APIRouter, HTTPException

from langchain_core.documents import Document

from backend.models.request_models import VerifyRequest
from backend.models.response_models import VerifyResponse, ErrorResponse

router = APIRouter(prefix="/api", tags=["Verification"])


@router.post(
    "/verify",
    response_model=VerifyResponse,
    responses={500: {"model": ErrorResponse}},
    summary="Verify citations against a legal argument",
    description="Takes a legal argument and a list of judgment passages, "
                "verifies each passage using LLM-as-judge pattern. "
                "Returns only verified citations with confidence scores.",
)
async def verify_citations(request: VerifyRequest):
    """
    Standalone citation verification.
    Useful for:
    - Re-checking citations after editing an argument
    - Verifying user-provided case references
    - Batch verification of multiple passages
    """
    try:
        from rag.citation_verifier import CitationVerifier

        verifier = CitationVerifier()

        # Convert request passages to LangChain Documents
        documents = [
            Document(
                page_content=p.passage,
                metadata={
                    "title": p.title,
                    "court": p.court,
                    "date": p.date,
                    "doc_id": p.doc_id,
                }
            )
            for p in request.passages
        ]

        results = verifier.verify_batch(request.argument, documents)

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

        total_rejected = len(documents) - len(verified)

        return VerifyResponse(
            success=True,
            results=verified,
            total_verified=len(verified),
            total_rejected=total_rejected,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": str(e)},
        )
