// Chore settings — server component (parent admin view)
import { readChores } from '@/lib/fun-corner/data'
import ChoreSettingsClient from './ChoreSettingsClient'
import Link from 'next/link'

export default async function ChoreSettingsPage() {
  const chores = readChores()

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Link
            href="/corners/isabella"
            style={{ color: 'var(--hb-textSub)', textDecoration: 'none', fontSize: 14 }}
          >
            ← Isabella's Corner
          </Link>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--hb-text)' }}>
          ⚙️ Chore Settings
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--hb-textSub)', fontSize: 14 }}>
          Add, remove, and configure chores for Isabella.
        </p>
      </div>

      <ChoreSettingsClient initialChores={chores} />
    </div>
  )
}
