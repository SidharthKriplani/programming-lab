# Module 5: Observability & Production Debugging

Learn how to understand what's happening in production systems when things go wrong (and they will).

## The Three Pillars of Observability

### 1. Logs
Discrete events with context
```
[2024-05-27T12:34:56] ERROR: Database connection failed
  user_id: 12345
  endpoint: /api/checkout
  latency_ms: 5000
  retry_attempt: 2
```

**Best for:** Understanding what happened

**Tools:** ELK Stack, Datadog, Splunk

### 2. Metrics
Time-series data about system behavior
```
requests_per_second: 1,250
error_rate: 0.5%
database_latency_p99: 145ms
cache_hit_ratio: 94%
memory_usage: 65%
```

**Best for:** Spotting trends and anomalies

**Tools:** Prometheus, Grafana, Datadog

### 3. Traces
Request journey through your system
```
User Request
  ├─ API Server (10ms)
  │   ├─ Database Query (50ms)
  │   └─ Redis Lookup (2ms)
  ├─ Payment Service (300ms)
  │   └─ External API Call (290ms)
  └─ Response (362ms total)
```

**Best for:** Finding bottlenecks

**Tools:** Jaeger, Zipkin, Datadog

## Why Observability Matters

**Without observability:**
- Customer reports "app is slow"
- You: "Works fine for me"
- 2 hours later: Still no idea what's wrong

**With observability:**
- Alert fires: "p99 latency > 500ms"
- You see: "Database replication lag increased"
- 5 minutes later: Fixed

## Structured Logging Best Practices

❌ Bad:
```
"User login failed"
```

✅ Good:
```json
{
  "timestamp": "2024-05-27T12:34:56Z",
  "level": "error",
  "event": "user_login_failed",
  "user_id": "u_12345",
  "reason": "invalid_password",
  "attempt": 3,
  "ip_address": "192.168.1.1",
  "latency_ms": 145
}
```

## Metrics You Should Track

### Application Level
- Requests per second
- Error rate (%)
- Response time (p50, p99, p99.9)
- Cache hit ratio

### Infrastructure Level
- CPU usage
- Memory usage
- Disk I/O
- Network bandwidth

### Business Level
- Checkout success rate
- User signup rate
- Feature usage
- Revenue impact

## Alerts That Actually Matter

❌ Bad:
- Alert on anything slightly abnormal
- Results in alert fatigue
- Team ignores all alerts

✅ Good:
- Alert on business impact
- Alert on recovery difficulty
- Set alert thresholds based on history

**Example:**
- ✅ Alert: "Error rate > 5% for 5 minutes"
- ❌ Alert: "Error rate increased by 0.1%"

## Common Production Issues & How to Debug

### Issue: "Requests are slow"
1. Check metrics: Which endpoint? Which users? Geographic pattern?
2. Check logs: Database timeouts? External API slow?
3. Check traces: Where does time get spent?

### Issue: "Database is down"
1. Check metrics: Connection count? Query latency?
2. Check logs: Connection errors? Lock contention?
3. Check replication status: Is replica in sync?

### Issue: "High memory usage"
1. Check metrics: Memory trend over time?
2. Check logs: Any errors right before spike?
3. Profile: What's holding memory?

## Real-World Example

Black Friday traffic spike handling:
- **11:00 AM:** Metrics show requests_per_second increasing
- **11:15 AM:** P99 latency crosses 200ms threshold → Alert fires
- **11:16 AM:** You check traces → Cache hit ratio dropped from 95% to 40%
- **11:17 AM:** Check logs → Redis memory limit exceeded, old entries evicted
- **11:18 AM:** Scale Redis cluster
- **11:20 AM:** P99 latency back to normal, alert clears

**Without observability:** Customers call complaining, 30 minutes of blindness. With observability: Issue identified and fixed in 4 minutes.

## Building Observability Into Code

Every function should emit:
1. **Start/end log** with duration
2. **Error logs** with context
3. **Metrics** about behavior

```python
def checkout(user_id, amount):
    start = time.time()
    log.info("checkout_started", user_id=user_id, amount=amount)
    
    try:
        # Process payment
        duration = time.time() - start
        metrics.record("checkout_duration_ms", duration)
        log.info("checkout_success", user_id=user_id, duration=duration)
    except Exception as e:
        log.error("checkout_failed", user_id=user_id, error=str(e))
        metrics.increment("checkout_errors")
        raise
```

## Cost of Observability

Good news: Observability scales with revenue
- As you make more money, you can afford better observability
- Early startups: CloudWatch logs (~$10/month)
- Midsize: Datadog (~$500/month)
- Large: Datadog + Splunk + Honeycomb (~$50k/month)

## Further Reading

- Google's SRE Book (free): https://sre.google/sre-book/
- Observability Engineering by O'Reilly: https://www.oreilly.com/library/view/observability-engineering/9781492076438/
- Honeycomb blog: https://www.honeycomb.io/blog/
