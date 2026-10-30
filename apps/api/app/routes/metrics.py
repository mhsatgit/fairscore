"""
Metrics Routes - Model performance metrics
"""

from fastapi import APIRouter, Request, HTTPException
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/metrics")
async def get_model_metrics(request: Request):
    """
    Get model performance metrics
    
    Returns metrics for all trained models including:
    - Accuracy
    - Precision
    - Recall
    - F1 Score
    - ROC-AUC
    - Confusion Matrix
    - ROC Curve data
    """
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(
                status_code=503,
                detail="Models not loaded"
            )
        
        metrics = model_service.get_metrics()
        
        # Ensure all required fields exist
        default_metrics = {
            "logistic_regression": {
                "accuracy": 0,
                "precision": 0,
                "recall": 0,
                "f1": 0,
                "roc_auc": 0,
                "confusion_matrix": [[0, 0], [0, 0]],
                "roc_curve": {"fpr": [], "tpr": []}
            },
            "random_forest": {
                "accuracy": 0,
                "precision": 0,
                "recall": 0,
                "f1": 0,
                "roc_auc": 0,
                "confusion_matrix": [[0, 0], [0, 0]],
                "roc_curve": {"fpr": [], "tpr": []}
            }
        }
        
        # Merge with actual metrics
        for model_name in ["logistic_regression", "random_forest"]:
            if model_name not in metrics:
                metrics[model_name] = default_metrics[model_name]
            else:
                # Ensure all fields exist
                for field in ["accuracy", "precision", "recall", "f1", "roc_auc"]:
                    if field not in metrics[model_name]:
                        metrics[model_name][field] = 0
                if "confusion_matrix" not in metrics[model_name]:
                    metrics[model_name]["confusion_matrix"] = [[0, 0], [0, 0]]
                if "roc_curve" not in metrics[model_name]:
                    metrics[model_name]["roc_curve"] = {"fpr": [], "tpr": []}
        
        return metrics
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Metrics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info")
async def get_model_info(request: Request):
    """Get information about trained models"""
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        model_info = {}
        for name, model in model_service.models.items():
            info = {
                "name": name.replace("_", " ").title(),
                "type": type(model).__name__,
                "parameters": {}
            }
            
            # Get model parameters
            if hasattr(model, 'get_params'):
                params = model.get_params()
                # Only include important parameters
                important_params = ['C', 'max_depth', 'n_estimators', 'min_samples_split']
                for param in important_params:
                    if param in params:
                        info["parameters"][param] = params[param]
            
            model_info[name] = info
        
        return {
            "models": model_info,
            "preprocessor": model_service.preprocessor is not None,
            "feature_names": model_service.feature_names
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
