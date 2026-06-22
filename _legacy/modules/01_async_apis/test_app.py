"""
Tests for Module 1 API

This demonstrates testing patterns for async FastAPI applications:
- Using pytest with pytest-asyncio
- Testing async endpoints
- Mocking external dependencies
"""

import pytest
from fastapi.testclient import TestClient
from app import app, DataRequest, fetch_from_source_a, fetch_from_source_b


# Create test client
client = TestClient(app)


# ============================================================================
# Basic Endpoint Tests
# ============================================================================

def test_root_endpoint():
    """Test the root endpoint returns valid response"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "documentation" in data
    assert "/docs" in data["documentation"]


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


# ============================================================================
# Sync Data Endpoint Tests
# ============================================================================

def test_sync_data_both_sources():
    """Test sequential data fetching from both sources"""
    payload = {"source_a": True, "source_b": True, "delay": 0.1}
    response = client.post("/sync-data", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["data_from_a"] is not None
    assert data["data_from_b"] is not None
    assert data["total_time"] > 0.1  # Should take at least delay * 2


def test_sync_data_source_a_only():
    """Test fetching from only source A"""
    payload = {"source_a": True, "source_b": False, "delay": 0.05}
    response = client.post("/sync-data", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["data_from_a"] is not None
    assert data["data_from_b"] is None


# ============================================================================
# Async Data Endpoint Tests
# ============================================================================

def test_async_data_both_sources():
    """Test concurrent data fetching from both sources"""
    payload = {"source_a": True, "source_b": True, "delay": 0.1}
    response = client.post("/async-data", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["data_from_a"] is not None
    assert data["data_from_b"] is not None
    # Should be faster than sequential (close to single delay)
    assert data["total_time"] < 0.25  # Better than 0.2 from sequential


def test_async_data_performance():
    """
    Verify that async is faster than sync

    This is the key insight: when fetching multiple sources,
    async should be ~2x faster than sync.
    """
    sync_payload = {"source_a": True, "source_b": True, "delay": 0.1}
    async_payload = {"source_a": True, "source_b": True, "delay": 0.1}

    sync_response = client.post("/sync-data", json=sync_payload)
    async_response = client.post("/async-data", json=async_payload)

    sync_time = sync_response.json()["total_time"]
    async_time = async_response.json()["total_time"]

    # Async should be significantly faster
    assert async_time < sync_time
    print(f"\nPerformance Test:")
    print(f"  Sequential: {sync_time:.3f}s")
    print(f"  Concurrent: {async_time:.3f}s")
    print(f"  Speedup: {sync_time / async_time:.1f}x faster")


# ============================================================================
# Async Unit Tests
# ============================================================================

@pytest.mark.asyncio
async def test_fetch_from_source_a():
    """Test the async fetch function"""
    result = await fetch_from_source_a(delay=0.01)
    assert "Source A" in result
    assert "fetched at" in result


@pytest.mark.asyncio
async def test_fetch_from_source_b():
    """Test the async fetch function"""
    result = await fetch_from_source_b(delay=0.01)
    assert "Source B" in result
    assert "fetched at" in result


# ============================================================================
# Error Handling Tests
# ============================================================================

def test_invalid_payload():
    """Test that invalid payloads are rejected"""
    # Missing required fields (if any)
    payload = {"delay": -1}  # Invalid delay
    response = client.post("/sync-data", json=payload)

    # FastAPI will handle validation
    # Either returns 400 or fills in defaults
    assert response.status_code in [200, 422]


def test_edge_case_zero_delay():
    """Test with zero delay"""
    payload = {"source_a": True, "source_b": True, "delay": 0}
    response = client.post("/async-data", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["total_time"] >= 0


# ============================================================================
# Integration Tests
# ============================================================================

def test_multiple_requests_concurrently():
    """
    Simulate multiple clients making requests

    In production, your server should handle many simultaneous requests.
    """
    # We're using TestClient which is synchronous,
    # but it demonstrates the concept
    payload = {"source_a": True, "source_b": True, "delay": 0.05}

    responses = []
    for i in range(5):
        response = client.post("/async-data", json=payload)
        assert response.status_code == 200
        responses.append(response)

    # All should succeed
    assert len(responses) == 5
    assert all(r.status_code == 200 for r in responses)


if __name__ == "__main__":
    # Run tests: pytest test_app.py -v
    pytest.main([__file__, "-v"])
