'use client'

import { useEffect, useState } from 'react'
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { getFairnessMetrics, getFairnessComparison } from '@/lib/api'

interface FairnessData {
  gender: any
  age: any
  comparison: any
  loading: boolean
  error: string | null
}

export default function FairnessPage() {
  const [data, setData] = useState<FairnessData>({
    gender: null,
    age: null,
    comparison: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [fairness, comparison] = await Promise.all([
          getFairnessMetrics().catch(() => null),
          getFairnessComparison().catch(() => null),
        ])

        setData({
          gender: fairness?.gender_fairness || null,
          age: fairness?.age_fairness || null,
          comparison: comparison,
          loading: false,
          error: null,
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load fairness data',
        }))
      }
    }

    fetchData()
  }, [])

  if (data.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Fairness Audit</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-slate-900">Fairness Audit</h1>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>{data.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const gender = data.gender || {}
  const age = data.age || {}
  const comparison = data.comparison || {}

  // Prepare comparison chart data
  const comparisonData = [
    {
      name: 'Accuracy',
      Baseline: (comparison.baseline?.accuracy || 0) * 100,
      'Fair Model': (comparison.fair_model?.accuracy || 0) * 100,
    },
    {
      name: 'Precision',
      Baseline: (comparison.baseline?.precision || 0) * 100,
      'Fair Model': (comparison.fair_model?.precision || 0) * 100,
    },
    {
      name: 'Recall',
      Baseline: (comparison.baseline?.recall || 0) * 100,
      'Fair Model': (comparison.fair_model?.recall || 0) * 100,
    },
    {
      name: 'F1 Score',
      Baseline: (comparison.baseline?.f1 || 0) * 100,
      'Fair Model': (comparison.fair_model?.f1 || 0) * 100,
    },
    {
      name: 'ROC-AUC',
      Baseline: (comparison.baseline?.roc_auc || 0) * 100,
      'Fair Model': (comparison.fair_model?.roc_auc || 0) * 100,
    },
  ]

  // Fairness radar data
  const fairnessRadar = [
    {
      metric: 'Gender DI',
      value: gender.disparate_impact_ratio || 1,
      fullMark: 1,
    },
    {
      metric: 'Age DI',
      value: age.disparate_impact_ratio || 1,
      fullMark: 1,
    },
    {
      metric: 'Gender DP',
      value: 1 - (gender.demographic_parity_difference || 0),
      fullMark: 1,
    },
    {
      metric: 'Age DP',
      value: 1 - (age.demographic_parity_difference || 0),
      fullMark: 1,
    },
    {
      metric: 'Gender EO',
      value: 1 - (gender.equal_opportunity_difference || 0),
      fullMark: 1,
    },
    {
      metric: 'Age EO',
      value: 1 - (age.equal_opportunity_difference || 0),
      fullMark: 1,
    },
  ]

  const getFairnessStatus = (dpDiff: number) => {
    if (dpDiff < 0.05) return { label: 'Low Disparity', color: 'green' }
    if (dpDiff < 0.1) return { label: 'Moderate Disparity', color: 'yellow' }
    return { label: 'High Disparity', color: 'red' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <h1 className="text-3xl font-bold text-slate-900">Fairness Audit</h1>
        <p className="text-slate-600 mt-1">
          Measure how model outcomes differ across applicant groups
        </p>
      </div>

      {/* Overall Status */}
      <div className="card fairness-status bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Scale className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Fairness Status</h2>
            <p className="text-slate-600">
              Overall assessment based on demographic parity difference
            </p>
          </div>
        </div>
      </div>

      {/* Gender Fairness */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Gender Fairness</h2>
            <p className="text-sm text-slate-600">Compare outcomes between Male and Female groups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Male Selection Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.male?.selection_rate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  n={gender.male?.count || 0}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Female Selection Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.female?.selection_rate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  n={gender.female?.count || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Demographic Parity Diff</p>
                <p className="text-lg font-bold text-slate-900">
                  {(gender.demographic_parity_difference || 0).toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Disparate Impact</p>
                <p className="text-lg font-bold text-slate-900">
                  {(gender.disparate_impact_ratio || 0).toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Equal Opportunity Diff</p>
                <p className="text-lg font-bold text-slate-900">
                  {(gender.equal_opportunity_difference || 0).toFixed(3)}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              getFairnessStatus(gender.demographic_parity_difference || 0).color === 'green'
                ? 'bg-green-50 text-green-800'
                : getFairnessStatus(gender.demographic_parity_difference || 0).color === 'yellow'
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">
                {getFairnessStatus(gender.demographic_parity_difference || 0).label}
              </p>
            </div>
          </div>

          {/* TPR/FPR Comparison */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Male TPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.male?.tpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Female TPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.female?.tpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Male FPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.male?.fpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Female FPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((gender.female?.fpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Age Fairness */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Age Fairness</h2>
            <p className="text-sm text-slate-600">
              Compare outcomes between Young (&lt;25) and Older (&ge;25) groups
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Young Selection Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.young?.selection_rate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  n={age.young?.count || 0}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Older Selection Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.older?.selection_rate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  n={age.older?.count || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Demographic Parity Diff</p>
                <p className="text-lg font-bold text-slate-900">
                  {(age.demographic_parity_difference || 0).toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Disparate Impact</p>
                <p className="text-lg font-bold text-slate-900">
                  {(age.disparate_impact_ratio || 0).toFixed(3)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">Equal Opportunity Diff</p>
                <p className="text-lg font-bold text-slate-900">
                  {(age.equal_opportunity_difference || 0).toFixed(3)}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-lg ${
              getFairnessStatus(age.demographic_parity_difference || 0).color === 'green'
                ? 'bg-green-50 text-green-800'
                : getFairnessStatus(age.demographic_parity_difference || 0).color === 'yellow'
                ? 'bg-yellow-50 text-yellow-800'
                : 'bg-red-50 text-red-800'
            }`}>
              <p className="font-medium">
                {getFairnessStatus(age.demographic_parity_difference || 0).label}
              </p>
            </div>
          </div>

          {/* TPR/FPR Comparison */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Young TPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.young?.tpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Older TPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.older?.tpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Young FPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.young?.fpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Older FPR</p>
                <p className="text-2xl font-bold text-slate-900">
                  {((age.older?.fpr || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fairness Radar Chart */}
      <div className="card">
        <h2 className="section-title">Fairness Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={fairnessRadar}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar
                name="Fairness"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Baseline vs Fair Model */}
      {comparison.baseline && comparison.fair_model && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Baseline vs Fairness-Mitigated Model
              </h2>
              <p className="text-sm text-slate-600">
                Comparing model performance and fairness trade-offs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparison Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Metric</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600">Baseline</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600">Fair Model</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Accuracy', baseline: comparison.baseline.accuracy, fair: comparison.fair_model.accuracy },
                    { name: 'Precision', baseline: comparison.baseline.precision, fair: comparison.fair_model.precision },
                    { name: 'Recall', baseline: comparison.baseline.recall, fair: comparison.fair_model.recall },
                    { name: 'F1 Score', baseline: comparison.baseline.f1, fair: comparison.fair_model.f1 },
                    { name: 'ROC-AUC', baseline: comparison.baseline.roc_auc, fair: comparison.fair_model.roc_auc },
                  ].map((row) => (
                    <tr key={row.name} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 text-center text-slate-700">
                        {((row.baseline || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">
                        {((row.fair || 0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">DP Difference</td>
                    <td className="py-3 px-4 text-center text-slate-700">-</td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {(comparison.fair_model.demographic_parity_difference || 0).toFixed(3)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">Disparate Impact</td>
                    <td className="py-3 px-4 text-center text-slate-700">-</td>
                    <td className="py-3 px-4 text-center text-slate-700">
                      {(comparison.fair_model.disparate_impact_ratio || 0).toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#ef4444" />
                  <Bar dataKey="Fair Model" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade-off Explanation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Accuracy-Fairness Trade-off</h4>
                <p className="text-sm text-blue-800 mt-1">
                  The fairness-mitigated model may have slightly lower accuracy but aims to reduce 
                  demographic disparities. This trade-off is a key consideration in responsible AI.
                  The accuracy loss is {((comparison.trade_off?.accuracy_loss || 0) * 100).toFixed(1)}% 
                  while fairness improves.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="card">
        <h2 className="section-title">Fairness Methodology</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Metrics Explained</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <strong>Selection Rate:</strong> Proportion of applicants approved in each group
              </li>
              <li>
                <strong>True Positive Rate (TPR):</strong> Rate of correctly approved good applicants
              </li>
              <li>
                <strong>False Positive Rate (FPR):</strong> Rate of incorrectly approved bad applicants
              </li>
              <li>
                <strong>Demographic Parity Difference:</strong> Absolute difference in selection rates between groups
              </li>
              <li>
                <strong>Disparate Impact Ratio:</strong> Ratio of selection rates (closer to 1 is fairer)
              </li>
              <li>
                <strong>Equal Opportunity Difference:</strong> Difference in true positive rates between groups
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Fairness Thresholds</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <strong>Disparate Impact:</strong> 0.8 - 1.25 is generally considered acceptable
              </li>
              <li>
                <strong>Demographic Parity:</strong> Difference &lt; 0.1 is low disparity
              </li>
              <li>
                <strong>Equal Opportunity:</strong> Difference &lt; 0.1 is low disparity
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Fairness thresholds are guidelines, not absolute rules. 
                Context and domain expertise should guide fairness assessments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
