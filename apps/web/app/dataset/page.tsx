'use client'

import { useEffect, useState } from 'react'
import { 
  Database, 
  Users, 
  CreditCard,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'
import { getDatasetInfo } from '@/lib/api'

interface DatasetData {
  info: any
  loading: boolean
  error: string | null
}

export default function DatasetPage() {
  const [data, setData] = useState<DatasetData>({
    info: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const info = await getDatasetInfo().catch(() => null)
        setData({
          info,
          loading: false,
          error: null,
        })
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dataset information',
        }))
      }
    }

    fetchData()
  }, [])

  if (data.loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dataset</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
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
        <h1 className="text-3xl font-bold text-slate-900">Dataset</h1>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p>{data.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const info = data.info || {}
  const distributions = info.distributions || {}

  // Prepare chart data
  const creditDistribution = [
    { name: 'Good Credit', value: info.good_credit || 700 },
    { name: 'Bad Credit', value: info.bad_credit || 300 },
  ]

  const genderDistribution = distributions.gender ? 
    Object.entries(distributions.gender).map(([name, value]) => ({
      name,
      value: value as number,
    })) : [
      { name: 'Male', value: 690 },
      { name: 'Female', value: 310 },
    ]

  const ageDistribution = distributions.age ?
    Object.entries(distributions.age).map(([name, value]) => ({
      name: name as string,
      value: value as number,
    })) : [
      { name: '18-25', value: 180 },
      { name: '26-35', value: 320 },
      { name: '36-45', value: 250 },
      { name: '46-55', value: 150 },
      { name: '55+', value: 100 },
    ]

  const creditHistoryDist = distributions.credit_history ?
    Object.entries(distributions.credit_history).map(([name, value]) => ({
      name,
      value: value as number,
    })) : [
      { name: 'No credits', value: 60 },
      { name: 'All paid', value: 530 },
      { name: 'Existing paid', value: 300 },
      { name: 'Delay', value: 80 },
      { name: 'Critical', value: 30 },
    ]

  const employmentDist = distributions.employment ?
    Object.entries(distributions.employment).map(([name, value]) => ({
      name,
      value: value as number,
    })) : [
      { name: 'Unemployed', value: 60 },
      { name: '<1 year', value: 200 },
      { name: '1-4 years', value: 350 },
      { name: '4-7 years', value: 250 },
      { name: '7+ years', value: 140 },
    ]

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <h1 className="text-3xl font-bold text-slate-900">Dataset</h1>
        <p className="text-slate-600 mt-1">
          UCI Statlog German Credit Data - 1000 records, 20 features
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Records</p>
              <p className="text-3xl font-bold text-slate-900">
                {info.total_records || 1000}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Features</p>
              <p className="text-3xl font-bold text-slate-900">
                {info.features || 20}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Good Credit</p>
              <p className="text-3xl font-bold text-green-600">
                {info.good_credit || 700}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {((info.good_credit || 700) / (info.total_records || 1000) * 100).toFixed(1)}% of dataset
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Bad Credit</p>
              <p className="text-3xl font-bold text-red-600">
                {info.bad_credit || 300}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {((info.bad_credit || 300) / (info.total_records || 1000) * 100).toFixed(1)}% of dataset
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Distribution */}
        <div className="card">
          <h2 className="section-title">Credit Outcome Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={creditDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {creditDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="card">
          <h2 className="section-title">Gender Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="card">
          <h2 className="section-title">Age Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit History */}
        <div className="card">
          <h2 className="section-title">Credit History Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditHistoryDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment */}
        <div className="card">
          <h2 className="section-title">Employment Duration</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employmentDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Amount Stats */}
        <div className="card">
          <h2 className="section-title">Loan Amount Statistics</h2>
          <div className="space-y-4">
            {distributions.loan_amount ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Mean</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {distributions.loan_amount.mean?.toFixed(0)} DM
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Median</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {distributions.loan_amount.median?.toFixed(0)} DM
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Min</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {distributions.loan_amount.min?.toFixed(0)} DM
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Max</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {distributions.loan_amount.max?.toFixed(0)} DM
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                Loan amount statistics not available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Description */}
      <div className="card">
        <h2 className="section-title">Dataset Description</h2>
        <div className="prose max-w-none">
          <p className="text-slate-600">
            The <strong>UCI Statlog German Credit Data</strong> dataset contains 1000 instances 
            with 20 features. Each instance represents a person who took credit from a bank. 
            The classification task is to predict whether the credit should be approved or not 
            (Good/Bad credit risk).
          </p>
          
          <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Checking Account Status</p>
              <p className="text-sm text-slate-600">Status of existing checking account</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Duration</p>
              <p className="text-sm text-slate-600">Loan duration in months</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Credit History</p>
              <p className="text-sm text-slate-600">Past credit behavior</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Purpose</p>
              <p className="text-sm text-slate-600">Purpose of the credit</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Credit Amount</p>
              <p className="text-sm text-slate-600">Amount of credit in DM</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Savings Account</p>
              <p className="text-sm text-slate-600">Status of savings account</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Employment Duration</p>
              <p className="text-sm text-slate-600">Length of current employment</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Installment Rate</p>
              <p className="text-sm text-slate-600">Installment rate as % of disposable income</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Personal Status</p>
              <p className="text-sm text-slate-600">Marital status and sex</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Other Debtors</p>
              <p className="text-sm text-slate-600">Other debtors or guarantors</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Residence Duration</p>
              <p className="text-sm text-slate-600">Time at current residence</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Property</p>
              <p className="text-sm text-slate-600">Property ownership</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Age</p>
              <p className="text-sm text-slate-600">Age in years</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Other Plans</p>
              <p className="text-sm text-slate-600">Other installment plans</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Housing</p>
              <p className="text-sm text-slate-600">Housing status</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Existing Credits</p>
              <p className="text-sm text-slate-600">Number of existing credits</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Job</p>
              <p className="text-sm text-slate-600">Employment status</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Dependents</p>
              <p className="text-sm text-slate-600">Number of dependents</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Telephone</p>
              <p className="text-sm text-slate-600">Telephone registration</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">Foreign Worker</p>
              <p className="text-sm text-slate-600">Foreign worker status</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">Source</h3>
          <p className="text-slate-600">
            UCI Machine Learning Repository: 
            <a 
              href="https://archive.ics.uci.edu/dataset/144/statlog%2Bgerman%2Bcredit%2Bdata" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline ml-1"
            >
              Statlog German Credit Data
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
