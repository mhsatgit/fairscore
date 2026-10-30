'use client'

import { useState } from 'react'
import { 
  User, 
  CreditCard, 
  Banknote, 
  History,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { predictCreditRisk, PredictionRequest, PredictionResponse } from '@/lib/api'

interface FormData {
  // Personal
  age: number
  sex: number
  marital_status: number
  dependents: number
  housing: number
  // Financial
  checking_account: number
  savings_account: number
  employment_duration: number
  other_debtors: number
  existing_credits: number
  // Loan
  credit_amount: number
  duration: number
  purpose: number
  installment_rate: number
  // Credit History
  credit_history: number
  property: number
  // Additional
  foreign_worker: number
  other_plans: number
  job: number
  telephone: number
  residence_duration: number
}

const initialFormData: FormData = {
  age: 35,
  sex: 1,
  marital_status: 1,
  dependents: 1,
  housing: 2,
  checking_account: 1,
  savings_account: 2,
  employment_duration: 3,
  other_debtors: 1,
  existing_credits: 1,
  credit_amount: 5000,
  duration: 24,
  purpose: 1,
  installment_rate: 3,
  credit_history: 3,
  property: 1,
  foreign_worker: 1,
  other_plans: 3,
  job: 3,
  telephone: 2,
  residence_duration: 2,
}

export default function PredictPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    financial: true,
    loan: true,
    credit: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const numericValue = parseInt(value) || 0
    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
      // Personal status and sex are a single categorical feature in the
      // source dataset, so keep the two controls internally consistent.
      ...(name === 'sex' && {
        marital_status: numericValue === 1 ? 3 : 5,
      }),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await predictCreditRisk({
        ...formData,
        model_name: 'random_forest',
        include_fairness: true,
      })
      setResult(response)

      // Save to history
      try {
        const { addToHistory } = await import('@/lib/api')
        await addToHistory({
          timestamp: new Date().toISOString(),
          prediction: response.prediction,
          probability: response.probability,
          risk_score: response.risk_score,
          risk_level: response.risk_level,
          model: response.model,
        })
      } catch (e) {
        // Ignore history save errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <h1 className="text-3xl font-bold text-slate-900">Credit Prediction</h1>
        <p className="text-slate-600 mt-1">
          Enter applicant information to analyze credit risk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="card">
            <button
              type="button"
              onClick={() => toggleSection('personal')}
              className="w-full flex items-center justify-between"
              aria-expanded={expandedSections.personal}
              aria-controls="personal-fields"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary-600" />
                <h2 className="section-title mb-0">Personal Information</h2>
              </div>
              {expandedSections.personal ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedSections.personal && (
              <div id="personal-fields" className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min={18}
                    max={100}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="label" htmlFor="sex">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Male</option>
                    <option value={2}>Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="marital_status">Marital Status</label>
                  <select
                    id="marital_status"
                    name="marital_status"
                    value={formData.marital_status}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    {formData.sex === 1 ? (
                      <>
                        <option value={1}>Divorced/separated</option>
                        <option value={3}>Single</option>
                        <option value={4}>Married/widowed</option>
                      </>
                    ) : (
                      <>
                        <option value={2}>Divorced/separated/married</option>
                        <option value={5}>Single</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="dependents">Dependents</label>
                  <select
                    id="dependents"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4+</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="label" htmlFor="housing">Housing</label>
                  <select
                    id="housing"
                    name="housing"
                    value={formData.housing}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Rent</option>
                    <option value={2}>Own house</option>
                    <option value={3}>For free</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="card">
            <button
              type="button"
              onClick={() => toggleSection('financial')}
              className="w-full flex items-center justify-between"
              aria-expanded={expandedSections.financial}
              aria-controls="financial-fields"
            >
              <div className="flex items-center gap-3">
                <Banknote className="w-5 h-5 text-accent-600" />
                <h2 className="section-title mb-0">Financial Information</h2>
              </div>
              {expandedSections.financial ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedSections.financial && (
              <div id="financial-fields" className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="checking_account">Checking Account</label>
                  <select
                    id="checking_account"
                    name="checking_account"
                    value={formData.checking_account}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Balance below 0</option>
                    <option value={2}>Balance between 0 and 200</option>
                    <option value={3}>Balance above 200</option>
                    <option value={4}>No checking account</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="savings_account">Savings Account</label>
                  <select
                    id="savings_account"
                    name="savings_account"
                    value={formData.savings_account}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Below 100 DM</option>
                    <option value={2}>100-500 DM</option>
                    <option value={3}>500-1000 DM</option>
                    <option value={4}>Above 1000 DM</option>
                    <option value={5}>Unknown/no savings account</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="employment_duration">Employment Duration</label>
                  <select
                    id="employment_duration"
                    name="employment_duration"
                    value={formData.employment_duration}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Unemployed</option>
                    <option value={2}>Less than 1 year</option>
                    <option value={3}>1-4 years</option>
                    <option value={4}>4-7 years</option>
                    <option value={5}>Above 7 years</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="other_debtors">Other Debtors</label>
                  <select
                    id="other_debtors"
                    name="other_debtors"
                    value={formData.other_debtors}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>None</option>
                    <option value={2}>Co-applicant</option>
                    <option value={3}>Guarantor</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="label" htmlFor="existing_credits">Existing Credits</label>
                  <select
                    id="existing_credits"
                    name="existing_credits"
                    value={formData.existing_credits}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>1</option>
                    <option value={2}>2-3</option>
                    <option value={3}>4-5</option>
                    <option value={4}>6+</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Loan Information */}
          <div className="card">
            <button
              type="button"
              onClick={() => toggleSection('loan')}
              className="w-full flex items-center justify-between"
              aria-expanded={expandedSections.loan}
              aria-controls="loan-fields"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-yellow-600" />
                <h2 className="section-title mb-0">Loan Information</h2>
              </div>
              {expandedSections.loan ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedSections.loan && (
              <div id="loan-fields" className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="credit_amount">Loan Amount (DM)</label>
                  <input
                    id="credit_amount"
                    type="number"
                    name="credit_amount"
                    value={formData.credit_amount}
                    onChange={handleChange}
                    min={250}
                    max={20000}
                    className="input"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">250 - 20,000 DM</p>
                </div>
                
                <div>
                  <label className="label" htmlFor="duration">Loan Duration (months)</label>
                  <input
                    id="duration"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min={4}
                    max={72}
                    className="input"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">4 - 72 months</p>
                </div>
                
                <div>
                  <label className="label" htmlFor="purpose">Purpose</label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>New car</option>
                    <option value={2}>Used car</option>
                    <option value={3}>Furniture/equipment</option>
                    <option value={4}>Radio/television</option>
                    <option value={5}>Domestic appliances</option>
                    <option value={6}>Repairs</option>
                    <option value={7}>Education</option>
                    <option value={8}>Retraining</option>
                    <option value={9}>Business</option>
                    <option value={10}>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="installment_rate">Installment Rate (%)</label>
                  <select
                    id="installment_rate"
                    name="installment_rate"
                    value={formData.installment_rate}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Low (&lt;20%)</option>
                    <option value={2}>Medium (20-25%)</option>
                    <option value={3}>High (25-35%)</option>
                    <option value={4}>Very High (&gt;35%)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Credit History */}
          <div className="card">
            <button
              type="button"
              onClick={() => toggleSection('credit')}
              className="w-full flex items-center justify-between"
              aria-expanded={expandedSections.credit}
              aria-controls="credit-fields"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-purple-600" />
                <h2 className="section-title mb-0">Credit History</h2>
              </div>
              {expandedSections.credit ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {expandedSections.credit && (
              <div id="credit-fields" className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="credit_history">Credit History</label>
                  <select
                    id="credit_history"
                    name="credit_history"
                    value={formData.credit_history}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>No credits taken</option>
                    <option value={2}>All credits paid properly</option>
                    <option value={3}>Existing credits paid properly</option>
                    <option value={4}>Delay in paying previous credits</option>
                    <option value={5}>Critical account/other credits</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="property">Property</label>
                  <select
                    id="property"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    className="select"
                    required
                  >
                    <option value={1}>Real estate</option>
                    <option value={2}>Building society savings</option>
                    <option value={3}>Car or other</option>
                    <option value={4}>Unknown/no property</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="other_plans">Other Installment Plans</label>
                  <select
                    id="other_plans"
                    name="other_plans"
                    value={formData.other_plans}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value={1}>Bank</option>
                    <option value={2}>Stores</option>
                    <option value={3}>None</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="job">Job</label>
                  <select
                    id="job"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value={1}>Unskilled non-resident</option>
                    <option value={2}>Unskilled resident</option>
                    <option value={3}>Skilled</option>
                    <option value={4}>Highly skilled</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="telephone">Telephone</label>
                  <select
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value={1}>None</option>
                    <option value={2}>Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="label" htmlFor="residence_duration">Residence Duration</label>
                  <select
                    id="residence_duration"
                    name="residence_duration"
                    value={formData.residence_duration}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value={1}>1 year</option>
                    <option value={2}>2 years</option>
                    <option value={3}>3 years</option>
                    <option value={4}>4+ years</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="label" htmlFor="foreign_worker">Foreign Worker</label>
                  <select
                    id="foreign_worker"
                    name="foreign_worker"
                    value={formData.foreign_worker}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value={1}>Yes</option>
                    <option value={2}>No</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Analyze Credit Risk
              </>
            )}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-6">
          {error && (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Main Result */}
              <div className={`card glass-liquid prediction-result ${
                result.prediction === 'Good' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              }`}>
                <span className="prediction-result__lens" aria-hidden="true" />
                <div className="prediction-result__content text-center">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                    result.prediction === 'Good' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {result.prediction === 'Good' ? (
                      <CheckCircle className="w-10 h-10 text-white" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-white" />
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold mt-4 text-slate-900">
                    FairScore Result
                  </h2>
                  
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Credit Risk</p>
                    <p className={`text-4xl font-bold ${
                      result.prediction === 'Good' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.prediction}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-slate-600">Good-Credit Score</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {result.risk_score}/100
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Good Credit Probability</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(result.probability * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Risk Level</p>
                      <p className={`text-2xl font-bold ${
                        result.risk_level === 'Low' ? 'text-green-600' :
                        result.risk_level === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {result.risk_level}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-4">
                    Model: {result.model}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              {result.explanation && result.explanation.length > 0 && (
                <div className="card">
                  <h3 className="section-title">Why This Prediction?</h3>
                  <p className="mb-4 text-sm text-slate-600">
                    Factors show how this applicant&apos;s inputs influenced the probability of a good credit outcome.
                  </p>
                  
                  <div className="space-y-4">
                    {/* Positive Factors */}
                    {result.explanation.some(e => e.impact === 'Positive') && <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2">
                        Positive Factors
                      </h4>
                      <div className="space-y-2">
                        {result.explanation
                          .filter(e => e.impact === 'Positive')
                          .map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-slate-900">{factor.feature}</p>
                                <p className="text-sm text-slate-600">{factor.value}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>}
                    
                    {/* Negative Factors */}
                    {result.explanation.some(e => e.impact === 'Negative') && <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2">
                        Negative Factors
                      </h4>
                      <div className="space-y-2">
                        {result.explanation
                          .filter(e => e.impact === 'Negative')
                          .map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-slate-900">{factor.feature}</p>
                                <p className="text-sm text-slate-600">{factor.value}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>}
                  </div>
                </div>
              )}

              {/* Fairness Context */}
              {result.fairness_context && (
                <div className="card">
                  <h3 className="section-title">Fairness Context</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Gender Group</p>
                      <p className="font-medium text-slate-900">
                        {result.fairness_context.gender_group}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">Age Group</p>
                      <p className="font-medium text-slate-900">
                        {result.fairness_context.age_group}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="card bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="card text-center py-12">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">
                No prediction yet
              </h3>
              <p className="mt-2 text-slate-600">
                Fill in the applicant information and click &quot;Analyze Credit Risk&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
