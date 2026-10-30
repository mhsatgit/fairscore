'use client'

import { 
  Shield, 
  Target, 
  Lightbulb,
  Database,
  Cpu,
  Scale,
  TrendingUp,
  AlertTriangle,
  Github,
  ExternalLink
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="page-hero about-hero text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mt-6">FairScore</h1>
        <p className="text-xl text-slate-600 mt-2">Fair Credit Intelligence</p>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          An Explainable and Bias-Aware Credit Scoring System
        </p>
      </section>

      {/* Problem Statement */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Problem Statement</h2>
        </div>
        <div className="prose max-w-none text-slate-600">
          <p>
            Traditional machine learning credit scoring models can be <strong>opaque</strong> and 
            may <strong>reproduce historical biases</strong> present in training data. This creates 
            several critical issues:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong>Opacity:</strong> Complex models like random forests and neural networks 
              make it difficult to understand why a particular decision was made.
            </li>
            <li>
              <strong>Bias:</strong> Models trained on historical data may learn and amplify 
              existing societal biases related to gender, age, race, and other protected attributes.
            </li>
            <li>
              <strong>Accountability:</strong> Without explainability, it&apos;s impossible to audit 
              decisions or provide meaningful recourse to affected individuals.
            </li>
          </ul>
        </div>
      </div>

      {/* Project Objective */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Project Objective</h2>
        </div>
        <div className="prose max-w-none text-slate-600">
          <p>FairScore aims to build a credit scoring system that is:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">Accurate</h3>
              <p className="text-sm text-blue-800">
                Maintains strong predictive performance using standard ML models
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900">Explainable</h3>
              <p className="text-sm text-purple-800">
                Provides clear explanations for every prediction
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Fair</h3>
              <p className="text-sm text-green-800">
                Actively audits and mitigates bias across protected groups
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card pipeline-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">The FairScore Pipeline</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 py-6">
          {[
            { label: 'DATA', icon: Database, color: 'bg-blue-500' },
            { label: 'PREDICT', icon: Cpu, color: 'bg-green-500' },
            { label: 'EXPLAIN', icon: Lightbulb, color: 'bg-yellow-500' },
            { label: 'AUDIT', icon: Scale, color: 'bg-purple-500' },
            { label: 'MITIGATE', icon: TrendingUp, color: 'bg-red-500' },
          ].map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className={`${step.color} text-white px-4 py-2 rounded-lg flex items-center gap-2`}>
                <step.icon className="w-4 h-4" />
                <span className="font-medium">{step.label}</span>
              </div>
              {index < 4 && (
                <div className="w-8 h-0.5 bg-slate-300 mx-2 hidden md:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Concepts */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Accuracy</h3>
            <p className="text-sm text-slate-600">
              The model&apos;s ability to correctly predict credit risk. We use standard metrics 
              including accuracy, precision, recall, F1 score, and ROC-AUC.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Explainability</h3>
            <p className="text-sm text-slate-600">
              Using feature importance and model coefficients to explain why a particular 
              prediction was made, making the model&apos;s decisions transparent.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Fairness</h3>
            <p className="text-sm text-slate-600">
              Auditing model predictions across protected groups (gender, age) using metrics 
              like demographic parity, disparate impact, and equal opportunity.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 mb-2">Mitigation</h3>
            <p className="text-sm text-slate-600">
              Applying techniques like reweighing to reduce bias while measuring the 
              accuracy-fairness trade-off.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js', category: 'Frontend' },
            { name: 'TypeScript', category: 'Language' },
            { name: 'Tailwind CSS', category: 'Styling' },
            { name: 'Recharts', category: 'Charts' },
            { name: 'FastAPI', category: 'Backend' },
            { name: 'Python', category: 'Language' },
            { name: 'scikit-learn', category: 'ML' },
            { name: 'Fairlearn', category: 'Fairness' },
          ].map((tech) => (
            <div key={tech.name} className="p-3 bg-slate-50 rounded-lg text-center">
              <p className="font-medium text-slate-900">{tech.name}</p>
              <p className="text-xs text-slate-500">{tech.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Dataset</h2>
        <div className="prose max-w-none text-slate-600">
          <p>
            This project uses the <strong>UCI Statlog German Credit Data</strong> dataset:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>1000 records</li>
            <li>20 features</li>
            <li>Binary classification (Good/Bad credit risk)</li>
          </ul>
          <p className="mt-4">
            <a 
              href="https://archive.ics.uci.edu/dataset/144/statlog%2Bgerman%2Bcredit%2Bdata" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline inline-flex items-center gap-1"
            >
              View Dataset <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Important Disclaimer</h3>
            <p className="text-sm text-yellow-800 mt-2">
              FairScore is an <strong>educational and research prototype</strong> evaluated on a 
              public credit dataset. It is <strong>not a production lending system</strong> and 
              should not be used as the sole basis for real-world financial decisions. The 
              fairness metrics and mitigation techniques demonstrated here are for educational 
              purposes and may not capture all aspects of real-world fairness considerations.
            </p>
          </div>
        </div>
      </div>

      {/* Project Scope */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Project Scope</h2>
        <div className="prose max-w-none text-slate-600">
          <p>This prototype demonstrates:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>End-to-end ML pipeline from data preprocessing to model deployment</li>
            <li>Model comparison (Logistic Regression vs Random Forest)</li>
            <li>Feature importance and prediction explanation</li>
            <li>Fairness auditing across gender and age groups</li>
            <li>Bias mitigation using Exponentiated Gradient reduction</li>
            <li>Accuracy-fairness trade-off visualization</li>
            <li>Professional UI for ML model interaction</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
