'use client'

import { useState, useCallback } from 'react'
import ReminderItem from '@/components/reminders/ReminderItem'
import type { Reminder } from '@/lib/eventkit/types'

interface Props {
  initialReminders: Reminder[]
}

export default function DayRemindersClient({ initialReminders }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  const handleComplete = useCallback(async (id: string) => {
    if (completing.has(id)) return
    setCompleting(prev => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/reminders/${id}/complete`, { method: 'POST' })
      if (res.ok) {
        setReminders(prev =>
          prev.map(r =>
            r.id === id
              ? { ...r, isCompleted: true, completionDate: new Date().toISOString() }
              : r,
          ),
        )
      }
    } finally {
      setCompleting(prev => {
        const n = new Set(prev)
        n.delete(id)
        return n
      })
    }
  }, [completing])

  if (reminders.length === 0) {
    return (
      <p className="text-sm py-4 text-center rounded-xl border border-dashed"
         style={{ color: 'var(--hb-muted)', borderColor: 'var(--hb-border)' }}>
        No reminders due
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {reminders.map(r => (
        <ReminderItem key={r.id} reminder={r} onComplete={handleComplete} />
      ))}
    </div>
  )
}
