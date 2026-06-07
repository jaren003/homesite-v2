// Isabella's Chores Corner — server component
import { readChores } from '@/lib/fun-corner/data'
import { readWeekCompletions } from '@/lib/fun-corner/data'
import ChoresClient from './ChoresClient'
import Link from 'next/link'

function getWeekStart(): string {
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return sunday.toISOString().slice(0, 10)
}

export default async function IsabellaPage() {
  const chores = readChores()
  const weekStart = getWeekStart()
  const completions = readWeekCompletions(weekStart)

  return (
    <div style={{ position: 'relative' }}>
      {/* Settings gear — top right, for parents */}
      <div style={{
        position: 'fixed', top: 64, right: 16, zIndex: 50,
      }}>
        <Link
          href="/corners/isabella/settings"
          title="Chore settings"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(8px)',
            textDecoration: 'none',
            fontSize: 18,
            transition: 'all 0.2s',
          }}
        >
          ⚙️
        </Link>
      </div>

      <ChoresClient
        initialChores={chores}
        weekStart={weekStart}
        initialCompletions={completions}
      />
    </div>
  )
}
