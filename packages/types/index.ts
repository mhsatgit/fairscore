/**
 * FairScore Shared Types
 */

// Prediction Types
export interface PredictionRequest {
  age: number
  sex: number
  marital_status: number
  dependents: number
  housing: number
  checking_account: number
  savings_account: number
  employment_duration: number
  other_debtors: number
  existing_credits: number
  loan_amount: number
  loan_duration: number
  purpose: number
  installment_rate: number
  credit_history: number
  property: number
  foreign_worker: number
  model_name?: string
  include_fairness?: boolean
}

export interface ExplanationFactor {
  feature: string
  impact: string
  value: string
  importance?: number
}

export interface FairnessContext {
  gender_group?: string
  age_group?: string
}

export interface PredictionResponse {
  prediction: string
  probability: number
  risk_score: number
  risk_level: string
  model: string
  explanation: ExplanationFactor[]
  fairness_context?: FairnessContext
  disclaimer: string
}

// Metrics Types
export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1: number
  roc_auc: number
  confusion_matrix: number[][]
  roc_curve: {
    fpr: number[]
    tpr: number[]
  }
}

export interface FairnessMetrics {
  selection_rate: number
  tpr: number
  fpr: number
  count: number
}

export interface GroupFairness {
  male?: FairnessMetrics
  female?: FairnessMetrics
  young?: FairnessMetrics
  older?: FairnessMetrics
  demographic_parity_difference: number
  disparate_impact_ratio: number
  equal_opportunity_difference: number
}

// Dataset Types
export interface DatasetInfo {
  total_records: number
  features: number
  good_credit: number
  bad_credit: number
  distributions: Record<string, any>
}

// History Types
export interface PredictionHistoryItem {
  id: number
  timestamp: string
  prediction: string
  probability: number
  risk_score: number
  risk_level: string
  model: string
}
