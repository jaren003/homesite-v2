'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  eventId: string
  initialNotes: string | null
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function EventNotesClient({ eventId, initialNotes }: Props) {
  const [notes, setNotes]         = useState(initialNotes ?? '')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save 1s after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Nothing changed — skip
    if (notes === (initialNotes ?? '')) {
      setSaveState('idle')
      return
    }

    setSaveState('idle')
    debounceRef.current = setTimeout(async () => {
      setSaveState('saving')
      try {
        const res = await fetch(`/api/event-notes/${encodeURIComponent(eventId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: notes || null }),
        })
        setSaveState(res.ok ? 'saved' : 'error')
      } catch {
        setSaveState('error')
      }
    }, 1000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, eventId])

  const statusLabel =
    saveState === 'saving' ? 'Saving…'
    : saveState === 'saved'  ? 'Saved ✓'
    : saveState === 'error'  ? 'Save failed'
    : ''

  const statusColor =
    saveState === 'saved'  ? 'var(--hb-green)'
    : saveState === 'error'  ? 'var(--hb-coral)'
    : 'var(--hb-muted)'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider"
            style={{ color: 'var(--hb-textSub)' }}>
          My Notes
        </h2>
        {statusLabel && (
          <span className="text-[10px] font-mono transition-all" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Add private notes for this event…"
        rows={5}
        className="w-full rounded-xl px-3 py-2.5 text-sm resize-y outline-none
                   border transition-colors focus:border-hb-accent"
        style={{
          background: 'var(--hb-card)',
          color: 'var(--hb-text)',
          borderColor: 'var(--hb-border)',
          minHeight: '6rem',
        }}
      />
      <p className="text-[10px]" style={{ color: 'var(--hb-muted)' }}>
        Notes are saved locally and are separate from the EventKit event.
      </p>
    </div>
  )
}
