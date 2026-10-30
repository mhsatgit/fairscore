'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Database,
  Layers
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { getMetrics, getModelInfo } from '@/lib/api'

interface ModelData {
  metrics: any
  modelInfo: any
  loading: boolean
  error: string | null
}

export default function ModelPage() {
  const [data, setData] = useState<ModelData>({
    metrics: null,
    modelInfo: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [metrics, modelInfo] = await Promise.all([
          getMetrics().catch(() => null),
          getModelInfo().catch(() => null),
        ])

        setData({
          metrics,
          modelInfo,
          loading: false,
          error: null,
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load model data',
        }))
      }
    }

    fetchData()
  }, [])

  if (data.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Model Performance</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Model Performance</h1>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>{data.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const metrics = data.metrics || {}
  const lr = metrics.logistic_regression || {}
  const rf = metrics.random_forest || {}
  const fair = metrics.fair_model || {}
  const splitInfo = metrics.split_info || {}

  // Prepare comparison data
  const models = [
    { name: 'Logistic Regression', ...lr, color: '#3b82f6' },
    { name: 'Random Forest', ...rf, color: '#22c55e' },
    ...(fair.accuracy ? [{ name: 'Fair Model', ...fair, color: '#f59e0b' }] : []),
  ]

  const comparisonData = [
    {
      name: 'Accuracy',
      ...Object.fromEntries(models.map(m => [m.name, (m.accuracy || 0) * 100])),
    },
    {
      name: 'Precision',
      ...Object.fromEntries(models.map(m => [m.name, (m.precision || 0) * 100])),
    },
    {
      name: 'Recall',
      ...Object.fromEntries(models.map(m => [m.name, (m.recall || 0) * 100])),
    },
    {
      name: 'F1 Score',
      ...Object.fromEntries(models.map(m => [m.name, (m.f1 || 0) * 100])),
    },
    {
      name: 'ROC-AUC',
      ...Object.fromEntries(models.map(m => [m.name, (m.roc_auc || 0) * 100])),
    },
  ]

  // ROC Curve data
  const rocData = []
  if (rf.roc_curve?.fpr && rf.roc_curve?.tpr) {
    for (let i = 0; i < Math.min(rf.roc_curve.fpr.length, 50); i++) {
      rocData.push({
        fpr: rf.roc_curve.fpr[i],
        tpr_rf: rf.roc_curve.tpr[i],
        tpr_lr: lr.roc_curve?.tpr?.[i] || 0,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <h1 className="text-3xl font-bold text-slate-900">Model Performance</h1>
        <p className="text-slate-600 mt-1">
          Detailed analysis of trained machine learning models
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.name} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <h3 className="font-semibold text-slate-900">{model.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-slate-50 rounded">
                <p className="text-2xl font-bold text-primary-600">
                  {((model.accuracy || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Accuracy</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <p className="text-2xl font-bold text-primary-600">
                  {((model.f1 || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">F1 Score</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <p className="text-2xl font-bold text-primary-600">
                  {((model.precision || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">Precision</p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded">
                <p className="text-2xl font-bold text-primary-600">
                  {((model.roc_auc || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">ROC-AUC</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Comparison Chart */}
      <div className="card">
        <h2 className="section-title">Model Comparison</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              {models.map((model) => (
                <Bar 
                  key={model.name} 
                  dataKey={model.name} 
                  fill={model.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROC Curve */}
      {rocData.length > 0 && (
        <div className="card">
          <h2 className="section-title">ROC Curve</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fpr" 
                  label={{ value: 'False Positive Rate', position: 'bottom' }}
                />
                <YAxis 
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tpr_rf" 
                  stroke="#22c55e" 
                  name="Random Forest"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="tpr_lr" 
                  stroke="#3b82f6" 
                  name="Logistic Regression"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="fpr" 
                  stroke="#94a3b8" 
                  name="Random Classifier"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Confusion Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Logistic Regression', data: lr.confusion_matrix, color: 'blue' },
          { name: 'Random Forest', data: rf.confusion_matrix, color: 'green' },
        ].map((model) => (
          <div key={model.name} className="card">
            <h3 className="section-title">Confusion Matrix - {model.name}</h3>
            {model.data && (
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div></div>
                  <div className="font-medium text-slate-600 p-2">Pred Good</div>
                  <div className="font-medium text-slate-600 p-2">Pred Bad</div>
                  
                  <div className="font-medium text-slate-600 p-2">Actual Good</div>
                  <div className="bg-green-100 text-green-800 p-4 rounded font-bold text-xl">
                    {model.data[1]?.[1] || 0}
                  </div>
                  <div className="bg-red-100 text-red-800 p-4 rounded font-bold text-xl">
                    {model.data[1]?.[0] || 0}
                  </div>
                  
                  <div className="font-medium text-slate-600 p-2">Actual Bad</div>
                  <div className="bg-red-100 text-red-800 p-4 rounded font-bold text-xl">
                    {model.data[0]?.[1] || 0}
                  </div>
                  <div className="bg-green-100 text-green-800 p-4 rounded font-bold text-xl">
                    {model.data[0]?.[0] || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Model Information */}
      <div className="card">
        <h2 className="section-title">Model Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Training Date</span>
            </div>
            <p className="font-medium text-slate-900">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-sm">Dataset</span>
            </div>
            <p className="font-medium text-slate-900">
              UCI German Credit
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Layers className="w-4 h-4" />
              <span className="text-sm">Features</span>
            </div>
            <p className="font-medium text-slate-900">
              {data.modelInfo?.feature_names?.length || 20}
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Train/Test Split</span>
            </div>
            <p className="font-medium text-slate-900">
              {splitInfo.train_size || 800} / {splitInfo.test_size || 200}
            </p>
          </div>
        </div>
      </div>

      {/* Model Details */}
      {data.modelInfo?.models && (
        <div className="card">
          <h2 className="section-title">Model Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Model</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Parameters</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.modelInfo.models).map(([name, info]: [string, any]) => (
                  <tr key={name} className="border-b border-slate-100">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {info.name || name.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {info.type}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {Object.entries(info.parameters || {}).map(([key, value]) => (
                        <span key={key} className="inline-block mr-3 text-sm">
                          <span className="text-slate-500">{key}:</span> {String(value)}
                        </span>
                      ))}
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
