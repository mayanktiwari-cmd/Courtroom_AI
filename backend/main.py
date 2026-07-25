"""
CourtroomAI — FastAPI Backend
AI co-pilot for Indian advocates.

Endpoints:
  POST /api/analyze  — FIR → legal strategy (main pipeline)
  POST /api/verify   — standalone citation verification
  POST /api/upload   — PDF upload + parsing
  GET  /api/health   — system health check
"""

import os
import time
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Track server start time for uptime reporting
_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Pre-load heavy models on startup so first request isn't slow.
    This runs once when the server starts.
    """
    print("[SERVER] Starting CourtroomAI backend...")
    print("[SERVER] Pre-loading models (this takes ~30s on first run)...")

    # Pre-warm the retriever (loads embedding model + Chroma + BM25 index)
    try:
        from agent.tools import get_retriever, get_reranker
        get_retriever()
        get_reranker()
        print("[SERVER] Models loaded successfully.")
    except Exception as e:
        print(f"[SERVER] Warning: Could not pre-load models: {e}")
        print("[SERVER] Models will load on first request instead.")

    yield  # Server is running

    print("[SERVER] Shutting down CourtroomAI backend.")


# ─────────────────────────────────────────────
# App initialization
# ─────────────────────────────────────────────
app = FastAPI(
    title="CourtroomAI",
    description=(
        "AI co-pilot for Indian advocates. Takes a FIR or legal notice as input, "
        "retrieves verified precedents from Indian Kanoon, identifies IPC sections, "
        "and generates a structured case strategy with citation verification."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternate dev port
        "https://*.vercel.app",   # Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Include routers
# ─────────────────────────────────────────────
from backend.routers.analyze import router as analyze_router
from backend.routers.verify import router as verify_router
from backend.routers.upload import router as upload_router

app.include_router(analyze_router)
app.include_router(verify_router)
app.include_router(upload_router)


# ─────────────────────────────────────────────
# Health check (inline — too simple for its own router)
# ─────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check — returns vector count and uptime."""
    import chromadb

    vector_count = 0
    raw_doc_count = 0

    try:
        client = chromadb.PersistentClient(path="data/chroma_db")
        collection = client.get_collection("courtroom_judgments")
        vector_count = collection.count()
    except Exception:
        pass

    try:
        raw_doc_count = len(list(Path("data/raw").glob("*.json")))
    except Exception:
        pass

    return {
        "status": "healthy",
        "vector_count": vector_count,
        "raw_documents": raw_doc_count,
        "uptime_seconds": round(time.time() - _start_time, 1),
    }


# ─────────────────────────────────────────────
# Root redirect
# ─────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {
        "app": "CourtroomAI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
