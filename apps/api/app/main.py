"""
FairScore API - FastAPI Backend
An Explainable and Bias-Aware Credit Scoring System
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging

from app.routes import health, prediction, metrics, fairness, dataset, history
from app.core.config import settings
from app.services.model_service import ModelService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model service
model_service = ModelService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - load models on startup"""
    logger.info("Loading ML models...")
    try:
        model_service.load_models()
        logger.info("Models loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="FairScore API",
    description="An Explainable and Bias-Aware Credit Scoring System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Make model service available to routes
app.state.model_service = model_service

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(prediction.router, prefix="/api", tags=["Prediction"])
app.include_router(metrics.router, prefix="/api", tags=["Metrics"])
app.include_router(fairness.router, prefix="/api", tags=["Fairness"])
app.include_router(dataset.router, prefix="/api", tags=["Dataset"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.get("/")
async def root():
    return {
        "message": "FairScore API",
        "version": "1.0.0",
        "docs": "/docs"
    }
