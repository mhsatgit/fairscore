"""
Prediction Routes - Handle credit prediction requests
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
import logging

from app.schemas.prediction import PredictionRequest, PredictionResponse, ExplanationFactor, FairnessContext

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/predict", response_model=PredictionResponse)
async def predict_credit_risk(request: Request, prediction_request: PredictionRequest):
    """
    Predict credit risk for an applicant
    
    - **prediction**: Credit risk assessment (Good/Bad)
    - **probability**: Probability of good credit outcome
    - **risk_score**: Risk score 0-100
    - **risk_level**: Low/Medium/High risk
    - **explanation**: Model explanation factors
    """
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(
                status_code=503,
                detail="ML models not loaded. Please train models first."
            )
        
        # Convert request to dict for model
        input_data = prediction_request.model_dump()
        
        # Map aliased fields to model feature names
        if 'loan_amount' in input_data:
            input_data['credit_amount'] = input_data.pop('loan_amount')
        if 'loan_duration' in input_data:
            input_data['duration'] = input_data.pop('loan_duration')
        
        model_name = input_data.pop("model_name", "random_forest")
        include_fairness = input_data.pop("include_fairness", True)
        
        # Make prediction
        prediction, probability = model_service.predict(input_data, model_name)
        
        # Calculate risk score (0-100, higher is better)
        risk_score = int(probability * 100)
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "Low"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        # Get explanation
        from app.services.explainability import ExplainabilityService
        explain_service = ExplainabilityService(model_service)
        explanation = explain_service.explain_prediction(
            input_data, prediction, probability, model_name
        )
        
        # Get fairness context if requested
        fairness_context = None
        if include_fairness:
            fairness_context = FairnessContext(
                gender_group="Male" if prediction_request.sex == 1 else "Female",
                age_group="Young (<25)" if prediction_request.age < 25 else "Older (>=25)"
            )
        
        # Format model name for display
        model_display_name = model_name.replace("_", " ").title()
        
        return PredictionResponse(
            prediction="Good" if prediction == 1 else "Bad",
            probability=round(probability, 4),
            risk_score=risk_score,
            risk_level=risk_level,
            model=model_display_name,
            explanation=explanation,
            fairness_context=fairness_context
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/predict-with-fairness")
async def predict_with_fairness_context(request: Request, prediction_request: PredictionRequest):
    """
    Predict with detailed fairness context
    """
    try:
        model_service = request.app.state.model_service
        
        if not model_service.is_loaded:
            raise HTTPException(
                status_code=503,
                detail="ML models not loaded"
            )
        
        input_data = prediction_request.model_dump()
        model_name = input_data.pop("model_name", "random_forest")
        include_fairness = input_data.pop("include_fairness", True)
        
        # Map aliased fields to model feature names
        if 'loan_amount' in input_data:
            input_data['credit_amount'] = input_data.pop('loan_amount')
        if 'loan_duration' in input_data:
            input_data['duration'] = input_data.pop('loan_duration')
        
        # Get prediction from baseline model
        prediction_baseline, prob_baseline = model_service.predict(input_data, "random_forest")
        
        # Get prediction from fair model if available
        prediction_fair = None
        prob_fair = None
        if "fair_model" in model_service.models:
            prediction_fair, prob_fair = model_service.predict(input_data, "fair_model")
        
        return {
            "baseline": {
                "prediction": "Good" if prediction_baseline == 1 else "Bad",
                "probability": round(prob_baseline, 4),
                "model": "Random Forest (Baseline)"
            },
            "fair_model": {
                "prediction": "Good" if prediction_fair == 1 else "Bad" if prediction_fair is not None else None,
                "probability": round(prob_fair, 4) if prob_fair is not None else None,
                "model": "Fairness-Mitigated Model"
            } if prediction_fair is not None else None,
            "input": {
                "gender": "Male" if prediction_request.sex == 1 else "Female",
                "age_group": "Young" if prediction_request.age < 25 else "Older"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fairness prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
