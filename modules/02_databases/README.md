# Module 2: Databases & Performance

## Overview

You learned async in Module 1. Now: **What are you making async calls to?**

The database.

A poorly designed database will block your async API, waste resources, and kill performance. A well-designed one will handle 10,000 concurrent requests with ease.

**In this module, you'll learn:**
- How databases work under the hood
- Why query optimization matters (10x performance gains)
- Indexing strategies
- Connection pooling
- Caching patterns
- How to measure database performance

---

## The Problem

```python
# Module 1: You wrote this
async def get_user_data(user_id: int):
    result = await fetch_from_db(user_id)  # How fast is this?
    return result
```

**The question:** How do you make that database call 100x faster?

Answer: You can't optimize async further. You optimize the **database query itself**.

---

## Why This Matters

Database performance directly affects:
- **Response time** — How fast your API responds to users
- **Throughput** — How many concurrent requests you can handle
- **Cost** — Fewer resources needed = lower cloud bills
- **Scale** — The difference between 100 req/s and 10,000 req/s

**Real numbers:**
- Unoptimized query: 500ms per request
- Same query, optimized: 10ms per request
- 50x faster. Same code, different database design.

---

## Database Design Principles

### 1. Schema Design
```sql
-- ❌ BAD: No indexes, poor structure
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT,
    created_at TEXT
);

-- ✅ GOOD: Indexes, types, constraints
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### 2. Query Optimization
```sql
-- ❌ SLOW: No index, full table scan
SELECT * FROM users WHERE email = 'user@example.com';

-- ✅ FAST: Uses index
SELECT * FROM users WHERE email = 'user@example.com';
-- (with index on email column)
```

### 3. N+1 Problem
```python
# ❌ SLOW: Queries in a loop (1 + N queries)
users = await db.query("SELECT * FROM users")
for user in users:
    orders = await db.query(f"SELECT * FROM orders WHERE user_id = {user.id}")

# ✅ FAST: Join in one query
users_with_orders = await db.query("""
    SELECT u.*, o.* FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
""")
```

### 4. Connection Pooling
```python
# ❌ SLOW: Create new connection per query
conn = sqlite3.connect("db.sqlite")
result = conn.execute("SELECT * FROM users")
conn.close()

# ✅ FAST: Reuse connections
pool = ConnectionPool(max_size=10)
result = await pool.execute("SELECT * FROM users")
# Connection returned to pool automatically
```

---

## Architecture: Request to Database

```
Client Request
    ↓
FastAPI Endpoint (async)
    ↓
Connection Pool (reuse connections)
    ↓
Database Query (optimized)
    ├─ Index? (fast lookup)
    ├─ Join? (avoid N+1)
    └─ Cache? (skip DB entirely)
    ↓
Result to Cache (Redis)
    ↓
Response to Client
```

---

## Performance Testing

**Question:** How do you know if your database is fast?

**Answer:** Measure it.

```python
import time

# Slow query
start = time.time()
result = await db.query("SELECT * FROM users WHERE created_at > ?", (date,))
slow_time = time.time() - start

# Optimized query
start = time.time()
result = await db.query("""
    SELECT * FROM users 
    WHERE created_at > ? 
    AND id IN (SELECT user_id FROM orders)
""", (date,))
fast_time = time.time() - start

print(f"Slow: {slow_time:.3f}s")
print(f"Fast: {fast_time:.3f}s")
print(f"Speedup: {slow_time / fast_time:.1f}x")
```

---

## Exercises

### Exercise 1: Schema Design
Design a database for a social media app (users, posts, comments, likes).

**File:** `exercises/01_schema_design.py`

### Exercise 2: Query Optimization
Write a query that avoids N+1 problems.

**File:** `exercises/02_query_optimization.py`

### Exercise 3: Indexing Strategy
Add indexes to make slow queries fast.

**File:** `exercises/03_indexing.py`

### Exercise 4: Connection Pooling
Implement connection reuse.

**File:** `exercises/04_connection_pooling.py`

### Exercise 5: Performance Benchmarking
Measure and compare query speeds.

**File:** `exercises/05_benchmarking.py`

---

## Capstone: Blog API with Database

Build an async API for a blog:
- Create, read, update, delete posts
- Proper indexes for common queries
- Test with load testing (see Module 1 patterns)

**File:** `capstone/blog_api.py`

---

## Key Takeaways

1. **Async only helps I/O** — Good database queries are still critical
2. **Index your queries** — 10-100x performance gains
3. **Avoid N+1** — One join beats many queries
4. **Connection pooling** — Reuse connections, don't recreate them
5. **Measure everything** — You can't optimize what you don't measure

---

## Common Mistakes

❌ **Selecting all columns when you need one**
```python
# Bad
result = await db.query("SELECT * FROM users")
name = result[0]['name']

# Good
result = await db.query("SELECT name FROM users WHERE id = ?", (user_id,))
name = result[0]['name']
```

❌ **No indexes on commonly filtered columns**
```python
# Bad schema
CREATE TABLE users (email TEXT);
SELECT * FROM users WHERE email = ?;  # Full table scan!

# Good schema
CREATE TABLE users (email TEXT);
CREATE INDEX idx_email ON users(email);  # Now fast!
```

❌ **Creating new DB connection per request**
```python
# Bad
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    conn = sqlite3.connect("db.sqlite")  # New connection each time!
    result = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    conn.close()
    return result

# Good
pool = ConnectionPool()
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    result = await pool.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    return result
```

---

## What's Next

Once you've completed these exercises, you'll understand:
- How to design databases for performance
- Why indexes matter
- How to avoid common pitfalls
- How to measure and optimize

Then move to **Module 3: Observability & Monitoring** to learn how to observe what's happening in your database (and API).

---

## Resources

- **SQLAlchemy ORM:** https://www.sqlalchemy.org
- **Database Design:** https://use-the-index-luke.com
- **Query Optimization:** https://sqlperformance.com
- **Connection Pooling:** https://en.wikipedia.org/wiki/Connection_pool

