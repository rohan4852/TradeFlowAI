#!/usr/bin/env python3
"""
Simple runner script for the FastAPI application.
This allows you to run 'python main.py' from the backend directory.
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )