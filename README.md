# Production Systems Lab

A hands-on guide for data engineers and ML practitioners transitioning to AI engineering by mastering production backend systems.

## Why This Lab?

You know how to build models. You know ML frameworks. But can you ship them to production at scale? This lab teaches the backend engineering fundamentals that every AI engineer needs: async APIs, database design, caching, monitoring, and deployment patterns.

**Target Audience:** Data scientists, ML engineers, and analytics engineers who want to move into AI engineering and understand the SWE world.

---

## Ecosystem Context

This is the third pillar of the AI Engineering Systems ecosystem:

1. **Experimentation Systems Lab** — How to measure what works (A/B testing, metrics)
2. **GenAI Systems Lab** — How to build with LLMs (RAG, agents, fine-tuning)
3. **Production Systems Lab** — How to ship it to production (APIs, databases, ops)

Together, these labs teach you how to go from "I have an ML idea" → "I have a production system."

---

## Learning Path

### Module 1: Async APIs & Concurrency
- Why async matters in production
- FastAPI fundamentals
- Async patterns in Python
- Scaling request handling
- **Deliverable:** Build a simple async API that handles 1000+ req/s

### Module 2: Databases & Performance
- SQL vs NoSQL trade-offs
- Query optimization and indexing
- Connection pooling
- Caching patterns (Redis)
- **Deliverable:** Design a database schema, optimize queries, add caching

### Module 3: Observability & Monitoring
- Logging (structured, levels, rotation)
- Metrics collection
- Tracing requests end-to-end
- Alerting patterns
- **Deliverable:** Instrument an app with full observability

### Module 4: Deployment & Infrastructure
- Containerization (Docker)
- Kubernetes basics
- CI/CD pipelines
- Environment management
- **Deliverable:** Deploy an app to production (local K8s)

### Module 5: Building for Scale
- Load balancing
- Rate limiting
- Circuit breakers
- Graceful degradation
- **Deliverable:** Design an architecture that handles 10x traffic

### Module 6: Real-World Systems
- Event-driven architectures
- Microservices patterns
- Distributed systems challenges
- **Deliverable:** Build a multi-service system

---

## How to Use This Lab

**Each module includes:**
- 📚 Concepts (theory + why it matters)
- 🔨 Hands-on exercises (code along)
- 🏗️ Architectures (real patterns)
- ⚡ Performance tips (optimization tricks)
- 📊 Monitoring setup (how to observe it)

**You should:**
- Read the concepts
- Code the exercises yourself
- Experiment and break things
- Build something real (combine modules)

**This is NOT:**
- A framework tutorial (FastAPI, Django documentation exists)
- Production-ready boilerplate
- A quick reference guide

**This IS:**
- A learning journey from "I can code" to "I can ship systems"
- Educational code (clear > clever)
- Patterns you'll use in real jobs

---

## Prerequisites

- Python 3.10+
- Basic Python knowledge (functions, classes, async/await syntax)
- Understanding of HTTP and APIs (no deep knowledge needed)
- Command line comfort
- Docker basics (covered in Module 4, but nice to have)

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/production-systems-lab.git
cd production-systems-lab

# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start with Module 1
cd modules/01_async_apis
python app.py
```

---

## Project Structure

```
production-systems-lab/
├── README.md (you are here)
├── requirements.txt
├── .gitignore
├── .github/
│   └── workflows/           # CI/CD pipelines
├── modules/
│   ├── 01_async_apis/
│   │   ├── README.md
│   │   ├── app.py
│   │   ├── exercises/
│   │   └── solutions/
│   ├── 02_databases/
│   ├── 03_observability/
│   ├── 04_deployment/
│   ├── 05_scaling/
│   └── 06_real_world/
├── docs/
│   ├── concepts/
│   ├── architecture/
│   └── best_practices/
├── docker-compose.yml       # Local infrastructure
├── Makefile                 # Common commands
└── CHANGELOG.md
```

---

## Learning Timeline

- **Week 1-2:** Module 1 (Async APIs) — foundations
- **Week 3-4:** Module 2 (Databases) — data layer
- **Week 5:** Module 3 (Observability) — understand your system
- **Week 6-7:** Module 4 (Deployment) — ship it
- **Week 8-9:** Module 5 (Scaling) — handle growth
- **Week 10+:** Module 6 + Capstone — build something real

(Timeline is flexible—move at your pace)

---

## What You'll Build

By the end of this lab, you'll have:

1. ✅ An async API that handles real traffic
2. ✅ A properly designed database with optimization
3. ✅ Full observability (logs, metrics, traces)
4. ✅ A containerized app running in Kubernetes
5. ✅ Experience scaling systems under load
6. ✅ A multi-service system you designed end-to-end

Plus: A portfolio piece that shows you understand production systems.

---

## Key Principles

**Throughout this lab, remember:**

1. **Understand the WHY** — Not just how to use a tool, but why you'd use it
2. **Trade-offs matter** — Nothing is one-size-fits-all. Learn to evaluate choices
3. **Observability first** — If you can't measure it, you can't optimize it
4. **Fail small** — Break things in modules, not in production
5. **Build incrementally** — Start simple, add complexity gradually

---

## Who's This For?

- 🧠 Data scientists wanting to move into AI engineering
- 📊 Analytics engineers building data infrastructure
- 🤖 ML engineers shipping models to production
- 💻 Backend engineers learning the AI systems perspective
- 🚀 Anyone who wants to understand production systems

---

## Feedback & Contributions

This lab is educational first. If something doesn't make sense:

- Open an issue
- Suggest clearer explanations
- Add your own examples
- Share what worked for you

---

## Resources

- **FastAPI:** https://fastapi.tiangolo.com
- **SQLAlchemy:** https://www.sqlalchemy.org
- **Redis:** https://redis.io
- **Docker:** https://docs.docker.com
- **Kubernetes:** https://kubernetes.io/docs
- **Observability:** https://opentelemetry.io

---

## License

MIT — Use freely, build anything.

---

**Ready to start?** → Go to `modules/01_async_apis/README.md`

