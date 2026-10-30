"""Application configuration settings"""

import os
from pathlib import Path

class Settings:
    """Application settings"""
    
    # Base paths - config.py is at apps/api/app/core/config.py
    # So 4 parents up = project root
    PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
    API_DIR = Path(__file__).resolve().parent.parent.parent  # apps/api
    
    # Data paths
    DATA_DIR = PROJECT_ROOT / "data"
    RAW_DATA_DIR = DATA_DIR / "raw"
    PROCESSED_DATA_DIR = DATA_DIR / "processed"
    
    # Model paths
    MODELS_DIR = PROJECT_ROOT / "models"
    
    # Database - use API_DIR for SQLite
    DATABASE_URL = f"sqlite:///{API_DIR}/predictions.db"
    
    # API settings
    API_TITLE = "FairScore API"
    API_VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings()
