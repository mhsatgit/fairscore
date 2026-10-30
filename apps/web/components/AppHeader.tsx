'use client'

import { useEffect, useState } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { checkHealth } from '@/lib/api'

const pageNames: Record<string, string> = {
  '/dashboard': 'Overview',
  '/predict': 'Credit prediction',
  '/fairness': 'Fairness audit',
  '/model': 'Model performance',
  '/dataset': 'Dataset',
  '/history': 'Prediction history',
  '/about': 'About',
}

export default function AppHeader() {
  const pathname = usePathname()
  const pageName = pageNames[pathname] ?? 'FairScore workspace'
  const [systemReady, setSystemReady] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    checkHealth()
      .then(() => active && setSystemReady(true))
      .catch(() => active && setSystemReady(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <header className="app-header glass-chrome">
      <div className="app-header__context">
        <span className="app-header__shield" aria-hidden="true">
          <ShieldCheck className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="app-header__eyebrow"><Sparkles className="h-3 w-3" /> FairScore intelligence</p>
          <p className="app-header__title">{pageName}</p>
        </div>
      </div>
      <span
        className={`system-pill ${systemReady === false ? 'system-pill--offline' : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className="system-pill__signal" aria-hidden="true" />
        {systemReady === null ? 'Checking system' : systemReady ? 'System ready' : 'API unavailable'}
      </span>
    </header>
  )
}
