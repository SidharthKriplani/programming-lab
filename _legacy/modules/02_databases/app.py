"""
Module 2: Databases & Performance
Main application with SQLite and async queries

Demonstrates:
- Database schema design
- Query optimization vs unoptimized queries
- Connection pooling
- Performance comparison
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import aiosqlite
import asyncio
import time
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title="Production Systems Lab - Module 2",
    description="Learn database design and performance optimization",
    version="0.2.0"
)

# ============================================================================
# Data Models
# ============================================================================

class UserCreate(BaseModel):
    """Create a new user"""
    name: str
    email: str


class UserResponse(BaseModel):
    """User response"""
    id: int
    name: str
    email: str
    created_at: str


class PostCreate(BaseModel):
    """Create a new post"""
    user_id: int
    title: str
    content: str


class PostResponse(BaseModel):
    """Post response"""
    id: int
    user_id: int
    title: str
    content: str
    created_at: str


class UserWithPostsResponse(BaseModel):
    """User with all their posts"""
    id: int
    name: str
    email: str
    posts: List[PostResponse]


# ============================================================================
# Database Initialization
# ============================================================================

DATABASE = "modules/02_databases/blog.db"


async def init_db():
    """Initialize database with schema"""
    async with aiosqlite.connect(DATABASE) as db:
        # Create users table with indexes
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create index on email for fast lookups
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
        """)

        # Create posts table with foreign key
        await db.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create index on user_id for fast lookups
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
        """)

        await db.commit()
        logger.info("✓ Database initialized")


@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    await init_db()


# ============================================================================
# Unoptimized Queries (N+1 Problem)
# ============================================================================

async def get_users_with_posts_slow(limit: int = 10):
    """
    SLOW: N+1 problem
    - 1 query to get all users
    - N queries to get posts for each user
    Total: 1 + N queries
    """
    async with aiosqlite.connect(DATABASE) as db:
        # Query 1: Get all users
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT id, name, email, created_at FROM users LIMIT ?", (limit,))
        users = await cursor.fetchall()

        result = []
        for user in users:
            # Query N: Get posts for this user (N queries total)
            cursor = await db.execute(
                "SELECT id, user_id, title, content, created_at FROM posts WHERE user_id = ?",
                (user["id"],)
            )
            posts = await cursor.fetchall()
            result.append({
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "posts": [dict(p) for p in posts]
            })

        return result


async def get_users_with_posts_fast(limit: int = 10):
    """
    FAST: Single join query
    - 1 query to get users with posts
    - Database handles the join
    Total: 1 query
    """
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT
                u.id, u.name, u.email, u.created_at,
                p.id as post_id, p.title, p.content, p.created_at as post_created_at
            FROM users u
            LEFT JOIN posts p ON u.id = p.user_id
            LIMIT ?
        """, (limit,))
        rows = await cursor.fetchall()

        # Process results into nested structure
        users_dict = {}
        for row in rows:
            user_id = row["id"]
            if user_id not in users_dict:
                users_dict[user_id] = {
                    "id": row["id"],
                    "name": row["name"],
                    "email": row["email"],
                    "posts": []
                }

            if row["post_id"]:
                users_dict[user_id]["posts"].append({
                    "id": row["post_id"],
                    "user_id": user_id,
                    "title": row["title"],
                    "content": row["content"],
                    "created_at": row["post_created_at"]
                })

        return list(users_dict.values())


# ============================================================================
# Database Operations
# ============================================================================

async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email (uses index)"""
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, name, email, created_at FROM users WHERE email = ?",
            (email,)
        )
        user = await cursor.fetchone()
        return dict(user) if user else None


async def create_user(name: str, email: str) -> dict:
    """Create a new user"""
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (name, email)
        )
        await db.commit()
        user_id = cursor.lastrowid

        # Return the created user
        cursor = await db.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        db.row_factory = aiosqlite.Row
        user = await cursor.fetchone()
        return dict(user)


async def create_post(user_id: int, title: str, content: str) -> dict:
    """Create a new post"""
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
            (user_id, title, content)
        )
        await db.commit()
        post_id = cursor.lastrowid

        # Return the created post
        cursor = await db.execute(
            "SELECT id, user_id, title, content, created_at FROM posts WHERE id = ?",
            (post_id,)
        )
        db.row_factory = aiosqlite.Row
        post = await cursor.fetchone()
        return dict(post)


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "module": "Databases & Performance",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/users", response_model=UserResponse)
async def create_user_endpoint(user: UserCreate):
    """Create a new user"""
    try:
        result = await create_user(user.name, user.email)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/users/by-email/{email}", response_model=UserResponse)
async def get_user_by_email_endpoint(email: str):
    """
    Get user by email (uses index for fast lookup)

    This demonstrates indexed query performance.
    """
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/posts", response_model=PostResponse)
async def create_post_endpoint(post: PostCreate):
    """Create a new post"""
    try:
        result = await create_post(post.user_id, post.title, post.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/comparison/slow")
async def compare_slow():
    """
    Get users with posts using SLOW approach (N+1 problem)

    This endpoint demonstrates the N+1 problem:
    - 1 query to get users
    - N queries to get each user's posts
    Total queries: 1 + N
    """
    start = time.time()
    result = await get_users_with_posts_slow(limit=5)
    elapsed = time.time() - start

    return {
        "approach": "slow (N+1)",
        "users_count": len(result),
        "posts_count": sum(len(u.get("posts", [])) for u in result),
        "time_seconds": elapsed,
        "note": "1 + N database queries"
    }


@app.get("/comparison/fast")
async def compare_fast():
    """
    Get users with posts using FAST approach (single join)

    This endpoint demonstrates efficient querying:
    - 1 query with JOIN to get users and posts
    Total queries: 1
    """
    start = time.time()
    result = await get_users_with_posts_fast(limit=5)
    elapsed = time.time() - start

    return {
        "approach": "fast (join)",
        "users_count": len(result),
        "posts_count": sum(len(u.get("posts", [])) for u in result),
        "time_seconds": elapsed,
        "note": "1 database query with JOIN"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Module 2: Databases & Performance",
        "documentation": "/docs",
        "endpoints": {
            "create_user": "POST /users",
            "get_user_by_email": "GET /users/by-email/{email}",
            "create_post": "POST /posts",
            "compare_slow": "GET /comparison/slow (N+1 problem)",
            "compare_fast": "GET /comparison/fast (optimized join)"
        },
        "instructions": "Try the comparison endpoints to see query performance differences"
    }


# ============================================================================
# Seed Database (for testing)
# ============================================================================

@app.post("/seed")
async def seed_database():
    """
    Seed the database with test data

    Creates 5 users with 3 posts each.
    """
    try:
        users_data = [
            ("Alice", "alice@example.com"),
            ("Bob", "bob@example.com"),
            ("Charlie", "charlie@example.com"),
            ("Diana", "diana@example.com"),
            ("Eve", "eve@example.com"),
        ]

        async with aiosqlite.connect(DATABASE) as db:
            # Clear existing data
            await db.execute("DELETE FROM posts")
            await db.execute("DELETE FROM users")

            # Create users and posts
            user_count = 0
            post_count = 0

            for name, email in users_data:
                cursor = await db.execute(
                    "INSERT INTO users (name, email) VALUES (?, ?)",
                    (name, email)
                )
                user_id = cursor.lastrowid
                user_count += 1

                # Create 3 posts for each user
                for i in range(3):
                    await db.execute(
                        "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)",
                        (user_id, f"{name}'s Post {i+1}", f"This is post {i+1} by {name}")
                    )
                    post_count += 1

            await db.commit()

        return {
            "status": "success",
            "users_created": user_count,
            "posts_created": post_count,
            "next_step": "Try /comparison/slow and /comparison/fast to see the difference"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    print("""
    ╔════════════════════════════════════════════════════════════════╗
    ║   Production Systems Lab - Module 2: Databases & Performance  ║
    ║                                                                ║
    ║   Starting API server...                                       ║
    ║   Visit http://localhost:8000/docs for interactive docs       ║
    ║                                                                ║
    ║   First, seed the database:                                    ║
    ║   POST http://localhost:8000/seed                             ║
    ║                                                                ║
    ║   Then compare query performance:                              ║
    ║   GET  http://localhost:8000/comparison/slow                  ║
    ║   GET  http://localhost:8000/comparison/fast                  ║
    ║                                                                ║
    ║   Watch the time_seconds values - see the difference!         ║
    ╚════════════════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
