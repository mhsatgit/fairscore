"""
Dataset Routes - Dataset statistics and information
"""

from fastapi import APIRouter, Request, HTTPException
import pandas as pd
import numpy as np
from pathlib import Path
import logging

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/dataset")
async def get_dataset_info():
    """
    Get dataset statistics and information
    
    Returns:
    - Total records
    - Features
    - Good/Bad credit distribution
    - Feature distributions
    """
    try:
        # Load raw data if available
        raw_data_path = settings.RAW_DATA_DIR / "german_credit.csv"
        processed_data_path = settings.PROCESSED_DATA_DIR / "processed_data.csv"
        
        if processed_data_path.exists():
            df = pd.read_csv(processed_data_path)
            return _get_processed_dataset_info(df)
        elif raw_data_path.exists():
            return _get_raw_dataset_info(raw_data_path)
        else:
            # Return placeholder
            return {
                "total_records": 1000,
                "features": 20,
                "good_credit": 700,
                "bad_credit": 300,
                "distributions": {},
                "message": "Using default values - dataset not yet processed"
            }
            
    except Exception as e:
        logger.error(f"Dataset error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _get_processed_dataset_info(df: pd.DataFrame) -> dict:
    """Get dataset info from processed data"""
    target_col = 'target' if 'target' in df.columns else df.columns[-1]
    
    info = {
        "total_records": len(df),
        "features": len(df.columns) - 1,
        "good_credit": int((df[target_col] == 1).sum()),
        "bad_credit": int((df[target_col] == 0).sum()),
        "distributions": {}
    }
    
    # Age distribution
    if 'age' in df.columns:
        age_bins = [0, 25, 35, 45, 55, 100]
        age_labels = ['18-25', '26-35', '36-45', '46-55', '55+']
        df['age_group_display'] = pd.cut(df['age'], bins=age_bins, labels=age_labels)
        info["distributions"]["age"] = df['age_group_display'].value_counts().to_dict()
    
    # Loan amount distribution
    if 'loan_amount' in df.columns:
        info["distributions"]["loan_amount"] = {
            "mean": float(df['loan_amount'].mean()),
            "median": float(df['loan_amount'].median()),
            "min": float(df['loan_amount'].min()),
            "max": float(df['loan_amount'].max())
        }
    
    # Gender distribution
    if 'sex' in df.columns:
        info["distributions"]["gender"] = {
            "Male": int((df['sex'] == 1).sum()),
            "Female": int((df['sex'] == 2).sum())
        }
    
    # Credit history distribution
    if 'credit_history' in df.columns:
        credit_labels = {
            'no credits taken / all credits paid back duly': "No credits",
            'all credits at this bank paid back duly': "All paid",
            'existing credits paid back duly till now': "Existing paid",
            'delay in paying off in the past': "Delay",
            'critical account / other credits existing (not at this bank)': "Critical",
            1: "No credits",
            2: "All paid",
            3: "Existing paid",
            4: "Delay",
            5: "Critical"
        }
        info["distributions"]["credit_history"] = {
            credit_labels.get(k, str(k)): int(v)
            for k, v in df['credit_history'].value_counts().items()
        }

    # Employment distribution
    if 'employment_duration' in df.columns:
        emp_labels = {
            'unemployed': "Unemployed",
            '... < 1 year': "<1 year",
            '1 <= ... < 4 years': "1-4 years",
            '4 <= ... < 7 years': "4-7 years",
            '.. >= 7 years': "7+ years",
            1: "Unemployed",
            2: "<1 year",
            3: "1-4 years",
            4: "4-7 years",
            5: "7+ years"
        }
        info["distributions"]["employment"] = {
            emp_labels.get(k, str(k)): int(v)
            for k, v in df['employment_duration'].value_counts().items()
        }
    
    return info


def _get_raw_dataset_info(data_path: Path) -> dict:
    """Get dataset info from raw data"""
    try:
        # Define column names
        column_names = [
            'checking_account', 'duration', 'credit_history', 'purpose',
            'credit_amount', 'savings_account', 'employment_duration',
            'installment_rate', 'personal_status', 'other_debtors',
            'residence_duration', 'property', 'age', 'other_plans',
            'housing', 'existing_credits', 'job', 'dependents',
            'telephone', 'foreign_worker', 'target'
        ]
        
        df = pd.read_csv(data_path, sep=' ', header=None, names=column_names)
        
        info = {
            "total_records": len(df),
            "features": len(df.columns) - 1,
            "good_credit": int((df['target'] == 1).sum()),
            "bad_credit": int((df['target'] == 2).sum()),
            "distributions": {}
        }
        
        # Age distribution
        age_bins = [0, 25, 35, 45, 55, 100]
        age_labels = ['18-25', '26-35', '36-45', '46-55', '55+']
        df['age_group'] = pd.cut(df['age'], bins=age_bins, labels=age_labels)
        info["distributions"]["age"] = df['age_group'].value_counts().to_dict()
        
        # Gender
        info["distributions"]["gender"] = {
            "Male": int((df['personal_status'].isin([1, 3, 4])).sum()),
            "Female": int((df['personal_status'] == 2).sum())
        }
        
        return info
        
    except Exception as e:
        logger.error(f"Error reading raw data: {e}")
        return {
            "total_records": 1000,
            "features": 20,
            "good_credit": 700,
            "bad_credit": 300,
            "distributions": {},
            "error": str(e)
        }
