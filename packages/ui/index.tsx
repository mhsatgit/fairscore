/**
 * FairScore Shared UI Components
 */

import React from 'react'

// Card Component
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
      {children}
    </div>
  )
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  
  return (
    <button
      className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

// Stat Card Component
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, icon, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 ${className}`} />
  )
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-slate-300 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-slate-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
