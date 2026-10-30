'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  BarChart3,
  Clock,
  CreditCard,
  Database,
  Info,
  LayoutDashboard,
  Menu,
  Scale,
  X,
} from 'lucide-react'

const primaryNavigation = [
  { name: 'Dashboard', label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Credit Prediction', label: 'Predict', href: '/predict', icon: CreditCard },
  { name: 'Fairness Audit', label: 'Fairness', href: '/fairness', icon: Scale },
]

const secondaryNavigation = [
  { name: 'Model Performance', description: 'Compare accuracy and ROC performance', href: '/model', icon: BarChart3 },
  { name: 'Dataset', description: 'Explore source records and distributions', href: '/dataset', icon: Database },
  { name: 'Prediction History', description: 'Review previous credit assessments', href: '/history', icon: Clock },
  { name: 'About FairScore', description: 'Methodology, scope, and project details', href: '/about', icon: Info },
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const moreIsActive = secondaryNavigation.some((item) => item.href === pathname)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        moreButtonRef.current?.focus()
        return
      }

      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <>
      {open && (
        <div className="mobile-sheet-layer">
          <button
            className="mobile-sheet-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <div
            ref={sheetRef}
            className="mobile-sheet glass-elevated"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="mobile-sheet__handle" aria-hidden="true" />
            <div className="mobile-sheet__header">
              <div>
                <p className="eyebrow">Explore FairScore</p>
                <h2 id="mobile-menu-title">More destinations</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setOpen(false)
                  moreButtonRef.current?.focus()
                }}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mobile-sheet__nav" aria-label="Secondary navigation">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`mobile-sheet__link ${isActive ? 'mobile-sheet__link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mobile-sheet__icon" aria-hidden="true">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <nav className="mobile-dock glass-chrome" aria-label="Mobile navigation">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dock-item ${isActive ? 'dock-item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          ref={moreButtonRef}
          className={`dock-item ${open || moreIsActive ? 'dock-item--active' : ''}`}
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Open more destinations"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
