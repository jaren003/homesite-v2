import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'Homesite',
  description: 'Calendar & Reminders dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL ?? 'http://localhost:3001'

  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--hb-bg)', color: 'var(--hb-text)' }}>
        <NavBar chatUrl={chatUrl} />
        <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
          {children}
        </main>
      </body>
    </html>
  )
}
