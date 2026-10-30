"""
Health Routes - Health check endpoints
"""

from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check(request: Request):
    """Health check endpoint"""
    model_service = request.app.state.model_service
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": model_service.is_loaded,
        "models_available": list(model_service.models.keys()) if model_service.is_loaded else []
    }
