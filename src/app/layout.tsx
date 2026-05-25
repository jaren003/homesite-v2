import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Homesite',
  description: 'Calendar & Reminders dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--hb-bg)', color: 'var(--hb-text)' }}>
        <nav style={{ borderBottom: '1px solid var(--hb-border)', background: 'var(--hb-surface)' }}
             className="flex items-center gap-6 px-6 py-4">
          <a href="/" className="text-sm font-semibold" style={{ color: 'var(--hb-text)' }}>
            Homesite
          </a>
          <a href="/calendar" className="text-sm" style={{ color: 'var(--hb-textSub)' }}>
            Calendar
          </a>
          <a href="/reminders" className="text-sm" style={{ color: 'var(--hb-textSub)' }}>
            Reminders
          </a>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
