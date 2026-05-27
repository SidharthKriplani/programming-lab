# Module 1: Async APIs & Concurrency

## Overview

Most data engineers write Python like this:

```python
# Synchronous (blocking)
result1 = fetch_data_from_api()  # Waits 1 second
result2 = fetch_data_from_db()   # Waits 1 second
return result1 + result2         # Total: 2 seconds
```

Production systems do this:

```python
# Asynchronous (non-blocking)
result1, result2 = await asyncio.gather(
    fetch_data_from_api(),
    fetch_data_from_db()
)  # Total: 1 second (parallel!)
return result1 + result2
```

That's the difference between handling 10 requests/second and 1000 requests/second.

**In this module, you'll learn:**
- Why async matters in production
- How Python's async/await works (deep dive)
- Building APIs with FastAPI
- Handling concurrent requests
- Performance testing your API

---

## Why Async?

### The Problem: Blocking I/O

When your API calls an external service (database, third-party API), your Python process sits and **waits**:

```
Request 1: ████░░░░░░  (waiting for database)
Request 2:     ████░░░░░░  (waiting for database)
Request 3:         ████░░░░░░  (waiting for database)
```

With 1 worker, you can handle maybe 10 requests/second.

### The Solution: Async I/O

Instead of blocking, your process releases control and handles other requests:

```
Request 1: ████          ████
Request 2:     ████          ████
Request 3:         ████          ████
```

Now 1 worker can handle 1000+ requests/second.

### When Async Helps

✅ **I/O bound work:**
- Database queries
- API calls
- File operations
- Network requests

❌ **CPU bound work:**
- Heavy calculations
- ML inference (use multiprocessing instead)
- Data processing

---

## How Async Works in Python

### 1. The Event Loop

```python
import asyncio

async def hello():
    print("Hello")
    await asyncio.sleep(1)  # Release control
    print("World")

asyncio.run(hello())  # Starts the event loop
```

The event loop:
- Runs your async functions
- When it sees `await`, it pauses and switches to other tasks
- Resumes when the awaited operation completes

### 2. Coroutines vs Functions

```python
# Regular function
def sync_fetch():
    return "data"

# Coroutine (async function)
async def async_fetch():
    await asyncio.sleep(1)  # Must be awaited
    return "data"

# Calling them:
sync_fetch()                    # Executes immediately
async_fetch()                   # Returns a coroutine object (not executed!)
await async_fetch()             # Actually executes it
```

### 3. Running Multiple Tasks

```python
async def main():
    # Sequential (slow) - 2 seconds
    result1 = await fetch_api()
    result2 = await fetch_db()
    
    # Concurrent (fast) - 1 second
    result1, result2 = await asyncio.gather(
        fetch_api(),
        fetch_db()
    )

asyncio.run(main())
```

---

## FastAPI: Building Async APIs

FastAPI is designed for async from the ground up:

```python
from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.get("/data")
async def get_data():
    # This endpoint can handle 1000s of concurrent requests
    result1, result2 = await asyncio.gather(
        fetch_from_api(),
        fetch_from_db()
    )
    return {"result1": result1, "result2": result2}
```

**Why FastAPI?**
- Built for async (not an afterthought)
- Automatic API documentation
- Type validation (Pydantic)
- Performance (nearly as fast as Go)
- Easy to test

---

## Architecture: Request Flow

```
Client Request
    ↓
Load Balancer
    ↓
FastAPI App (async endpoint)
    ├─ Validate request (Pydantic)
    ├─ Run async code (I/O operations)
    │   ├─ Query database
    │   ├─ Call external API
    │   └─ Cache lookups
    ├─ Process results
    └─ Return response
    ↓
Client Response
```

Each async operation can be interrupted and resumed, allowing one worker to serve many requests.

---

## Exercises

### Exercise 1: Basic Async
Understand coroutines and the event loop.

**File:** `exercises/01_basic_async.py`

### Exercise 2: Concurrent Requests
Build an async function that fetches data from multiple sources simultaneously.

**File:** `exercises/02_concurrent_requests.py`

### Exercise 3: FastAPI Server
Build your first async API endpoint.

**File:** `exercises/03_fastapi_basic.py`

### Exercise 4: Rate Limiting
Add rate limiting to protect your API.

**File:** `exercises/04_rate_limiting.py`

### Exercise 5: Load Testing
Test your API's performance under load.

**File:** `exercises/05_load_testing.py`

---

## Capstone: Simple Data API

Build an async API that:
1. Accepts JSON requests
2. Validates input
3. Fetches data from multiple sources (simulated)
4. Returns combined results

**File:** `capstone/data_api.py`

---

## Key Takeaways

1. **Async enables concurrency** — Handle 100x more requests with same resources
2. **Not for CPU work** — Use multiprocessing for heavy computation
3. **FastAPI is the way** — Modern async framework for Python APIs
4. **Test under load** — Always measure performance in realistic scenarios
5. **Observability matters** — Monitor which endpoints are slow

---

## Common Mistakes

❌ **Mixing sync and async poorly**
```python
# Don't do this
async def my_function():
    result = regular_blocking_call()  # Blocks entire event loop!
```

✅ **Keep everything async**
```python
# Do this
async def my_function():
    result = await async_call()  # Non-blocking
```

---

## What's Next?

Once you've completed these exercises, you'll understand:
- How to write async Python code
- How to build fast APIs
- Why concurrent request handling matters

Then move to **Module 2: Databases & Performance** to learn how to make your data layer match this speed.

---

## Resources

- **FastAPI Tutorial:** https://fastapi.tiangolo.com/tutorial/
- **AsyncIO Docs:** https://docs.python.org/3/library/asyncio.html
- **Async/Await in Python:** https://realpython.com/async-io-python/

