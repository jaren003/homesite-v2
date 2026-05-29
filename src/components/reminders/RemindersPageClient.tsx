'use client'

import { useState, useCallback } from 'react'
import RemindersList from './RemindersList'
import type { Reminder, ReminderList } from '@/lib/eventkit/types'

interface Props {
  initialReminders: Reminder[]
  reminderLists: ReminderList[]
}

export default function RemindersPageClient({ initialReminders, reminderLists }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  const handleComplete = useCallback(async (id: string) => {
    setCompleting(prev => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/reminders/${id}/complete`, { method: 'POST' })
      if (res.ok) {
        setReminders(prev =>
          prev.map(r => r.id === id ? { ...r, isCompleted: true, completionDate: new Date().toISOString() } : r)
        )
      }
    } finally {
      setCompleting(prev => { const n = new Set(prev); n.delete(id); return n })
    }
  }, [])

  const filtered = selectedListId
    ? reminders.filter(r => r.listId === selectedListId)
    : reminders

  return (
    <div className="flex gap-6">
      {/* Sidebar — reminder lists */}
      <aside className="hidden md:flex flex-col gap-1 w-44 shrink-0">
        <p className="text-xs font-mono font-semibold uppercase tracking-wider mb-1"
           style={{ color: 'var(--hb-textSub)' }}>
          Lists
        </p>
        <button
          onClick={() => setSelectedListId(null)}
          className="flex items-center gap-2 text-sm text-left px-2 py-1 rounded-lg transition-colors"
          style={{
            background: selectedListId === null ? 'var(--hb-surface)' : 'transparent',
            color: 'var(--hb-text)',
          }}
        >
          All reminders
        </button>
        {reminderLists.map(list => {
          const count = reminders.filter(r => r.listId === list.id && !r.isCompleted).length
          const isActive = selectedListId === list.id
          return (
            <button
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className="flex items-center gap-2 text-sm text-left px-2 py-1 rounded-lg transition-colors"
              style={{
                background: isActive ? 'var(--hb-surface)' : 'transparent',
                color: 'var(--hb-text)',
              }}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: list.color }} />
              <span className="flex-1 truncate">{list.name}</span>
              {count > 0 && (
                <span className="text-xs" style={{ color: 'var(--hb-muted)' }}>{count}</span>
              )}
            </button>
          )
        })}
      </aside>

      {/* Main list */}
      <div className="flex-1 min-w-0">
        <RemindersList
          reminders={filtered}
          onComplete={id => !completing.has(id) && handleComplete(id)}
        />
      </div>
    </div>
  )
}
