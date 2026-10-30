/**
 * FairScore API Client
 * Centralized API communication with the FastAPI backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

async function fetchAPI<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error')
  }
}

// Health check
export async function checkHealth() {
  return fetchAPI<any>('/api/health')
}

// Metrics
export async function getMetrics() {
  return fetchAPI<any>('/api/metrics')
}

export async function getModelInfo() {
  return fetchAPI<any>('/api/model-info')
}

// Fairness
export async function getFairnessMetrics() {
  return fetchAPI<any>('/api/fairness')
}

export async function getFairnessComparison() {
  return fetchAPI<any>('/api/fairness/comparison')
}

// Dataset
export async function getDatasetInfo() {
  return fetchAPI<any>('/api/dataset')
}

// Prediction
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
  credit_amount: number
  duration: number
  purpose: number
  installment_rate: number
  credit_history: number
  property: number
  foreign_worker: number
  other_plans?: number
  job?: number
  telephone?: number
  residence_duration?: number
  model_name?: string
  include_fairness?: boolean
}

export interface PredictionResponse {
  prediction: string
  probability: number
  risk_score: number
  risk_level: string
  model: string
  explanation: Array<{
    feature: string
    impact: string
    value: string
    importance?: number
  }>
  fairness_context?: {
    gender_group?: string
    age_group?: string
  }
  disclaimer: string
}

export async function predictCreditRisk(data: PredictionRequest) {
  return fetchAPI<PredictionResponse>('/api/predict', {
    method: 'POST',
    body: data,
  })
}

export async function predictWithFairness(data: PredictionRequest) {
  return fetchAPI<any>('/api/predict-with-fairness', {
    method: 'POST',
    body: data,
  })
}

// History
export interface PredictionHistoryItem {
  id: number
  timestamp: string
  prediction: string
  probability: number
  risk_score: number
  risk_level: string
  model: string
}

export async function getPredictionHistory(limit: number = 50) {
  return fetchAPI<PredictionHistoryItem[]>(`/api/history?limit=${limit}`)
}

export async function addToHistory(data: Omit<PredictionHistoryItem, 'id'>) {
  return fetchAPI<PredictionHistoryItem>('/api/history', {
    method: 'POST',
    body: data,
  })
}

export async function clearHistory() {
  return fetchAPI<any>('/api/history', { method: 'DELETE' })
}
