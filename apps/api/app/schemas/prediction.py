"""Pydantic schemas for prediction API"""

from pydantic import BaseModel, Field, model_validator
from typing import List, Literal, Optional


class PredictionRequest(BaseModel):
    """Schema for credit prediction request - all 20 features from German Credit dataset"""
    
    # Personal Information
    age: int = Field(..., ge=18, le=100, description="Age of applicant")
    sex: int = Field(..., ge=1, le=2, description="Sex: 1=Male, 2=Female")
    marital_status: int = Field(..., ge=1, le=5, description="Personal status / marital status")
    dependents: int = Field(..., ge=1, le=4, description="Number of dependents")
    housing: int = Field(..., ge=1, le=3, description="Housing status")
    
    # Financial Information
    checking_account: int = Field(..., ge=1, le=4, description="Checking account status")
    savings_account: int = Field(..., ge=1, le=5, description="Savings account status")
    employment_duration: int = Field(..., ge=1, le=5, description="Employment duration")
    other_debtors: int = Field(..., ge=1, le=3, description="Other debtors/guarantors")
    existing_credits: int = Field(..., ge=1, le=4, description="Number of existing credits")
    
    # Loan Information
    credit_amount: int = Field(..., ge=250, le=20000, description="Loan amount in DM")
    duration: int = Field(..., ge=4, le=72, description="Loan duration in months")
    purpose: int = Field(..., ge=1, le=10, description="Purpose of loan")
    installment_rate: int = Field(..., ge=1, le=4, description="Installment rate %")
    
    # Credit History
    credit_history: int = Field(..., ge=1, le=5, description="Credit history")
    property: int = Field(..., ge=1, le=4, description="Property ownership")
    foreign_worker: int = Field(..., ge=1, le=2, description="Foreign worker: 1=yes, 2=no")
    
    # Additional features the model needs
    other_plans: int = Field(3, ge=1, le=3, description="Other installment plans: 1=bank, 2=stores, 3=none")
    job: int = Field(3, ge=1, le=4, description="Job: 1=unskilled non-res, 2=unskilled res, 3=skilled, 4=highly skilled")
    telephone: int = Field(1, ge=1, le=2, description="Telephone: 1=none, 2=yes")
    residence_duration: int = Field(2, ge=1, le=4, description="Residence duration")
    
    # Optional
    model_name: Literal["logistic_regression", "random_forest", "fair_model"] = Field(
        "random_forest", description="Model to use"
    )
    include_fairness: bool = Field(True, description="Include fairness context")

    @model_validator(mode="after")
    def validate_personal_status_matches_sex(self):
        """The source dataset stores sex and personal status as one feature."""
        valid_statuses = {1, 3, 4} if self.sex == 1 else {2, 5}
        if self.marital_status not in valid_statuses:
            raise ValueError("Personal status does not match the selected sex")
        return self
    
    model_config = {
        "protected_namespaces": (),
        "json_schema_extra": {
            "example": {
                "age": 35,
                "sex": 1,
                "marital_status": 1,
                "dependents": 2,
                "housing": 2,
                "checking_account": 1,
                "savings_account": 2,
                "employment_duration": 4,
                "other_debtors": 1,
                "existing_credits": 1,
                "credit_amount": 5000,
                "duration": 24,
                "purpose": 1,
                "installment_rate": 3,
                "credit_history": 2,
                "property": 1,
                "other_plans": 3,
                "job": 3,
                "telephone": 2,
                "residence_duration": 2,
                "foreign_worker": 1,
                "model_name": "random_forest",
                "include_fairness": True
            }
        }
    }


class ExplanationFactor(BaseModel):
    """Schema for a single explanation factor"""
    feature: str
    impact: str
    value: str
    importance: Optional[float] = None


class FairnessContext(BaseModel):
    """Schema for fairness context in prediction"""
    gender_group: Optional[str] = None
    age_group: Optional[str] = None


class PredictionResponse(BaseModel):
    """Schema for prediction response"""
    prediction: str = Field(..., description="Credit risk prediction: Good or Bad")
    probability: float = Field(..., description="Probability of positive outcome")
    risk_score: int = Field(..., description="Risk score 0-100")
    risk_level: str = Field(..., description="Risk level: Low, Medium, or High")
    model: str = Field(..., description="Model used for prediction")
    explanation: List[ExplanationFactor] = Field(..., description="Model explanation")
    fairness_context: Optional[FairnessContext] = None
    disclaimer: str = Field(
        "This is an educational prototype prediction. Do not use for real financial decisions."
    )
