# Module 4: Load Balancing & Horizontal Scaling

Learn how to scale from handling 100 requests/second to 100,000+ by distributing load across multiple servers.

## Vertical vs Horizontal Scaling

**Vertical Scaling (❌ Limited):**
- Buy bigger servers
- Single point of failure
- Expensive, hits limits (~1TB RAM max)
- Example: 1 server handling all traffic

**Horizontal Scaling (✅ Unlimited):**
- Add more servers
- Distribute load
- Cheap, scales to infinity
- Example: 100 servers each handling 1% of traffic

## Load Balancing Algorithms

### 1. Round-Robin
```
Request 1 → Server A
Request 2 → Server B
Request 3 → Server C
Request 4 → Server A (cycle repeats)
```
**Use:** When all servers are identical capacity

### 2. Least Connections
```
Always send to server with fewest active connections
```
**Use:** When requests have varying duration

### 3. Weighted Round-Robin
```
Server A (2x capacity) → gets 2 requests
Server B (1x capacity) → gets 1 request
```
**Use:** Mixed hardware in cluster

### 4. IP Hash
```
Hash(client IP) determines server
Same client always hits same server
```
**Use:** Sticky sessions needed (but avoid this pattern)

## Challenges at Scale

### Session State
❌ **Problem:** User A logs in, load balancer sends request to Server B, but session is on Server A

✅ **Solution:** 
1. Store sessions in Redis (not local memory)
2. Use sticky sessions (not recommended)
3. Make services stateless

### Database Bottleneck
❌ Single database can't handle 100k requests/sec even with load balancing

✅ Solutions:
1. **Read replicas:** Distribute reads across multiple databases
2. **Sharding:** Split data by user ID, region, etc.
3. **Caching:** Reduce database load

### Network Latency
At scale, latency between servers matters:
- Server to server: 0.5ms
- Database to server: 1-5ms
- Client to server: 20-100ms

## Scaling Patterns

### Pattern 1: Stateless Services
```
Load Balancer → [Server 1] [Server 2] [Server 3]
                     ↓       ↓       ↓
                   Redis (shared state)
```
**Best for:** Most modern applications

### Pattern 2: Database Replication
```
         Write → Primary Database
                      ↓
              Read → Replica 1
                  → Replica 2
                  → Replica 3
```
**Best for:** Read-heavy workloads

### Pattern 3: Sharding
```
User 1-333333 → Shard A
User 333334-666666 → Shard B
User 666667-1000000 → Shard C
```
**Best for:** Very large datasets

## Real-World Example

Scaling from 100 to 100,000 requests/second:

| Step | Architecture | Max RPS |
|------|--------------|---------|
| 1 | 1 server | 100 |
| 2 | 1 server + Redis | 1,000 |
| 3 | LB + 10 servers | 10,000 |
| 4 | LB + 10 servers + DB replicas | 50,000 |
| 5 | LB + 100 servers + sharded DB | 100,000+ |

## Monitoring at Scale

**Critical Metrics:**
- Requests per second per server
- Load balancer distribution (is traffic balanced?)
- Database replication lag
- Cache hit ratio
- Error rates by server

## Common Mistakes

1. **Scaling the wrong component** - Profile first!
2. **Ignoring state management** - Sessions break when scaling
3. **Database not scaled** - Load balancer helps until DB becomes bottleneck
4. **No redundancy** - Scaling doesn't equal reliability

## Further Reading

- Load balancing algorithms: https://en.wikipedia.org/wiki/Load_balancing_(computing)
- Database sharding: https://en.wikipedia.org/wiki/Shard_(database_architecture)
- Nginx load balancer: https://nginx.org/en/docs/
