import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import AppHeader from '@/components/AppHeader'
import MobileNavigation from '@/components/MobileNavigation'
import LiquidGlassDefs from '@/components/LiquidGlassDefs'

export const metadata: Metadata = {
  title: 'FairScore - Fair Credit Intelligence',
  description: 'An Explainable and Bias-Aware Credit Scoring System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <LiquidGlassDefs />
        <div className="ambient-backdrop" aria-hidden="true">
          <span className="aurora aurora-one" />
          <span className="aurora aurora-two" />
          <span className="aurora aurora-three" />
          <span className="backdrop-grid" />
        </div>
        <div className="app-shell">
          <Sidebar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <div className="app-content">
              <AppHeader />
              {children}
            </div>
          </main>
          <MobileNavigation />
        </div>
      </body>
    </html>
  )
}
