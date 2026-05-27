# Production Systems Lab - Common Commands

.PHONY: help setup dev test lint format clean docs run

help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║     Production Systems Lab - Common Commands                  ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Setup & Environment:"
	@echo "  make setup          Create virtual environment and install deps"
	@echo "  make dev            Activate development environment"
	@echo ""
	@echo "Running Code:"
	@echo "  make run-m1         Run Module 1 (Async APIs)"
	@echo "  make ex1            Run Exercise 1 (Basic Async)"
	@echo ""
	@echo "Quality & Testing:"
	@echo "  make test           Run all tests"
	@echo "  make lint           Run code linter (ruff)"
	@echo "  make format         Format code (black + isort)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          Remove cache and build artifacts"
	@echo "  make clean-env      Delete virtual environment"
	@echo ""

setup:
	@echo "🔧 Setting up environment..."
	python -m venv venv
	. venv/bin/activate && pip install --upgrade pip setuptools wheel
	. venv/bin/activate && pip install -r requirements.txt
	@echo "✓ Environment ready! Run 'source venv/bin/activate' to activate"

dev:
	@echo "📦 Activating development environment..."
	@echo "Run: source venv/bin/activate"
	. venv/bin/activate

run-m1:
	@echo "🚀 Starting Module 1 API Server..."
	. venv/bin/activate && python modules/01_async_apis/app.py

ex1:
	@echo "📚 Running Exercise 1: Basic Async Concepts..."
	. venv/bin/activate && python modules/01_async_apis/exercises/01_basic_async.py

test:
	@echo "🧪 Running tests..."
	. venv/bin/activate && pytest -v

lint:
	@echo "🔍 Linting code..."
	. venv/bin/activate && ruff check .

format:
	@echo "✨ Formatting code..."
	. venv/bin/activate && black .
	. venv/bin/activate && isort .

clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name ".pytest_cache" -delete
	rm -rf .mypy_cache .ruff_cache htmlcov .coverage
	@echo "✓ Cleanup complete"

clean-env:
	@echo "🗑️  Removing virtual environment..."
	rm -rf venv
	@echo "✓ Environment removed"

.DEFAULT_GOAL := help
