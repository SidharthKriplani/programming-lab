# Module 3: Caching & In-Memory Data Stores

Learn how to dramatically improve performance using Redis and intelligent caching strategies.

## Why Caching Matters

Without caching, even optimized databases can become bottlenecks. A cache layer can reduce response times from 100ms to <1ms.

**Performance Impact:**
- Database query: 50-100ms
- Redis cache hit: <1ms
- **100x faster** with cache hits

## Key Concepts

### 1. Cache-Aside Pattern (Lazy Loading)
```python
# Check cache first
# If miss, query database
# Store result in cache
# Return to user
```

**Best for:** Read-heavy, infrequent updates

**Pros:**
- Only cache what's needed
- Flexible TTL management
- Easy to implement

**Cons:**
- Cache misses cause slow requests
- Stale data possible

### 2. Write-Through Pattern
```python
# Write to cache AND database simultaneously
# Return to user
# Cache always in sync
```

**Best for:** Critical data that must be consistent

**Pros:**
- Cache always in sync
- No stale data
- Predictable performance

**Cons:**
- Slower writes
- Cache must always be available

### 3. Cache Invalidation
The hard problem in computer science: "There are only two hard problems in Computer Science: cache invalidation and naming things." - Phil Karlton

**Strategies:**
- **Time-based (TTL):** Auto-expire after X seconds
- **Event-based:** Invalidate on write
- **LRU:** Evict least recently used items

## Real-World Example

E-commerce homepage loads product catalog:
- **Without cache:** 5000 products × 50ms per query = 250 seconds
- **With Redis cache:** 5000 products in single 1ms query = 1ms response

## Performance Metrics to Track

- Cache hit ratio (target: >90%)
- Cache eviction rate
- Memory usage
- Response time comparison

## Common Mistakes

1. **Caching everything** - Memory is finite; cache strategically
2. **Forever TTLs** - Stale data problems; use reasonable expiry
3. **No invalidation strategy** - Cache becomes source of truth
4. **Not monitoring cache** - Hidden performance problems

## Further Reading

- Redis documentation: https://redis.io/docs/
- Cache strategies deep dive: https://en.wikipedia.org/wiki/Cache_replacement_policies
- Distributed caching patterns: https://martinfowler.com/bliki/CacheAsidePattern.html
