'use client'

import { useEffect, useState } from 'react'
import { 
  Database, 
  Cpu, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts'
import { getMetrics, getDatasetInfo, getFairnessMetrics } from '@/lib/api'

interface DashboardData {
  metrics: any
  dataset: any
  fairness: any
  loading: boolean
  error: string | null
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    dataset: null,
    fairness: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [metrics, dataset, fairness] = await Promise.all([
          getMetrics().catch(() => null),
          getDatasetInfo().catch(() => null),
          getFairnessMetrics().catch(() => null),
        ])

        setData({
          metrics,
          dataset,
          fairness,
          loading: false,
          error: null,
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data',
        }))
      }
    }

    fetchData()
  }, [])

  if (data.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>{data.error}</p>
          </div>
          <p className="mt-2 text-sm text-red-600">
            Please ensure the FastAPI backend is running at http://localhost:8000
          </p>
        </div>
      </div>
    )
  }

  const metrics = data.metrics?.random_forest || {}
  const dataset = data.dataset || {}
  const fairness = data.fairness || {}

  // Prepare model comparison data
  const modelComparisonData = [
    {
      name: 'Accuracy',
      'Logistic Regression': (data.metrics?.logistic_regression?.accuracy || 0) * 100,
      'Random Forest': (data.metrics?.random_forest?.accuracy || 0) * 100,
    },
    {
      name: 'Precision',
      'Logistic Regression': (data.metrics?.logistic_regression?.precision || 0) * 100,
      'Random Forest': (data.metrics?.random_forest?.precision || 0) * 100,
    },
    {
      name: 'Recall',
      'Logistic Regression': (data.metrics?.logistic_regression?.recall || 0) * 100,
      'Random Forest': (data.metrics?.random_forest?.recall || 0) * 100,
    },
    {
      name: 'F1 Score',
      'Logistic Regression': (data.metrics?.logistic_regression?.f1 || 0) * 100,
      'Random Forest': (data.metrics?.random_forest?.f1 || 0) * 100,
    },
    {
      name: 'ROC-AUC',
      'Logistic Regression': (data.metrics?.logistic_regression?.roc_auc || 0) * 100,
      'Random Forest': (data.metrics?.random_forest?.roc_auc || 0) * 100,
    },
  ]

  // Fairness radar data
  const fairnessRadarData = [
    {
      metric: 'Gender Fairness',
      value: fairness.gender_fairness?.disparate_impact_ratio || 1,
      fullMark: 1,
    },
    {
      metric: 'Age Fairness',
      value: fairness.age_fairness?.disparate_impact_ratio || 1,
      fullMark: 1,
    },
    {
      metric: 'Demographic Parity',
      value: 1 - (fairness.gender_fairness?.demographic_parity_difference || 0),
      fullMark: 1,
    },
    {
      metric: 'Equal Opportunity',
      value: 1 - (fairness.gender_fairness?.equal_opportunity_difference || 0),
      fullMark: 1,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Overview hero */}
      <section className="page-hero dashboard-hero" aria-labelledby="dashboard-title">
        <span className="liquid-refractive-layer" aria-hidden="true" />
        <div className="page-hero__content">
          <p className="hero-kicker"><ShieldCheck className="h-4 w-4" /> Decision intelligence, made accountable</p>
          <h1 id="dashboard-title" className="text-3xl font-bold text-slate-900">Credit decisions with clarity built in.</h1>
          <p className="text-slate-600 mt-3">
            Monitor predictive quality, fairness signals, and dataset health from one calm, transparent workspace.
          </p>
          <div className="hero-actions">
            <a href="/predict" className="hero-link">Analyze credit risk <ArrowUpRight className="h-4 w-4" /></a>
            <a href="/fairness" className="hero-link">Review fairness <ArrowUpRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Dataset Size</p>
              <p className="text-3xl font-bold text-slate-900">
                {dataset.total_records || 1000}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">UCI German Credit Dataset</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Features</p>
              <p className="text-3xl font-bold text-slate-900">
                {dataset.features || 20}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Input variables</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Model Accuracy</p>
              <p className="text-3xl font-bold text-slate-900">
                {((metrics.accuracy || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Random Forest model</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">F1 Score</p>
              <p className="text-3xl font-bold text-slate-900">
                {((metrics.f1 || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Balanced metric</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">ROC-AUC</p>
              <p className="text-3xl font-bold text-slate-900">
                {((metrics.roc_auc || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Discrimination ability</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Fairness Status</p>
              <p className="text-3xl font-bold text-slate-900">
                {fairness.overall_status || 'Loading...'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              fairness.overall_status === 'Low Disparity' 
                ? 'bg-green-100' 
                : fairness.overall_status === 'Moderate Disparity'
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                fairness.overall_status === 'Low Disparity' 
                  ? 'text-green-600' 
                  : fairness.overall_status === 'Moderate Disparity'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on demographic parity</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Performance */}
        <div className="card">
          <h2 className="section-title">Model Performance</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {((metrics.accuracy || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {((metrics.precision || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Precision</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {((metrics.recall || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Recall</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {((metrics.f1 || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">F1</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  {((metrics.roc_auc || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">ROC-AUC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fairness Overview */}
        <div className="card">
          <h2 className="section-title">Fairness Overview</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600">Gender Fairness</p>
                <p className="text-lg font-semibold text-slate-900">
                  DI: {(fairness.gender_fairness?.disparate_impact_ratio || 0).toFixed(3)}
                </p>
                <p className="text-xs text-slate-500">
                  DP Diff: {(fairness.gender_fairness?.demographic_parity_difference || 0).toFixed(3)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-600">Age Fairness</p>
                <p className="text-lg font-semibold text-slate-900">
                  DI: {(fairness.age_fairness?.disparate_impact_ratio || 0).toFixed(3)}
                </p>
                <p className="text-xs text-slate-500">
                  DP Diff: {(fairness.age_fairness?.demographic_parity_difference || 0).toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Chart */}
      <div className="card">
        <h2 className="section-title">Model Comparison</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Bar dataKey="Logistic Regression" fill="#3b82f6" />
              <Bar dataKey="Random Forest" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confusion Matrix */}
      {metrics.confusion_matrix && (
        <div className="card">
          <h2 className="section-title">Confusion Matrix - Random Forest</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div></div>
              <div className="font-medium text-slate-600 p-2">Predicted Good</div>
              <div className="font-medium text-slate-600 p-2">Predicted Bad</div>
              
              <div className="font-medium text-slate-600 p-2">Actual Good</div>
              <div className="bg-green-100 text-green-800 p-4 rounded font-bold text-xl">
                {metrics.confusion_matrix[1][1]}
              </div>
              <div className="bg-red-100 text-red-800 p-4 rounded font-bold text-xl">
                {metrics.confusion_matrix[1][0]}
              </div>
              
              <div className="font-medium text-slate-600 p-2">Actual Bad</div>
              <div className="bg-red-100 text-red-800 p-4 rounded font-bold text-xl">
                {metrics.confusion_matrix[0][1]}
              </div>
              <div className="bg-green-100 text-green-800 p-4 rounded font-bold text-xl">
                {metrics.confusion_matrix[0][0]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/predict"
            className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">New Prediction</p>
              <p className="text-sm text-slate-600">Analyze credit risk</p>
            </div>
          </a>
          
          <a
            href="/fairness"
            className="flex items-center gap-3 p-4 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
          >
            <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Fairness Audit</p>
              <p className="text-sm text-slate-600">Check model bias</p>
            </div>
          </a>
          
          <a
            href="/model"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Model Details</p>
              <p className="text-sm text-slate-600">View performance</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
