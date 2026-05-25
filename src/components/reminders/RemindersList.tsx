'use client'

import { useState, useMemo } from 'react'
import ReminderItem from './ReminderItem'
import { isOverdue, isDueToday } from '@/lib/utils/date'
import type { Reminder } from '@/lib/eventkit/types'

interface Props {
  reminders: Reminder[]
  onComplete?: (id: string) => void
}

type Lane = 'overdue' | 'today' | 'upcoming' | 'nodate'

function getLane(r: Reminder): Lane {
  if (!r.dueDate)           return 'nodate'
  if (isOverdue(r.dueDate)) return 'overdue'
  if (isDueToday(r.dueDate))return 'today'
  return 'upcoming'
}

const LANE_ORDER: Lane[] = ['overdue', 'today', 'upcoming', 'nodate']

export default function RemindersList({ reminders, onComplete }: Props) {
  const [filter, setFilter]           = useState('')
  const [completedOpen, setCompletedOpen] = useState(false)

  const incomplete = reminders.filter(r => !r.isCompleted)
  const completedItems = reminders.filter(r => r.isCompleted)

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    return q ? incomplete.filter(r => r.title.toLowerCase().includes(q)) : incomplete
  }, [incomplete, filter])

  // Group by lane, preserve order within each lane
  const grouped = useMemo(() => {
    const lanes: Record<Lane, Reminder[]> = { overdue: [], today: [], upcoming: [], nodate: [] }
    filtered.forEach(r => lanes[getLane(r)].push(r))
    return lanes
  }, [filtered])

  const sorted = LANE_ORDER.flatMap(lane => grouped[lane])

  return (
    <div className="flex flex-col gap-3">
      {/* Filter input */}
      <input
        type="text"
        placeholder="Filter reminders…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-hb-surface border border-hb-border
                   text-sm text-hb-text placeholder:text-hb-muted
                   focus:outline-none focus:border-hb-accent transition-colors"
      />

      {/* Reminders list */}
      {sorted.length === 0 && (
        <p className="text-sm text-hb-textSub text-center py-6">No reminders match your filter.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {sorted.map(r => (
          <ReminderItem key={r.id} reminder={r} onComplete={onComplete} />
        ))}
      </div>

      {/* Completed section */}
      {completedItems.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setCompletedOpen(o => !o)}
            className="flex items-center gap-2 text-xs font-semibold text-hb-textSub
                       uppercase tracking-wider py-1 hover:text-hb-text transition-colors"
          >
            <span>{completedOpen ? '▾' : '▸'}</span>
            <span>Completed ({completedItems.length})</span>
          </button>
          {completedOpen && (
            <div className="flex flex-col gap-1.5">
              {completedItems.map(r => (
                <ReminderItem key={r.id} reminder={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
