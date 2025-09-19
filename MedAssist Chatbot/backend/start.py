#!/usr/bin/env python3
"""
MediChat AI Backend Startup Script
"""
import os
import sys
import subprocess

def check_requirements():
    """Check if all requirements are installed"""
    try:
        import fastapi
        import sqlalchemy
        import psycopg2
        import llama_cpp
        print("✅ All required packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing required package: {e}")
        return False

def check_model():
    """Check if model file exists"""
    model_path = "../model/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
    if os.path.exists(model_path):
        print(f"✅ Model found at {model_path}")
        return True
    else:
        print(f"❌ Model not found at {model_path}")
        print("Please ensure your model file is placed in the model/ directory")
        return False

def check_database():
    """Check database connection"""
    try:
        from database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your DATABASE_URL in config.py or .env file")
        return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting MediChat AI Backend...")
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    print("🏥 MediChat AI Backend")
    print("=" * 50)
    
    # Pre-flight checks
    if not check_requirements():
        print("\nInstall requirements: pip install -r requirements.txt")
        sys.exit(1)
    
    if not check_model():
        print("\nEnsure your model file is in the model/ directory")
        sys.exit(1)
    
    if not check_database():
        print("\nCheck your database configuration and ensure PostgreSQL is running")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("All checks passed! Starting server...")
    print("API will be available at: http://localhost:8000")
    print("API documentation: http://localhost:8000/docs")
    print("=" * 50)
    
    start_server()