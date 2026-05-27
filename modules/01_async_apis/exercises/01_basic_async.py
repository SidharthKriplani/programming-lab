"""
Exercise 1: Basic Async Concepts

Learn the fundamentals:
- Coroutines and how they differ from regular functions
- The event loop
- await keyword
- Running async code with asyncio.run()

Try to understand each example before running it.
"""

import asyncio
import time
from datetime import datetime


# ============================================================================
# Example 1: Coroutines vs Regular Functions
# ============================================================================

def regular_function():
    """Regular synchronous function"""
    print("Regular function called")
    return "result"


async def async_function():
    """Async function (coroutine)"""
    print("Async function called")
    return "result"


def example_1_difference():
    """Show the difference between sync and async functions"""
    print("\n--- Example 1: Coroutines vs Functions ---")

    # Calling a regular function executes immediately
    result = regular_function()
    print(f"Regular function result: {result}")

    # Calling an async function returns a coroutine object
    coroutine = async_function()
    print(f"Async function result: {coroutine}")
    print("Notice: it didn't execute! It returned a coroutine object.")
    print("We need to await it or run it with asyncio.run()")


# ============================================================================
# Example 2: Using await
# ============================================================================

async def slow_operation():
    """Simulate a slow operation (like a database query)"""
    print("  Starting slow operation...")
    await asyncio.sleep(2)  # Simulate 2-second delay
    print("  Slow operation complete")
    return "data"


async def example_2_await():
    """Demonstrate the await keyword"""
    print("\n--- Example 2: Using await ---")
    print("This will take ~2 seconds")

    start = time.time()
    result = await slow_operation()
    elapsed = time.time() - start

    print(f"Result: {result}")
    print(f"Time elapsed: {elapsed:.2f} seconds")


# ============================================================================
# Example 3: Sequential vs Concurrent Execution
# ============================================================================

async def task(name: str, duration: float):
    """A task that takes time to complete"""
    print(f"  ▶️  {name} started")
    await asyncio.sleep(duration)
    print(f"  ✓ {name} completed")
    return f"Result from {name}"


async def example_3_sequential():
    """Run tasks one at a time (sequential)"""
    print("\n--- Example 3a: Sequential (Slow) ---")
    print("Running 3 tasks sequentially (one at a time)")

    start = time.time()
    result1 = await task("Task 1", 1)
    result2 = await task("Task 2", 1)
    result3 = await task("Task 3", 1)
    elapsed = time.time() - start

    print(f"Results: {[result1, result2, result3]}")
    print(f"Total time: {elapsed:.2f}s (3 tasks × 1s each)")


async def example_3_concurrent():
    """Run tasks concurrently (gather)"""
    print("\n--- Example 3b: Concurrent (Fast) ---")
    print("Running 3 tasks concurrently (in parallel)")

    start = time.time()
    results = await asyncio.gather(
        task("Task 1", 1),
        task("Task 2", 1),
        task("Task 3", 1),
    )
    elapsed = time.time() - start

    print(f"Results: {results}")
    print(f"Total time: {elapsed:.2f}s (all 3 tasks in parallel)")
    print("Notice: same tasks, but ~3x faster!")


# ============================================================================
# Example 4: Understanding the Event Loop
# ============================================================================

async def explain_event_loop():
    """Visualize how the event loop works"""
    print("\n--- Example 4: Event Loop Visualization ---")
    print("""
    The event loop is like a manager:

    Start:
      ├─ Task A: waiting for I/O (database query)
      ├─ Task B: waiting for I/O (API call)
      └─ Task C: waiting for I/O (file read)

    Event loop says: "Task A, you're blocked. I'll work on Task B"

    Progress:
      ├─ Task A: still waiting...
      ├─ Task B: still waiting...
      └─ Task C: got a result! Return it

    Event loop says: "Task C is done, I'll work on Task A"

    This way, one worker can handle many tasks!
    """)

    # Let's visualize with actual code
    async def worker(name: str, delay: float):
        print(f"{name}: waiting for {delay}s...")
        await asyncio.sleep(delay)
        print(f"{name}: done!")

    print("\nRunning 3 workers concurrently:")
    await asyncio.gather(
        worker("Worker A", 1.0),
        worker("Worker B", 0.5),
        worker("Worker C", 1.5),
    )


# ============================================================================
# Example 5: Error Handling in Async
# ============================================================================

async def failing_task():
    """A task that raises an error"""
    await asyncio.sleep(1)
    raise ValueError("Something went wrong!")


async def example_5_error_handling():
    """How to handle errors in async code"""
    print("\n--- Example 5: Error Handling ---")

    # Method 1: Try/except
    print("Method 1: Using try/except")
    try:
        await failing_task()
    except ValueError as e:
        print(f"Caught error: {e}")

    # Method 2: gather with return_exceptions
    print("\nMethod 2: Using gather with return_exceptions")
    results = await asyncio.gather(
        task("Good task", 0.5),
        failing_task(),
        task("Another good task", 0.5),
        return_exceptions=True  # Catch errors and return them
    )

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            print(f"Result {i}: ERROR - {result}")
        else:
            print(f"Result {i}: {result}")


# ============================================================================
# Main Function - Run Examples
# ============================================================================

async def main():
    """Run all examples"""
    print("=" * 70)
    print("Exercise 1: Basic Async Concepts")
    print("=" * 70)

    # Example 1
    example_1_difference()

    # Example 2
    await example_2_await()

    # Example 3
    await example_3_sequential()
    await example_3_concurrent()

    # Example 4
    await explain_event_loop()

    # Example 5
    await example_5_error_handling()

    print("\n" + "=" * 70)
    print("All examples completed!")
    print("=" * 70)


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())

    print("""

    Key Takeaways:
    ✓ Async functions return coroutines that need to be awaited
    ✓ await pauses execution until the operation completes
    ✓ asyncio.gather() runs multiple coroutines concurrently
    ✓ The event loop manages switching between waiting tasks
    ✓ Use try/except for error handling in async code

    Next: Run Exercise 2 to learn about concurrent requests
    """)
