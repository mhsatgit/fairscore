import unittest

from pydantic import ValidationError

from app.schemas.prediction import PredictionRequest
from app.services.explainability import ExplainabilityService
from app.services.model_service import ModelService


SAMPLE_INPUT = {
    "age": 35,
    "sex": 1,
    "marital_status": 3,
    "dependents": 1,
    "housing": 2,
    "checking_account": 1,
    "savings_account": 2,
    "employment_duration": 3,
    "other_debtors": 1,
    "existing_credits": 1,
    "credit_amount": 5000,
    "duration": 24,
    "purpose": 1,
    "installment_rate": 3,
    "credit_history": 3,
    "property": 1,
    "foreign_worker": 1,
    "other_plans": 3,
    "job": 3,
    "telephone": 2,
    "residence_duration": 2,
}


class StubModelService:
    def __init__(self, contributions):
        self.contributions = contributions

    def get_local_feature_contributions(self, input_data, model_name):
        return self.contributions


class ExplanationGuardrailTests(unittest.TestCase):
    def test_good_history_stays_positive_even_for_bad_prediction(self):
        service = ExplainabilityService(
            StubModelService({"credit_history": 0.12, "duration": -0.08})
        )

        factors = service.explain_prediction(
            SAMPLE_INPUT, prediction=0, probability=0.31
        )

        credit_history = next(
            factor for factor in factors if factor.feature == "Credit History"
        )
        self.assertEqual(credit_history.impact, "Positive")
        self.assertIn("paid back duly", credit_history.value)

    def test_semantic_conflicts_are_omitted_in_both_directions(self):
        service = ExplainabilityService(
            StubModelService(
                {
                    "credit_history": -0.12,  # good history cannot be negative
                    "checking_account": 0.11,  # negative balance cannot be positive
                    "duration": -0.08,
                }
            )
        )

        factors = service.explain_prediction(
            SAMPLE_INPUT, prediction=0, probability=0.31
        )
        names = {factor.feature for factor in factors}

        self.assertNotIn("Credit History", names)
        self.assertNotIn("Checking Account", names)

    def test_protected_attributes_are_not_individual_reasons(self):
        service = ExplainabilityService(
            StubModelService({"age": -0.2, "foreign_worker": 0.1, "job": 0.05})
        )

        factors = service.explain_prediction(
            SAMPLE_INPUT, prediction=1, probability=0.76
        )
        names = {factor.feature for factor in factors}

        self.assertNotIn("Age", names)
        self.assertNotIn("Foreign Worker", names)


class SavedModelExplanationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.model_service = ModelService()
        cls.model_service.load_models()
        cls.explainability = ExplainabilityService(cls.model_service)

    def test_encoded_importance_is_aggregated_to_raw_features(self):
        importance = self.model_service.get_feature_importance("random_forest")
        self.assertIsNotNone(importance)
        self.assertEqual(set(importance), set(self.model_service.feature_names))
        self.assertEqual(len(importance), 20)

    def test_saved_model_never_emits_contradictory_factors(self):
        prediction, probability = self.model_service.predict(
            SAMPLE_INPUT, "random_forest"
        )
        factors = self.explainability.explain_prediction(
            SAMPLE_INPUT, prediction, probability, "random_forest"
        )

        for factor in factors:
            if factor.feature == "Credit History":
                self.assertEqual(factor.impact, "Positive")
            if factor.feature == "Checking Account":
                self.assertEqual(factor.impact, "Negative")
            self.assertNotIn(factor.feature, {"Age", "Foreign Worker"})


class PredictionValidationTests(unittest.TestCase):
    def test_rejects_conflicting_sex_and_personal_status(self):
        invalid = dict(SAMPLE_INPUT)
        invalid["marital_status"] = 5
        with self.assertRaises(ValidationError):
            PredictionRequest(**invalid)

    def test_accepts_matching_sex_and_personal_status(self):
        PredictionRequest(**SAMPLE_INPUT)


if __name__ == "__main__":
    unittest.main()
