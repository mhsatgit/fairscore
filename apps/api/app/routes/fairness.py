"""
Fairness Routes - Model fairness auditing
"""

from fastapi import APIRouter, Request, HTTPException
import logging
import numpy as np
import pandas as pd
from pathlib import Path

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/fairness")
async def get_fairness_metrics(request: Request):
    """
    Get fairness metrics for model
    
    Calculates fairness metrics across:
    - Gender (Male/Female)
    - Age Group (Young <25 / Older >=25)
    
    Metrics include:
    - Selection Rate
    - True Positive Rate
    - False Positive Rate
    - Demographic Parity Difference
    - Disparate Impact Ratio
    - Equal Opportunity Difference
    """
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load processed data if available
        processed_data_path = settings.PROCESSED_DATA_DIR / "processed_data.csv"
        
        if not processed_data_path.exists():
            # Return placeholder if data not available
            return {
                "gender_fairness": {
                    "male": {"selection_rate": 0, "tpr": 0, "fpr": 0},
                    "female": {"selection_rate": 0, "tpr": 0, "fpr": 0},
                    "demographic_parity_difference": 0,
                    "disparate_impact_ratio": 0,
                    "equal_opportunity_difference": 0
                },
                "age_fairness": {
                    "young": {"selection_rate": 0, "tpr": 0, "fpr": 0},
                    "older": {"selection_rate": 0, "tpr": 0, "fpr": 0},
                    "demographic_parity_difference": 0,
                    "disparate_impact_ratio": 0,
                    "equal_opportunity_difference": 0
                },
                "overall_status": "Data not available"
            }
        
        # Load data
        df = pd.read_csv(processed_data_path)
        
        # Make predictions using the model
        if model_service.preprocessor is not None:
            # Get feature columns (exclude target and sensitive attributes)
            exclude_cols = ['target', 'sex', 'age_group']
            feature_cols = [col for col in df.columns if col not in exclude_cols]
            X = df[feature_cols]
            X_processed = model_service.preprocessor.transform(X)
        else:
            X_processed = df.drop(columns=['target', 'sex', 'age_group'], errors='ignore').values
        
        # Get predictions
        model = model_service.get_model("random_forest")
        y_pred = model.predict(X_processed)
        y_true = df['target'].values if 'target' in df.columns else None
        
        # Calculate gender fairness
        gender_fairness = {}
        if 'sex' in df.columns:
            male_mask = df['sex'] == 1
            female_mask = df['sex'] == 2
            
            male_pred = y_pred[male_mask]
            female_pred = y_pred[female_mask]
            
            male_sel_rate = np.mean(male_pred) if len(male_pred) > 0 else 0
            female_sel_rate = np.mean(female_pred) if len(female_pred) > 0 else 0
            
            # TPR and FPR
            if y_true is not None:
                male_true = y_true[male_mask]
                female_true = y_true[female_mask]
                
                male_tpr = np.mean(male_pred[male_true == 1]) if np.sum(male_true == 1) > 0 else 0
                female_tpr = np.mean(female_pred[female_true == 1]) if np.sum(female_true == 1) > 0 else 0
                
                male_fpr = np.mean(male_pred[male_true == 0]) if np.sum(male_true == 0) > 0 else 0
                female_fpr = np.mean(female_pred[female_true == 0]) if np.sum(female_true == 0) > 0 else 0
            else:
                male_tpr = male_fpr = female_tpr = female_fpr = 0
            
            # Fairness metrics
            dp_diff = abs(male_sel_rate - female_sel_rate)
            di_ratio = min(male_sel_rate, female_sel_rate) / max(male_sel_rate, female_sel_rate) if max(male_sel_rate, female_sel_rate) > 0 else 1
            eo_diff = abs(male_tpr - female_tpr)
            
            gender_fairness = {
                "male": {
                    "selection_rate": round(float(male_sel_rate), 4),
                    "tpr": round(float(male_tpr), 4),
                    "fpr": round(float(male_fpr), 4),
                    "count": int(np.sum(male_mask))
                },
                "female": {
                    "selection_rate": round(float(female_sel_rate), 4),
                    "tpr": round(float(female_tpr), 4),
                    "fpr": round(float(female_fpr), 4),
                    "count": int(np.sum(female_mask))
                },
                "demographic_parity_difference": round(float(dp_diff), 4),
                "disparate_impact_ratio": round(float(di_ratio), 4),
                "equal_opportunity_difference": round(float(eo_diff), 4)
            }
        
        # Calculate age fairness
        age_fairness = {}
        if 'age_group' in df.columns:
            young_mask = df['age_group'] == 0
            older_mask = df['age_group'] == 1
            
            young_pred = y_pred[young_mask]
            older_pred = y_pred[older_mask]
            
            young_sel_rate = np.mean(young_pred) if len(young_pred) > 0 else 0
            older_sel_rate = np.mean(older_pred) if len(older_pred) > 0 else 0
            
            # TPR and FPR
            if y_true is not None:
                young_true = y_true[young_mask]
                older_true = y_true[older_mask]
                
                young_tpr = np.mean(young_pred[young_true == 1]) if np.sum(young_true == 1) > 0 else 0
                older_tpr = np.mean(older_pred[older_true == 1]) if np.sum(older_true == 1) > 0 else 0
                
                young_fpr = np.mean(young_pred[young_true == 0]) if np.sum(young_true == 0) > 0 else 0
                older_fpr = np.mean(older_pred[older_true == 0]) if np.sum(older_true == 0) > 0 else 0
            else:
                young_tpr = older_tpr = young_fpr = older_fpr = 0
            
            # Fairness metrics
            dp_diff = abs(young_sel_rate - older_sel_rate)
            di_ratio = min(young_sel_rate, older_sel_rate) / max(young_sel_rate, older_sel_rate) if max(young_sel_rate, older_sel_rate) > 0 else 1
            eo_diff = abs(young_tpr - older_tpr)
            
            age_fairness = {
                "young": {
                    "selection_rate": round(float(young_sel_rate), 4),
                    "tpr": round(float(young_tpr), 4),
                    "fpr": round(float(young_fpr), 4),
                    "count": int(np.sum(young_mask))
                },
                "older": {
                    "selection_rate": round(float(older_sel_rate), 4),
                    "tpr": round(float(older_tpr), 4),
                    "fpr": round(float(older_fpr), 4),
                    "count": int(np.sum(older_mask))
                },
                "demographic_parity_difference": round(float(dp_diff), 4),
                "disparate_impact_ratio": round(float(di_ratio), 4),
                "equal_opportunity_difference": round(float(eo_diff), 4)
            }
        
        # Overall status
        overall_status = "Low Disparity"
        max_dp = max(
            gender_fairness.get("demographic_parity_difference", 0),
            age_fairness.get("demographic_parity_difference", 0)
        )
        if max_dp > 0.1:
            overall_status = "Moderate Disparity"
        if max_dp > 0.2:
            overall_status = "High Disparity"
        
        return {
            "gender_fairness": gender_fairness,
            "age_fairness": age_fairness,
            "overall_status": overall_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fairness error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fairness/comparison")
async def get_fairness_comparison(request: Request):
    """
    Compare baseline model vs fairness-mitigated model
    """
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(status_code=503, detail="Models not loaded")
        
        # Load metrics
        metrics = model_service.get_metrics()
        
        # Get baseline metrics
        baseline = metrics.get("random_forest", {})
        fair = metrics.get("fair_model", {})
        
        return {
            "baseline": {
                "name": "Random Forest (Baseline)",
                "accuracy": baseline.get("accuracy", 0),
                "precision": baseline.get("precision", 0),
                "recall": baseline.get("recall", 0),
                "f1": baseline.get("f1", 0),
                "roc_auc": baseline.get("roc_auc", 0)
            },
            "fair_model": {
                "name": "Fairness-Mitigated Model",
                "accuracy": fair.get("accuracy", 0),
                "precision": fair.get("precision", 0),
                "recall": fair.get("recall", 0),
                "f1": fair.get("f1", 0),
                "roc_auc": fair.get("roc_auc", 0),
                "demographic_parity_difference": fair.get("fairness", {}).get("demographic_parity_difference", 0),
                "disparate_impact_ratio": fair.get("fairness", {}).get("disparate_impact_ratio", 1),
                "equal_opportunity_difference": fair.get("fairness", {}).get("equal_opportunity_difference", 0)
            },
            "trade_off": {
                "accuracy_loss": baseline.get("accuracy", 0) - fair.get("accuracy", 0),
                "fairness_gain": baseline.get("fairness", {}).get("demographic_parity_difference", 0) - fair.get("fairness", {}).get("demographic_parity_difference", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fairness comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
