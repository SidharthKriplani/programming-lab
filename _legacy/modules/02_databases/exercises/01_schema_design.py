"""
Exercise 1: Schema Design

Learn how to design efficient database schemas.

Concepts:
- Primary keys and uniqueness
- Foreign keys and relationships
- Indexes for fast queries
- Data types and constraints
"""

import aiosqlite
import asyncio

# ============================================================================
# Example 1: Bad vs Good Schema
# ============================================================================

# ❌ BAD SCHEMA
BAD_SCHEMA = """
CREATE TABLE IF NOT EXISTS users_bad (
    id INTEGER,
    name TEXT,
    email TEXT,
    age INTEGER,
    created_at TEXT
);
"""

# ✅ GOOD SCHEMA
GOOD_SCHEMA = """
CREATE TABLE IF NOT EXISTS users_good (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER CHECK (age > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users_good(email);
"""


async def example_1_schema_design():
    """Demonstrate schema design principles"""
    print("\n--- Example 1: Schema Design ---")
    print("""
    BAD Schema Problems:
    ❌ No PRIMARY KEY - can't guarantee uniqueness
    ❌ No NOT NULL - invalid data can creep in
    ❌ No UNIQUE on email - duplicate emails allowed
    ❌ No CHECK constraints - invalid ages (e.g., -5)
    ❌ No INDEX - queries will be slow

    GOOD Schema Improvements:
    ✓ PRIMARY KEY - automatic unique ID
    ✓ NOT NULL - required fields enforced
    ✓ UNIQUE on email - no duplicate emails
    ✓ CHECK constraints - valid ages only
    ✓ INDEX on email - fast lookups
    """)

    async with aiosqlite.connect(":memory:") as db:
        # Create both tables
        await db.execute(BAD_SCHEMA)
        await db.execute(GOOD_SCHEMA)

        # Try to demonstrate the problems
        print("\nDemonstration:")

        # Bad schema: Insert duplicate email (allowed)
        try:
            await db.execute(
                "INSERT INTO users_bad (id, name, email) VALUES (1, 'Alice', 'alice@example.com')"
            )
            await db.execute(
                "INSERT INTO users_bad (id, name, email) VALUES (2, 'Bob', 'alice@example.com')"
            )
            await db.commit()
            print("✗ BAD schema: Duplicate emails inserted (shouldn't happen)")
        except Exception as e:
            print(f"BAD schema: {e}")

        # Good schema: Duplicate email rejected
        try:
            await db.execute(
                "INSERT INTO users_good (name, email, age) VALUES ('Alice', 'alice@example.com', 25)"
            )
            await db.execute(
                "INSERT INTO users_good (name, email, age) VALUES ('Bob', 'alice@example.com', 30)"
            )
            await db.commit()
            print("✓ GOOD schema: Duplicate email rejected")
        except aiosqlite.IntegrityError:
            print("✓ GOOD schema: Duplicate email REJECTED (correct behavior)")

        # Good schema: Invalid age rejected
        try:
            await db.execute(
                "INSERT INTO users_good (name, email, age) VALUES ('Charlie', 'charlie@example.com', -5)"
            )
            await db.commit()
            print("✓ GOOD schema: Negative age inserted (shouldn't happen)")
        except aiosqlite.IntegrityError:
            print("✓ GOOD schema: Negative age REJECTED (correct behavior)")


# ============================================================================
# Example 2: Relationships (Foreign Keys)
# ============================================================================

async def example_2_relationships():
    """Demonstrate proper relationships with foreign keys"""
    print("\n--- Example 2: Relationships & Foreign Keys ---")
    print("""
    One-to-Many: Users have many Posts

    Users Table:
    ├─ id (PRIMARY KEY)
    ├─ name
    └─ email (UNIQUE)

    Posts Table:
    ├─ id (PRIMARY KEY)
    ├─ user_id (FOREIGN KEY → Users)
    ├─ title
    └─ content
    """)

    schema = """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX idx_posts_user_id ON posts(user_id);
    """

    async with aiosqlite.connect(":memory:") as db:
        await db.execute("PRAGMA foreign_keys = ON")
        await db.executescript(schema)

        # Insert valid data
        await db.execute("INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')")
        await db.execute("INSERT INTO posts (user_id, title, content) VALUES (1, 'First Post', 'Content')")
        await db.commit()
        print("✓ Valid data inserted")

        # Try to insert invalid data (user_id doesn't exist)
        try:
            await db.execute("INSERT INTO posts (user_id, title, content) VALUES (999, 'Invalid', 'Content')")
            await db.commit()
            print("✓ Invalid user_id inserted (shouldn't happen)")
        except aiosqlite.IntegrityError:
            print("✓ Invalid user_id REJECTED (foreign key constraint)")


# ============================================================================
# Example 3: Index Strategy
# ============================================================================

async def example_3_indexes():
    """Demonstrate index impact on query performance"""
    print("\n--- Example 3: Index Impact ---")
    print("""
    Without Index:
    - Query must scan entire table (FULL TABLE SCAN)
    - 100k rows = 100k comparisons

    With Index:
    - Uses binary search (B-TREE)
    - 100k rows = ~17 comparisons
    - 5000x faster!
    """)

    schema = """
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    """

    async with aiosqlite.connect(":memory:") as db:
        await db.execute("PRAGMA synchronous = OFF")  # Faster for test
        await db.executescript(schema)

        # Insert test data
        print("\nInserting 10,000 products...")
        for i in range(10000):
            await db.execute(
                "INSERT INTO products (sku, name, price) VALUES (?, ?, ?)",
                (f"SKU-{i:05d}", f"Product {i}", 9.99 + i * 0.01)
            )
        await db.commit()

        # Query with index
        import time
        start = time.time()
        cursor = await db.execute("SELECT * FROM products WHERE sku = 'SKU-05000'")
        result = await cursor.fetchone()
        indexed_time = time.time() - start

        print(f"✓ Query with index: {indexed_time*1000:.3f}ms")
        print(f"  Found: {result[1] if result else 'not found'}")


# ============================================================================
# Example 4: Composite Indexes
# ============================================================================

async def example_4_composite_indexes():
    """Demonstrate composite indexes for multiple columns"""
    print("\n--- Example 4: Composite Indexes ---")
    print("""
    When to use composite indexes:
    - Queries that filter on multiple columns together

    Example: Find orders by user_id and date range
    - Single index on user_id: helps filter by user
    - Composite index on (user_id, date): helps both filters
    """)

    schema = """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        amount REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_date
    ON orders(user_id, date);
    """

    async with aiosqlite.connect(":memory:") as db:
        await db.executescript(schema)

        # Insert sample data
        for user_id in range(1, 101):
            for day in range(1, 11):
                await db.execute(
                    "INSERT INTO orders (user_id, date, amount) VALUES (?, ?, ?)",
                    (user_id, f"2024-01-{day:02d}", 50.0 + user_id + day)
                )
        await db.commit()

        # Query that benefits from composite index
        import time
        start = time.time()
        cursor = await db.execute(
            "SELECT * FROM orders WHERE user_id = 50 AND date >= '2024-01-05'"
        )
        results = await cursor.fetchall()
        elapsed = time.time() - start

        print(f"✓ Query with composite index: {elapsed*1000:.3f}ms")
        print(f"  Found {len(results)} orders")


# ============================================================================
# Main Function
# ============================================================================

async def main():
    print("=" * 70)
    print("Exercise 1: Schema Design")
    print("=" * 70)

    await example_1_schema_design()
    await example_2_relationships()
    await example_3_indexes()
    await example_4_composite_indexes()

    print("\n" + "=" * 70)
    print("Key Takeaways:")
    print("=" * 70)
    print("""
    ✓ Primary Keys guarantee uniqueness
    ✓ Constraints (NOT NULL, UNIQUE, CHECK) prevent bad data
    ✓ Foreign Keys maintain data integrity
    ✓ Indexes make queries 1000x faster
    ✓ Composite indexes help multi-column queries

    Next: Exercise 2 - Query Optimization
    """)


if __name__ == "__main__":
    asyncio.run(main())
