"""
Vercel entry point for FastAPI

This file serves the FastAPI app on Vercel's serverless environment.
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os

# Add modules to path so we can import from them
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Module 1 app
from modules.01_async_apis.app import app as module1_app

# Create wrapper app
app = FastAPI()

# Route to Module 1
@app.get("/")
async def root():
    return {
        "message": "Production Systems Lab",
        "modules": {
            "module_1": "/api/module1/",
            "module_2": "/api/module2/"
        }
    }

@app.get("/api/module1/")
async def module1_root():
    return await module1_app("/")

# Include Module 1 routes
app.include_router(module1_app.routes)

# Export for Vercel
from mangum import Asgi

handler = Asgi(app)
