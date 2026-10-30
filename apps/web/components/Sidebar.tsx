'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CreditCard, 
  Scale, 
  BarChart3, 
  Database, 
  Clock, 
  Info,
  Shield
} from 'lucide-react'

const navigation = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', shortName: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Credit Prediction', shortName: 'Predict', href: '/predict', icon: CreditCard },
      { name: 'Fairness Audit', shortName: 'Fairness', href: '/fairness', icon: Scale },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Model Performance', shortName: 'Models', href: '/model', icon: BarChart3 },
      { name: 'Dataset', shortName: 'Dataset', href: '/dataset', icon: Database },
      { name: 'Prediction History', shortName: 'History', href: '/history', icon: Clock },
      { name: 'About', shortName: 'About', href: '/about', icon: Info },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar-shell glass-chrome" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand__mark" aria-hidden="true">
          <Shield className="h-6 w-6" />
          <span className="sidebar-brand__spark" />
        </div>
        <div className="sidebar-brand__copy">
          <div className="flex items-center gap-2">
            <h1>FairScore</h1>
            <span className="brand-badge">AI</span>
          </div>
          <p>Transparent credit intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigation.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group__label">{group.label}</p>
            {group.items.map((item) => {
              const isActive = pathname === item.href ||
                (item.href === '/dashboard' && pathname === '/')

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.name}
                  title={item.name}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                >
                  <span className="nav-item__icon" aria-hidden="true">
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="nav-item__label">{item.name}</span>
                  <span className="nav-item__short">{item.shortName}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="status-dot" aria-hidden="true" />
        <span className="sidebar-footer__copy">Decision systems online</span>
      </div>
    </aside>
  )
}
