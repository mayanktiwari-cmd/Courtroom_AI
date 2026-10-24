"""
POST /api/analyze — Main pipeline endpoint.
FIR text → LangGraph agent → structured legal strategy.
"""

import time
import json
import traceback

from fastapi import APIRouter, HTTPException

from backend.models.request_models import AnalyzeRequest
from backend.models.response_models import AnalyzeResponse, ErrorResponse

router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post(
    "/analyze",
    responses={500: {"model": ErrorResponse}},
    summary="Analyze a FIR and generate legal strategy",
    description="Takes FIR text or case description, runs the full pipeline "
                "(IPC mapping → case retrieval → citation verification → strategy synthesis), "
                "and returns a structured legal strategy with verified precedents.",
)
@router.post("/analyze/", include_in_schema=False)
async def analyze_case(request: AnalyzeRequest):
    """
    Main pipeline endpoint.

    1. Receives FIR text + perspective (defense/prosecution)
    2. Runs the LangGraph agent which orchestrates:
       - IPC section mapping
       - Case retrieval (BM25 + dense)
       - Citation verification (LLM-as-judge)
       - Strategy synthesis
    3. Returns structured strategy with verified citations
    """
    start_time = time.time()

    try:
        from agent.graph import courtroom_app

        state = {
            "fir_text": request.fir_text,
            "perspective": request.perspective,
            "citation_warning": False,
        }
        result = courtroom_app.invoke(state)

        if result.get("error"):
            raise HTTPException(
                status_code=500,
                detail=result["error"],
            )

        return result.get("strategy", {})

    except HTTPException:
        raise
    except Exception as e:
        processing_time = round(time.time() - start_time, 2)
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(e),
                "detail": traceback.format_exc(),
                "processing_time": processing_time,
            }
        )


@router.get("/analyze", include_in_schema=False)
@router.get("/analyze/", include_in_schema=False)
async def analyze_get_info():
    """Fallback handler to prevent 405 if a proxy or redirect downgrades POST to GET."""
    return {
        "status": "endpoint_active",
        "message": "POST method required. Send JSON with 'fir_text' and 'perspective' ('defense' or 'prosecution')."
    }
