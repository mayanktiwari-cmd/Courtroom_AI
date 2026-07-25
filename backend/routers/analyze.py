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
    response_model=AnalyzeResponse,
    responses={500: {"model": ErrorResponse}},
    summary="Analyze a FIR and generate legal strategy",
    description="Takes FIR text or case description, runs the full pipeline "
                "(IPC mapping → case retrieval → citation verification → strategy synthesis), "
                "and returns a structured legal strategy with verified precedents.",
)
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
        from agent.graph import run_analysis

        result = run_analysis(
            fir_text=request.fir_text,
            perspective=request.perspective,
        )

        processing_time = round(time.time() - start_time, 2)

        # Try to parse strategy JSON from the final response
        strategy = {}
        ipc_sections = []
        verified_citations = []

        raw_response = result.get("final_response", "")

        # Extract JSON blocks from the response if present
        try:
            # The agent's final response often contains embedded JSON
            if "{" in raw_response:
                json_start = raw_response.index("{")
                json_end = raw_response.rindex("}") + 1
                strategy = json.loads(raw_response[json_start:json_end])
        except (json.JSONDecodeError, ValueError):
            # If we can't parse JSON, the raw_response is the strategy text
            strategy = {"raw_text": raw_response}

        return AnalyzeResponse(
            success=True,
            strategy=strategy,
            ipc_sections=ipc_sections,
            verified_citations=verified_citations,
            raw_response=raw_response,
            processing_time=processing_time,
            num_steps=result.get("num_steps", 0),
        )

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
