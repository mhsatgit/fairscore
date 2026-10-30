"""
Model Service - Load and use trained ML models
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import logging
import json

from app.core.config import settings

logger = logging.getLogger(__name__)

# Mapping from integer codes to decoded text labels
CODE_MAP = {
    'checking_account': {
        1: '... < 0 DM',
        2: '0 <= ... < 200 DM',
        3: '... >= 200 DM / salary assignments for at least 1 year',
        4: 'no checking account'
    },
    'credit_history': {
        1: 'no credits taken / all credits paid back duly',
        2: 'all credits at this bank paid back duly',
        3: 'existing credits paid back duly till now',
        4: 'delay in paying off in the past',
        5: 'critical account / other credits existing (not at this bank)'
    },
    'savings_account': {
        1: '... < 100 DM',
        2: '100 <= ... < 500 DM',
        3: '500 <= ... < 1000 DM',
        4: '.. >= 1000 DM',
        5: 'unknown / no savings account'
    },
    'employment_duration': {
        1: 'unemployed',
        2: '... < 1 year',
        3: '1 <= ... < 4 years',
        4: '4 <= ... < 7 years',
        5: '.. >= 7 years'
    },
    'personal_status': {
        1: 'male: divorced/separated',
        2: 'female: divorced/separated/married',
        3: 'male: single',
        4: 'male: married/widowed',
        5: 'female: single'
    },
    'other_debtors': {
        1: 'none',
        2: 'co-applicant',
        3: 'guarantor'
    },
    'property': {
        1: 'real estate',
        2: 'building society savings agreement / life insurance',
        3: 'car or other (not in attribute 6)',
        4: 'unknown / no property'
    },
    'housing': {
        1: 'rent',
        2: 'own',
        3: 'for free'
    },
    'other_plans': {
        1: 'bank',
        2: 'stores',
        3: 'none'
    },
    'job': {
        1: 'unemployed / unskilled - non-resident',
        2: 'unskilled - resident',
        3: 'skilled employee / official',
        4: 'management / self-employed / highly qualified employee / officer'
    },
    'telephone': {
        1: 'none',
        2: "yes (registered under customer's name)"
    },
    'foreign_worker': {
        1: 'yes',
        2: 'no'
    },
    'purpose': {
        1: 'car (new)',
        2: 'car (used)',
        3: 'furniture/equipment',
        4: 'radio/television',
        5: 'domestic appliances',
        6: 'repairs',
        7: 'education',
        8: 'retraining',
        9: 'business',
        10: 'others'
    },
}


class ModelService:
    """Service for loading and using trained ML models"""
    
    def __init__(self):
        self.models = {}
        self.preprocessor = None
        self.feature_names = None
        self.is_loaded = False
        self.metrics = {}
        
    def load_models(self):
        """Load trained models from disk"""
        try:
            models_dir = settings.MODELS_DIR
            
            # Load preprocessor
            preprocessor_path = models_dir / "preprocessor.joblib"
            if preprocessor_path.exists():
                self.preprocessor = joblib.load(preprocessor_path)
                logger.info("Loaded preprocessor")
            
            # Load models
            for model_name in ["logistic_regression", "random_forest", "fair_model"]:
                model_path = models_dir / f"{model_name}.joblib"
                if model_path.exists():
                    self.models[model_name] = joblib.load(model_path)
                    logger.info(f"Loaded {model_name}")
            
            # Load feature names
            feature_names_path = models_dir / "feature_names.json"
            if feature_names_path.exists():
                with open(feature_names_path, 'r') as f:
                    self.feature_names = json.load(f)
            
            # Load metrics
            metrics_path = models_dir / "metrics.json"
            if metrics_path.exists():
                with open(metrics_path, 'r') as f:
                    self.metrics = json.load(f)
                
            self.is_loaded = True
            logger.info(f"Loaded {len(self.models)} models")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_loaded = False
            raise
    
    def get_model(self, model_name: str = "random_forest"):
        """Get a specific model"""
        if not self.is_loaded:
            raise ValueError("Models not loaded")
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not available")
        return self.models[model_name]
    
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """Preprocess input data for prediction"""
        try:
            # Map field names from API schema to model feature names
            mapped_data = {}
            field_mapping = {
                'loan_amount': 'credit_amount',
                'loan_duration': 'duration',
            }
            
            for key, value in data.items():
                # Skip API-only fields
                if key in ('model_name', 'include_fairness'):
                    continue
                # Map sex + marital_status -> personal_status
                if key == 'marital_status':
                    mapped_data['personal_status'] = value
                    continue
                if key == 'sex':
                    continue
                mapped_key = field_mapping.get(key, key)
                mapped_data[mapped_key] = value
            
            # Convert integer codes to string codes for categorical features
            for field, code_dict in CODE_MAP.items():
                if field in mapped_data:
                    int_val = mapped_data[field]
                    mapped_data[field] = code_dict.get(int_val, str(int_val))
            
            # Create DataFrame in correct column order
            if self.feature_names:
                ordered_data = {col: mapped_data.get(col, 0) for col in self.feature_names}
                df = pd.DataFrame([ordered_data])
            else:
                df = pd.DataFrame([mapped_data])
            
            # Apply preprocessor if available
            if self.preprocessor is not None:
                processed = self.preprocessor.transform(df)
                return processed
            else:
                return df.values
            
        except Exception as e:
            logger.error(f"Preprocessing error: {e}")
            raise
    
    def predict(self, data: Dict[str, Any], model_name: str = "random_forest") -> Tuple[int, float]:
        """
        Make a prediction
        Returns: (prediction, probability)
        """
        try:
            model = self.get_model(model_name)
            processed_data = self.preprocess_input(data)
            
            # Get prediction
            prediction = model.predict(processed_data)[0]
            
            # Get probability
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(processed_data)[0]
                probability = probabilities[1]  # Probability of positive class
            else:
                probability = float(prediction)
            
            return int(prediction), float(probability)
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def get_feature_importance(self, model_name: str = "random_forest") -> Optional[Dict[str, float]]:
        """Return global importance aggregated from encoded columns to raw features."""
        try:
            model = self.get_model(model_name)

            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
            elif hasattr(model, 'coef_'):
                importances = np.abs(model.coef_[0])
            else:
                return None

            raw_feature_map = self._get_transformed_feature_map()
            if raw_feature_map is None or len(importances) != len(raw_feature_map):
                return None

            aggregated = {feature: 0.0 for feature in self.feature_names}
            for raw_feature, importance in zip(raw_feature_map, importances):
                aggregated[raw_feature] += float(importance)
            return aggregated

        except Exception as e:
            logger.error(f"Error getting feature importance: {e}")
            return None

    def get_local_feature_contributions(
        self,
        data: Dict[str, Any],
        model_name: str = "random_forest"
    ) -> Optional[Dict[str, float]]:
        """
        Estimate signed, prediction-specific contributions to P(good credit).

        Tree models use changes in positive-class probability along the exact
        decision path for every tree. Encoded columns are then aggregated back
        to their original input feature. Positive values raise P(good credit),
        while negative values lower it.
        """
        try:
            model = self.get_model(model_name)
            processed = self.preprocess_input(data)
            raw_feature_map = self._get_transformed_feature_map()

            if raw_feature_map is None or processed.shape[1] != len(raw_feature_map):
                return None

            transformed_contributions = np.zeros(processed.shape[1], dtype=float)

            if hasattr(model, "estimators_") and hasattr(model, "classes_"):
                positive_matches = np.flatnonzero(np.asarray(model.classes_) == 1)
                if len(positive_matches) != 1:
                    return None
                positive_index = int(positive_matches[0])
                row = processed[0]

                for estimator in model.estimators_:
                    tree = estimator.tree_
                    node_id = 0

                    while tree.children_left[node_id] != tree.children_right[node_id]:
                        feature_index = tree.feature[node_id]
                        next_node = (
                            tree.children_left[node_id]
                            if row[feature_index] <= tree.threshold[node_id]
                            else tree.children_right[node_id]
                        )

                        parent_values = tree.value[node_id][0]
                        child_values = tree.value[next_node][0]
                        parent_probability = (
                            parent_values[positive_index] / parent_values.sum()
                            if parent_values.sum() else 0.0
                        )
                        child_probability = (
                            child_values[positive_index] / child_values.sum()
                            if child_values.sum() else 0.0
                        )
                        transformed_contributions[feature_index] += (
                            child_probability - parent_probability
                        )
                        node_id = next_node

                transformed_contributions /= len(model.estimators_)

            elif hasattr(model, "coef_"):
                transformed_contributions = np.asarray(model.coef_[0]) * processed[0]
            else:
                return None

            aggregated = {feature: 0.0 for feature in self.feature_names}
            for raw_feature, contribution in zip(
                raw_feature_map, transformed_contributions
            ):
                aggregated[raw_feature] += float(contribution)
            return aggregated

        except Exception as e:
            logger.error(f"Error calculating local feature contributions: {e}")
            return None

    def _get_transformed_feature_map(self) -> Optional[list[str]]:
        """Map each preprocessor output column back to its raw input feature."""
        if self.preprocessor is None or not self.feature_names:
            return None

        try:
            transformed_names = self.preprocessor.get_feature_names_out()
        except (AttributeError, ValueError):
            return None

        raw_features = sorted(self.feature_names, key=len, reverse=True)
        mapping = []
        for transformed_name in transformed_names:
            suffix = str(transformed_name).split("__", 1)[-1]
            raw_feature = next(
                (
                    feature for feature in raw_features
                    if suffix == feature or suffix.startswith(f"{feature}_")
                ),
                None
            )
            if raw_feature is None:
                return None
            mapping.append(raw_feature)

        return mapping
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get model metrics"""
        return self.metrics
