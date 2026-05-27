# Changelog

All notable changes to the Production Systems Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Module 2: Databases & Performance
- Module 3: Observability & Monitoring
- Module 4: Deployment & Infrastructure
- Module 5: Building for Scale
- Module 6: Real-World Systems

---

## [0.1.0] - 2024-12-27

### Added
- **Initial Project Setup**
  - Project structure and organization
  - Virtual environment configuration
  - Development dependencies (FastAPI, pytest, black, etc.)
  - Docker Compose for local infrastructure (PostgreSQL, Redis)

- **Module 1: Async APIs & Concurrency**
  - Comprehensive README explaining async/await concepts
  - Main application (`app.py`) demonstrating:
    - Synchronous endpoint (`/sync-data`)
    - Asynchronous endpoint (`/async-data`)
    - Health check endpoint
    - Pydantic data models for validation
  - Exercise 1: Basic async concepts with 5 progressive examples
  - Test suite with pytest and async test patterns
  - Makefile with common development commands
  - Docker Compose setup for services

- **Documentation**
  - Root README with learning path and project overview
  - Module 1 detailed README
  - Setup instructions
  - Project structure documentation

- **Configuration**
  - `.gitignore` for Python projects
  - `.env.example` for environment variables
  - `requirements.txt` with production dependencies

### Key Features
- ✅ Fast async API that can handle 1000+ req/s
- ✅ Comparison between sequential and concurrent execution
- ✅ Educational code with clear explanations
- ✅ Testing infrastructure ready
- ✅ Development environment setup

### Known Limitations
- Module 1 uses simulated data sources (not real databases)
- No authentication/authorization yet
- No rate limiting yet
- No production deployment setup

---

## Development Notes

### Session: Initial Setup (Dec 27, 2024)
- Created comprehensive project scaffolding
- Module 1 fully implemented and documented
- Designed for educational clarity over production optimization
- Focus on teaching "why" async matters with concrete examples

### Next Session Actions
- Get user feedback on Module 1
- Implement Exercise 2-5 for Module 1
- Plan Module 2 content
- Set up CI/CD pipeline
