"""Prediction-specific, semantically guarded model explanations."""

import logging
from typing import Any, Dict, List, Optional

from app.schemas.prediction import ExplanationFactor
from app.services.model_service import CODE_MAP

logger = logging.getLogger(__name__)

MAX_EXPLANATION_FACTORS = 8
MIN_LOCAL_CONTRIBUTION = 0.002

# These attributes are available for fairness auditing, but should not be
# presented as reasons for an individual credit outcome.
EXCLUDED_EXPLANATION_FEATURES = {"age", "personal_status", "foreign_worker"}

# Values with a clear business meaning. This is a guardrail, not a substitute
# for the model contribution: when the learned model direction conflicts with
# the business meaning, the factor is omitted instead of being mislabelled.
CATEGORICAL_POLARITY = {
    "checking_account": {
        1: "Negative",  # balance below zero
        3: "Positive",  # balance >= 200 DM
    },
    "credit_history": {
        1: "Positive",
        2: "Positive",
        3: "Positive",
        4: "Negative",
        5: "Negative",
    },
    "savings_account": {
        1: "Negative",
        3: "Positive",
        4: "Positive",
    },
    "employment_duration": {
        1: "Negative",
        2: "Negative",
        4: "Positive",
        5: "Positive",
    },
    "other_debtors": {3: "Positive"},
    "property": {
        1: "Positive",
        2: "Positive",
        4: "Negative",
    },
    "housing": {2: "Positive"},
    "other_plans": {
        1: "Negative",
        2: "Negative",
        3: "Positive",
    },
    "job": {
        1: "Negative",
        3: "Positive",
        4: "Positive",
    },
    "telephone": {2: "Positive"},
    "installment_rate": {
        1: "Positive",
        4: "Negative",
    },
}


class ExplainabilityService:
    """Generate local factors which consistently describe P(good credit)."""

    def __init__(self, model_service):
        self.model_service = model_service

    def explain_prediction(
        self,
        input_data: Dict[str, Any],
        prediction: int,
        probability: float,
        model_name: str = "random_forest",
    ) -> List[ExplanationFactor]:
        """
        Explain this applicant's probability of a good credit outcome.

        The impact direction comes from the applicant's local model path, not
        from the final Good/Bad class. Clear business semantics are then used
        to suppress contradictory labels. Consequently, a positive factor can
        remain positive even when the overall prediction is Bad.
        """
        del prediction, probability  # Direction must not depend on the outcome label.

        try:
            contributions = self.model_service.get_local_feature_contributions(
                input_data, model_name
            )
            if not contributions:
                return self._semantic_fallback(input_data)

            candidates = []
            for feature_name, contribution in contributions.items():
                if feature_name in EXCLUDED_EXPLANATION_FEATURES:
                    continue
                if feature_name not in input_data:
                    continue
                if abs(contribution) < MIN_LOCAL_CONTRIBUTION:
                    continue

                value = input_data[feature_name]
                model_impact = "Positive" if contribution > 0 else "Negative"
                semantic_impact = self._semantic_impact(feature_name, value)

                # Never show an obviously favorable value as a negative factor,
                # or an obviously adverse value as a positive factor. A conflict
                # reveals non-monotonic model behavior and is safer to omit.
                if semantic_impact and semantic_impact != model_impact:
                    logger.info(
                        "Suppressing contradictory explanation for %s=%s: %s vs %s",
                        feature_name,
                        value,
                        model_impact,
                        semantic_impact,
                    )
                    continue

                candidates.append(
                    ExplanationFactor(
                        feature=self._format_feature_name(feature_name),
                        impact=semantic_impact or model_impact,
                        value=self._get_readable_value(feature_name, value),
                        importance=round(abs(float(contribution)), 6),
                    )
                )

            if not candidates:
                return self._semantic_fallback(input_data)
            return self._select_balanced_factors(candidates)

        except Exception as exc:
            logger.error("Explanation error: %s", exc)
            return self._semantic_fallback(input_data)

    def _semantic_fallback(
        self, input_data: Dict[str, Any]
    ) -> List[ExplanationFactor]:
        """Return only factors whose input values have unambiguous semantics."""
        factors = []
        for feature_name, value in input_data.items():
            if feature_name in EXCLUDED_EXPLANATION_FEATURES:
                continue
            impact = self._semantic_impact(feature_name, value)
            if impact is None:
                continue
            factors.append(
                ExplanationFactor(
                    feature=self._format_feature_name(feature_name),
                    impact=impact,
                    value=self._get_readable_value(feature_name, value),
                )
            )
        return self._select_balanced_factors(factors)

    def _semantic_impact(self, feature_name: str, value: Any) -> Optional[str]:
        """Return a business-semantic direction only when it is unambiguous."""
        categorical = CATEGORICAL_POLARITY.get(feature_name, {})
        if value in categorical:
            return categorical[value]

        if feature_name == "duration":
            if value <= 12:
                return "Positive"
            if value > 36:
                return "Negative"
        elif feature_name == "credit_amount":
            if value <= 2000:
                return "Positive"
            if value > 10000:
                return "Negative"
        elif feature_name == "residence_duration":
            if value >= 3:
                return "Positive"
        elif feature_name == "existing_credits":
            if value == 1:
                return "Positive"
            if value >= 3:
                return "Negative"
        elif feature_name == "dependents":
            if value == 1:
                return "Positive"
            if value >= 3:
                return "Negative"

        return None

    def _select_balanced_factors(
        self, factors: List[ExplanationFactor]
    ) -> List[ExplanationFactor]:
        """Prefer up to four factors from each direction, then fill by impact."""
        ranked = sorted(
            factors,
            key=lambda factor: factor.importance or 0.0,
            reverse=True,
        )
        positive = [factor for factor in ranked if factor.impact == "Positive"]
        negative = [factor for factor in ranked if factor.impact == "Negative"]

        selected = positive[:4] + negative[:4]
        if len(selected) < MAX_EXPLANATION_FACTORS:
            selected_ids = {id(factor) for factor in selected}
            remaining = [factor for factor in ranked if id(factor) not in selected_ids]
            selected.extend(remaining[: MAX_EXPLANATION_FACTORS - len(selected)])

        return sorted(
            selected,
            key=lambda factor: factor.importance or 0.0,
            reverse=True,
        )

    def _get_readable_value(self, feature_name: str, value: Any) -> str:
        """Convert request values to the exact meaning used by preprocessing."""
        if feature_name in CODE_MAP:
            return CODE_MAP[feature_name].get(value, str(value))

        if feature_name == "credit_amount":
            return f"{value:,} DM"
        if feature_name == "duration":
            return f"{value} months"
        if feature_name == "residence_duration":
            return f"{value} years"
        return str(value)

    def _format_feature_name(self, feature_name: str) -> str:
        display_names = {
            "credit_amount": "Loan Amount",
            "duration": "Loan Duration",
        }
        return display_names.get(feature_name, feature_name.replace("_", " ").title())
