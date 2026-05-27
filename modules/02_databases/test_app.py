"""
Tests for Module 2: Databases & Performance

Demonstrates testing patterns for async database operations.
"""

import pytest
from fastapi.testclient import TestClient
import aiosqlite
import os

# Import the app
from app import app

# Create test client
client = TestClient(app)

# Use a test database
TEST_DB = "test_blog.db"


@pytest.fixture(autouse=True)
def cleanup():
    """Clean up test database before and after each test"""
    # Remove test DB if it exists
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    yield
    # Clean up after test
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


# ============================================================================
# Basic Endpoint Tests
# ============================================================================

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "documentation" in data
    assert "endpoints" in data


# ============================================================================
# User Management Tests
# ============================================================================

def test_create_user():
    """Test creating a user"""
    response = client.post("/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"
    assert data["email"] == "alice@example.com"
    assert data["id"] is not None


def test_create_duplicate_email():
    """Test that duplicate emails are rejected"""
    # Create first user
    client.post("/users", json={
        "name": "Alice",
        "email": "alice@example.com"
    })

    # Try to create user with same email
    response = client.post("/users", json={
        "name": "Alice 2",
        "email": "alice@example.com"
    })
    assert response.status_code == 400


def test_get_user_by_email():
    """Test getting user by email (uses index)"""
    # Create user
    client.post("/users", json={
        "name": "Bob",
        "email": "bob@example.com"
    })

    # Get user by email
    response = client.get("/users/by-email/bob@example.com")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Bob"
    assert data["email"] == "bob@example.com"


def test_get_nonexistent_user():
    """Test getting user that doesn't exist"""
    response = client.get("/users/by-email/nonexistent@example.com")
    assert response.status_code == 404


# ============================================================================
# Post Management Tests
# ============================================================================

def test_create_post():
    """Test creating a post"""
    # Create user first
    user_response = client.post("/users", json={
        "name": "Charlie",
        "email": "charlie@example.com"
    })
    user_id = user_response.json()["id"]

    # Create post
    response = client.post("/posts", json={
        "user_id": user_id,
        "title": "First Post",
        "content": "This is my first post"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "First Post"
    assert data["user_id"] == user_id


def test_create_post_invalid_user():
    """Test creating post for non-existent user"""
    response = client.post("/posts", json={
        "user_id": 999,
        "title": "Invalid Post",
        "content": "This should fail"
    })
    assert response.status_code == 400


# ============================================================================
# Seed Database Tests
# ============================================================================

def test_seed_database():
    """Test seeding the database"""
    response = client.post("/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["users_created"] == 5
    assert data["posts_created"] == 15  # 5 users × 3 posts


# ============================================================================
# Query Comparison Tests
# ============================================================================

def test_comparison_endpoints_exist():
    """Test that comparison endpoints exist and return data"""
    # Seed database first
    client.post("/seed")

    # Test slow endpoint
    response = client.get("/comparison/slow")
    assert response.status_code == 200
    data = response.json()
    assert "time_seconds" in data
    assert data["approach"] == "slow (N+1)"

    # Test fast endpoint
    response = client.get("/comparison/fast")
    assert response.status_code == 200
    data = response.json()
    assert "time_seconds" in data
    assert data["approach"] == "fast (join)"


def test_comparison_data_consistency():
    """Test that both approaches return same data"""
    # Seed database
    client.post("/seed")

    # Get results from both approaches
    slow_response = client.get("/comparison/slow")
    fast_response = client.get("/comparison/fast")

    slow_data = slow_response.json()
    fast_data = fast_response.json()

    # Should have same counts
    assert slow_data["users_count"] == fast_data["users_count"]
    assert slow_data["posts_count"] == fast_data["posts_count"]


# ============================================================================
# Performance Characteristics
# ============================================================================

def test_fast_approach_faster_than_slow():
    """
    Test that optimized query (join) is faster than N+1 approach

    This demonstrates the practical impact of good database design.
    Note: With SQLite in-memory, the difference might be small, but
    with real databases and network latency, the difference is huge.
    """
    # Seed with more data
    client.post("/seed")

    # Get timing from both approaches
    slow_response = client.get("/comparison/slow")
    fast_response = client.get("/comparison/fast")

    slow_time = slow_response.json()["time_seconds"]
    fast_time = fast_response.json()["time_seconds"]

    # Fast should be faster or equal (might be equal on small dataset)
    assert fast_time <= slow_time


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
