# Quick Start Guide

Get the Production Systems Lab running in 5 minutes.

## Prerequisites

- Python 3.10 or higher
- Git
- (Optional) Docker for PostgreSQL/Redis

---

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/production-systems-lab.git
cd production-systems-lab

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 2: Run Module 1 (2 minutes)

```bash
# Start the API server
python modules/01_async_apis/app.py
```

You should see:
```
╔════════════════════════════════════════════════════════════════╗
║   Production Systems Lab - Module 1: Async APIs               ║
║                                                                ║
║   Starting API server...                                       ║
║   Visit http://localhost:8000/docs for interactive docs       ║
```

---

## Step 3: Try the API (1 minute)

Open your browser and go to: **http://localhost:8000/docs**

You'll see an interactive API explorer. Try these:

### Test Sequential Fetching (Slow)
1. Click "POST /sync-data"
2. Click "Try it out"
3. Click "Execute"
4. **Result:** Takes ~0.2 seconds (2 sources × 0.1s each)

### Test Concurrent Fetching (Fast)
1. Click "POST /async-data"
2. Click "Try it out"
3. Click "Execute"
4. **Result:** Takes ~0.1 seconds (both sources in parallel!)

**Notice the difference:** Same data, same delay, but async is ~2x faster!

---

## Step 4: Run Exercises

```bash
# Run Exercise 1: Basic Async Concepts
python modules/01_async_apis/exercises/01_basic_async.py
```

You'll see clear explanations of:
- Coroutines vs regular functions
- The event loop
- Sequential vs concurrent execution
- Error handling

---

## Step 5: Run Tests

```bash
# Install pytest if you haven't
pip install pytest pytest-asyncio

# Run the test suite
pytest modules/01_async_apis/test_app.py -v
```

You'll see tests for:
- API endpoints
- Async performance
- Error handling
- Request validation

---

## Using Make Commands (Optional)

If you have `make` installed:

```bash
# See all available commands
make help

# Setup environment
make setup

# Run Module 1
make run-m1

# Run Exercise 1
make ex1

# Run tests
make test

# Format code
make format
```

---

## Common Issues

### Issue: "ModuleNotFoundError: No module named 'fastapi'"
**Solution:** Make sure you activated the virtual environment:
```bash
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Issue: "Port 8000 already in use"
**Solution:** Change the port in the app:
```bash
python -c "import uvicorn; uvicorn.run('modules.01_async_apis.app:app', host='0.0.0.0', port=8001)"
```

### Issue: Tests fail with asyncio errors
**Solution:** Make sure you have `pytest-asyncio` installed:
```bash
pip install pytest-asyncio
```

---

## What's Next?

1. ✅ **Module 1:** Understand async/await and FastAPI
2. 📚 **Exercise 1-5:** Learn by doing
3. 🧪 **Tests:** See how to validate your code
4. 🔜 **Module 2:** Databases & Performance (coming soon)

---

## Project Structure

```
production-systems-lab/
├── modules/01_async_apis/    ← You are here
│   ├── app.py               ← Main API
│   ├── exercises/           ← Learn by doing
│   ├── test_app.py         ← Tests
│   └── README.md           ← Deep dive into concepts
├── requirements.txt         ← Dependencies
├── docker-compose.yml       ← Local services (optional)
└── README.md               ← Full documentation
```

---

## Tips for Learning

1. **Read first:** Start with `modules/01_async_apis/README.md`
2. **Code along:** Don't just read, run the exercises
3. **Experiment:** Change parameters and see what happens
4. **Compare:** Run `/sync-data` vs `/async-data` and watch the times
5. **Test:** Run the tests to see what works and why

---

## Getting Help

- 📖 Read the README files (they have detailed explanations)
- 🔍 Check the code comments (they explain the "why")
- 🧪 Look at tests (they show usage examples)
- 💻 Run exercises with `-v` flag for verbose output

---

## Ready to Dive Deeper?

Once you're comfortable with Module 1:

```bash
# Read the full README
cat README.md

# Read Module 1 detailed documentation
cat modules/01_async_apis/README.md

# Look at the main app
cat modules/01_async_apis/app.py
```

**Happy learning!** 🚀

