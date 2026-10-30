'use client'

import { useEffect, useState } from 'react'
import { 
  Clock, 
  AlertTriangle,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getPredictionHistory, clearHistory, PredictionHistoryItem } from '@/lib/api'

interface HistoryData {
  predictions: PredictionHistoryItem[]
  loading: boolean
  error: string | null
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryData>({
    predictions: [],
    loading: true,
    error: null,
  })

  const fetchHistory = async () => {
    try {
      const predictions = await getPredictionHistory().catch(() => [])
      setData({
        predictions,
        loading: false,
        error: null,
      })
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load prediction history',
      }))
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all prediction history?')) {
      try {
        await clearHistory()
        setData(prev => ({
          ...prev,
          predictions: [],
        }))
      } catch (error) {
        console.error('Failed to clear history:', error)
      }
    }
  }

  if (data.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Prediction History</h1>
        <div className="card animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Prediction History</h1>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>{data.error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prediction History</h1>
          <p className="text-slate-600 mt-1">
            View past credit risk predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {data.predictions.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Predictions</p>
              <p className="text-3xl font-bold text-slate-900">
                {data.predictions.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Good Predictions</p>
              <p className="text-3xl font-bold text-green-600">
                {data.predictions.filter(p => p.prediction === 'Good').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Bad Predictions</p>
              <p className="text-3xl font-bold text-red-600">
                {data.predictions.filter(p => p.prediction === 'Bad').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      {data.predictions.length === 0 ? (
        <div className="card text-center py-12">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">
            No predictions yet
          </h3>
          <p className="mt-2 text-slate-600">
            Make a prediction to see it appear here
          </p>
          <a
            href="/predict"
            className="mt-4 inline-flex items-center gap-2 btn-primary"
          >
            Make a Prediction
          </a>
        </div>
      ) : (
        <div className="card history-table">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Prediction</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Probability</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Risk Score</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Risk Level</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.predictions.map((prediction) => (
                  <tr key={prediction.id} className="hover:bg-slate-50">
                    <td data-label="Date" className="py-3 px-4 text-slate-900">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </td>
                    <td data-label="Prediction" className="py-3 px-4">
                      <span className={`badge ${
                        prediction.prediction === 'Good' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {prediction.prediction}
                      </span>
                    </td>
                    <td data-label="Probability" className="py-3 px-4 text-slate-700">
                      {(prediction.probability * 100).toFixed(1)}%
                    </td>
                    <td data-label="Risk score" className="py-3 px-4 text-slate-700">
                      {prediction.risk_score}/100
                    </td>
                    <td data-label="Risk level" className="py-3 px-4">
                      <span className={`badge ${
                        prediction.risk_level === 'Low' ? 'badge-success' :
                        prediction.risk_level === 'Medium' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {prediction.risk_level}
                      </span>
                    </td>
                    <td data-label="Model" className="py-3 px-4 text-slate-700">
                      {prediction.model}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
