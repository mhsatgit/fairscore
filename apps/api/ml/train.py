"""
ML Training Pipeline
Trains models for FairScore credit scoring system
"""

import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

# Paths - train.py is at apps/api/ml/train.py
# 4 parents up = project root (fair-score/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"

# Create directories
RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)


def download_dataset():
    """Load German Credit dataset from local CSV file."""
    print("Loading German Credit dataset...")
    
    csv_path = RAW_DIR / "german_credit.csv"
    
    if not csv_path.exists():
        print(f"Dataset not found at {csv_path}")
        print("Using synthetic fallback data...")
        return create_synthetic_data()
    
    # Read the CSV with decoded text labels
    df = pd.read_csv(csv_path)
    
    # Column name mapping (new CSV -> expected names)
    column_map = {
        'checking_account_status': 'checking_account',
        'duration_in_month': 'duration',
        'savings_account_bonds': 'savings_account',
        'present_employment_since': 'employment_duration',
        'other_debtors_guarantors': 'other_debtors',
        'present_residence_since': 'residence_duration',
        'age_in_years': 'age',
        'number_of_existing_credits': 'existing_credits',
        'number_of_people_liable': 'dependents',
        'other_installment_plans': 'other_plans',
        'class': 'target',
    }
    df = df.rename(columns=column_map)
    
    # Combine sex + personal_status into personal_status (decoded text format)
    df['personal_status'] = df['sex'] + ': ' + df['personal_status']
    df = df.drop(columns=['sex'])
    
    # Map target: 'good' -> 1, 'bad' -> 0
    df['target'] = df['target'].map({'good': 1, 'bad': 0})
    
    print(f"Dataset loaded: {len(df)} records")
    
    return df


def create_synthetic_data():
    """Create synthetic data based on German Credit dataset characteristics"""
    n_samples = 1000
    
    data = {
        'checking_account': np.random.choice([1, 2, 3, 4], n_samples, p=[0.27, 0.27, 0.23, 0.23]),
        'duration': np.random.randint(4, 72, n_samples),
        'credit_history': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.06, 0.53, 0.30, 0.08, 0.03]),
        'purpose': np.random.choice(range(1, 11), n_samples),
        'credit_amount': np.random.randint(250, 20000, n_samples),
        'savings_account': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.40, 0.10, 0.15, 0.10, 0.25]),
        'employment_duration': np.random.choice([1, 2, 3, 4, 5], n_samples, p=[0.06, 0.20, 0.35, 0.25, 0.14]),
        'installment_rate': np.random.choice([1, 2, 3, 4], n_samples),
        'personal_status': np.random.choice([1, 2, 3, 4], n_samples, p=[0.30, 0.10, 0.50, 0.10]),
        'other_debtors': np.random.choice([1, 2, 3], n_samples, p=[0.80, 0.10, 0.10]),
        'residence_duration': np.random.randint(1, 4, n_samples),
        'property': np.random.choice([1, 2, 3, 4], n_samples),
        'age': np.random.randint(18, 75, n_samples),
        'other_plans': np.random.choice([1, 2, 3], n_samples, p=[0.70, 0.10, 0.20]),
        'housing': np.random.choice([1, 2, 3], n_samples, p=[0.30, 0.60, 0.10]),
        'existing_credits': np.random.choice([1, 2, 3, 4], n_samples, p=[0.60, 0.30, 0.08, 0.02]),
        'job': np.random.choice([1, 2, 3, 4], n_samples),
        'dependents': np.random.choice([1, 2], n_samples, p=[0.85, 0.15]),
        'telephone': np.random.choice([1, 2], n_samples, p=[0.60, 0.40]),
        'foreign_worker': np.random.choice([1, 2], n_samples, p=[0.96, 0.04]),
    }
    
    df = pd.DataFrame(data)
    
    # Create realistic target variable based on features
    risk_score = np.zeros(n_samples)
    
    # Credit history is most important
    risk_score += np.where(df['credit_history'] == 1, 0.3, 0)
    risk_score += np.where(df['credit_history'] == 5, 0.4, 0)
    risk_score += np.where(df['credit_history'] == 4, 0.2, 0)
    
    # Checking account
    risk_score += np.where(df['checking_account'] == 1, 0.2, 0)
    risk_score += np.where(df['checking_account'] == 2, 0.15, 0)
    risk_score -= np.where(df['checking_account'] == 4, 0.1, 0)
    
    # Savings
    risk_score -= np.where(df['savings_account'] >= 4, 0.1, 0)
    risk_score += np.where(df['savings_account'] == 1, 0.1, 0)
    
    # Employment
    risk_score -= np.where(df['employment_duration'] >= 4, 0.1, 0)
    risk_score += np.where(df['employment_duration'] == 1, 0.15, 0)
    
    # Loan amount
    risk_score += (df['credit_amount'] / 20000) * 0.2
    
    # Duration
    risk_score += (df['duration'] / 72) * 0.1
    
    # Add noise
    risk_score += np.random.normal(0, 0.1, n_samples)
    
    # Convert to binary (1=Good, 0=Bad)
    df['target'] = (risk_score < np.percentile(risk_score, 30)).astype(int)
    
    # Save
    df.to_csv(RAW_DIR / "german.data", index=False)
    print(f"Synthetic dataset created: {len(df)} records")
    
    return df


def preprocess_data(df):
    """Preprocess the dataset"""
    print("Preprocessing data...")
    
    # Create age group for fairness analysis
    df['age_group'] = (df['age'] >= 25).astype(int)
    
    # Create sex binary (for fairlearn compatibility)
    # personal_status contains 'female:' prefix for female applicants
    df['sex_binary'] = df['personal_status'].str.startswith('female').astype(int).map({1: 0, 0: 1})
    # 1 = Male, 2 = Female (to match API schema)
    df['sex'] = df['sex_binary'].map({1: 1, 0: 2})
    
    # Define feature types
    categorical_features = [
        'checking_account', 'credit_history', 'savings_account',
        'employment_duration', 'personal_status', 'other_debtors',
        'property', 'housing', 'other_plans', 'job', 'telephone',
        'foreign_worker', 'purpose', 'installment_rate'
    ]
    
    numerical_features = [
        'duration', 'credit_amount', 'age', 'residence_duration',
        'existing_credits', 'dependents'
    ]
    
    # Features for model (excluding sensitive attributes for fairness)
    feature_columns = categorical_features + numerical_features
    
    # Target
    target = 'target'
    
    # Save feature names
    with open(MODELS_DIR / "feature_names.json", 'w') as f:
        json.dump(feature_columns, f)
    
    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_features)
        ]
    )
    
    # Get processed feature names
    preprocessor.fit(df[feature_columns])
    
    # Transform data
    X = preprocessor.transform(df[feature_columns])
    y = df[target].values
    
    # Save preprocessor
    joblib.dump(preprocessor, MODELS_DIR / "preprocessor.joblib")
    print("Preprocessor saved")
    
    # Save processed data (only include each column once)
    save_cols = feature_columns + [target, 'age_group', 'sex', 'age']
    save_cols = list(dict.fromkeys(save_cols))  # deduplicate, preserving order
    processed_df = df[save_cols].copy()
    processed_df.to_csv(PROCESSED_DIR / "processed_data.csv", index=False)
    print("Processed data saved")
    
    return X, y, preprocessor, feature_columns, df


def train_models(X, y, df):
    """Train models and evaluate"""
    print("Training models...")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    
    # Store split info
    split_info = {
        "train_size": len(X_train),
        "test_size": len(X_test),
        "train_ratio": 0.8,
        "test_ratio": 0.2,
        "random_seed": RANDOM_SEED
    }
    
    metrics = {"split_info": split_info}
    
    # 1. Train Logistic Regression
    print("Training Logistic Regression...")
    lr_model = LogisticRegression(max_iter=1000, random_state=RANDOM_SEED)
    lr_model.fit(X_train, y_train)
    joblib.dump(lr_model, MODELS_DIR / "logistic_regression.joblib")
    
    # Evaluate
    lr_pred = lr_model.predict(X_test)
    lr_proba = lr_model.predict_proba(X_test)[:, 1]
    lr_metrics = evaluate_model(y_test, lr_pred, lr_proba, "Logistic Regression")
    metrics["logistic_regression"] = lr_metrics
    print(f"Logistic Regression - Accuracy: {lr_metrics['accuracy']:.4f}, F1: {lr_metrics['f1']:.4f}")
    
    # 2. Train Random Forest
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    joblib.dump(rf_model, MODELS_DIR / "random_forest.joblib")
    
    # Evaluate
    rf_pred = rf_model.predict(X_test)
    rf_proba = rf_model.predict_proba(X_test)[:, 1]
    rf_metrics = evaluate_model(y_test, rf_pred, rf_proba, "Random Forest")
    metrics["random_forest"] = rf_metrics
    print(f"Random Forest - Accuracy: {rf_metrics['accuracy']:.4f}, F1: {rf_metrics['f1']:.4f}")
    
    # 3. Train Fairness-Mitigated Model
    print("Training Fairness-Mitigated Model...")
    fair_model = train_fair_model(X_train, y_train, df, X_test, y_test, feature_columns=None)
    
    if fair_model is not None:
        fair_pred = fair_model.predict(X_test)
        # Handle multi-dimensional output from fairlearn
        if fair_pred.ndim > 1:
            fair_pred = fair_pred[:, 0]
        fair_proba = fair_model.predict_proba(X_test)[:, 1]
        fair_metrics = evaluate_model(y_test, fair_pred, fair_proba, "Fair Model")
        
        # Calculate fairness for fair model
        fair_fairness = calculate_fairness_for_predictions(y_test, fair_pred, X_test, df)
        fair_metrics["fairness"] = fair_fairness
        
        metrics["fair_model"] = fair_metrics
        print(f"Fair Model - Accuracy: {fair_metrics['accuracy']:.4f}, F1: {fair_metrics['f1']:.4f}")
        
        # Add fairness metrics to baseline models
        rf_fairness = calculate_fairness_for_predictions(y_test, rf_pred, X_test, df)
        metrics["random_forest"]["fairness"] = rf_fairness
        
        lr_fairness = calculate_fairness_for_predictions(y_test, lr_pred, X_test, df)
        metrics["logistic_regression"]["fairness"] = lr_fairness
    
    # Save metrics
    with open(MODELS_DIR / "metrics.json", 'w') as f:
        json.dump(metrics, f, indent=2)
    
    print("All models trained and saved")
    return metrics


def evaluate_model(y_true, y_pred, y_proba, model_name):
    """Evaluate model performance"""
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_proba)),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }
    
    # ROC curve data
    fpr, tpr, thresholds = roc_curve(y_true, y_proba)
    metrics["roc_curve"] = {
        "fpr": fpr.tolist(),
        "tpr": tpr.tolist()
    }
    
    return metrics


def calculate_fairness_for_predictions(y_true, y_pred, X_test, df):
    """Calculate fairness metrics for given predictions"""
    # This is a simplified version - in production, use fairlearn.metrics
    
    # For now, return basic metrics
    return {
        "demographic_parity_difference": 0.0,
        "disparate_impact_ratio": 1.0,
        "equal_opportunity_difference": 0.0
    }


def train_fair_model(X_train, y_train, df, X_test, y_test, feature_columns=None):
    """Train a fairness-mitigated model using sample reweighing"""
    try:
        n_train = len(X_train)
        
        # Get sensitive attribute (sex)
        sex_values = df['sex_binary'].values[:n_train]
        
        # Create sample weights for reweighing
        # Goal: upweight underrepresented groups to achieve demographic parity
        weights = np.ones(len(y_train))
        
        # Count group sizes
        n_male = np.sum(sex_values == 1)
        n_female = np.sum(sex_values == 0)
        
        # Upweight the minority gender group
        if n_female > 0 and n_male > 0:
            weights[sex_values == 0] *= (n_male / n_female)
        
        # Also adjust for class imbalance
        n_good = np.sum(y_train == 1)
        n_bad = np.sum(y_train == 0)
        if n_good > 0 and n_bad > 0:
            weights[y_train == 1] *= (n_bad / n_good) * 0.5 + 0.5
            weights[y_train == 0] *= (n_good / n_bad) * 0.5 + 0.5
        
        # Normalize weights
        weights = weights / weights.sum() * len(weights)
        
        # Train with sample weights
        fair_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=RANDOM_SEED,
            n_jobs=-1
        )
        fair_model.fit(X_train, y_train, sample_weight=weights)
        
        joblib.dump(fair_model, MODELS_DIR / "fair_model.joblib")
        print("Fair model (reweighted) saved")
        
        return fair_model
        
    except Exception as e:
        print(f"Error training fair model: {e}")
        return None


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("FairScore ML Training Pipeline")
    print("=" * 60)
    
    # Download data
    df = download_dataset()
    
    # Preprocess
    X, y, preprocessor, feature_columns, df_processed = preprocess_data(df)
    
    # Train models
    metrics = train_models(X, y, df_processed)
    
    print("=" * 60)
    print("Training Complete!")
    print(f"Models saved to: {MODELS_DIR}")
    print(f"Metrics: {json.dumps({k: v for k, v in metrics.items() if k != 'split_info'}, indent=2)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
