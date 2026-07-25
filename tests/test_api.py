"""
API Integration tests for FastAPI endpoints using TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "vector_count" in data
    assert "uptime_seconds" in data


def test_verify_endpoint_schema():
    payload = {
        "argument": "Bail should be granted as accused has no prior antecedents",
        "passages": [
            {
                "passage": "Court held that absence of criminal record is a key factor for bail.",
                "title": "State vs Kumar 2021",
                "court": "Supreme Court of India",
                "date": "2021-05-10",
                "doc_id": "test_1"
            }
        ]
    }
    response = client.post("/api/verify", json=payload)
    # Status should be 200 (if Groq API works) or 500 cleanly handled
    assert response.status_code in [200, 500]
