'use client'

import { useState } from 'react'

interface Props {
  notes: Record<string, string>
  onNotesChange: (updated: Record<string, string>) => void
  onClose: () => void
}

const LIBRARY_GROUPS = [
  { group: 'Chest',          exercises: ['Push-up (standard/incline)','KB bench press','Band chest press (anchored)','Decline push-up','Band chest fly'] },
  { group: 'Back',           exercises: ['KB single-arm row','Band pull-apart','Band face pull','Band seated row','Chest-supported KB row','Band lat pulldown'] },
  { group: 'Shoulders',      exercises: ['KB overhead press','Band external rotation','KB lateral raise','Band overhead press (bilateral)','Pike push-up'] },
  { group: 'Arms',           exercises: ['Band bicep curl','KB curl (alternating)','Tricep dip (bench)','Band tricep pushdown','KB overhead tricep extension'] },
  { group: 'Glutes & Hams',  exercises: ['KB swing (two-hand)','KB Romanian deadlift','Hip thrust (bench)','Single-leg KB RDL','Band pull-through','Band hip abduction'] },
  { group: 'Quads',          exercises: ['KB goblet squat','Reverse lunge (KB)','Bulgarian split squat','Band squat','Step-up (bench)'] },
  { group: 'Core',           exercises: ['Dead bug','Plank (standard/RKC)','Band Pallof press','KB suitcase carry','Bird dog','Bench leg raise'] },
  { group: 'Full Body',      exercises: ['KB Turkish get-up','KB clean (single arm)','KB swing + squat complex','Push-up → band row superset',"KB farmer's carry"] },
]

export default function LibraryPanel({ notes, onNotesChange, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  async function update(name: string, val: string) {
    // Optimistic update
    const next = { ...notes, [name]: val }
    if (!val) delete next[name]
    onNotesChange(next)

    // Persist to server
    await fetch('/api/bsc/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ exerciseName: name, note: val }),
    })
  }

  const filteredGroups = LIBRARY_GROUPS.map(g => ({
    ...g,
    exercises: g.exercises.filter(e => e.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.exercises.length > 0)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} />
      {/* Panel */}
      <div style={{ width: 'min(420px, 100vw)', background: 'var(--hb-surface)',
        borderLeft: '1px solid var(--hb-border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hb-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          position: 'sticky', top: 0, background: 'var(--hb-surface)', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--hb-textSub)', marginBottom: 4 }}>Exercise Notes</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--hb-text)' }}>Library</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hb-textSub)', fontSize: 18, padding: 4 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--hb-border)', flexShrink: 0 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exercises…"
            style={{ width: '100%', background: 'var(--hb-card)', border: '1px solid var(--hb-border)',
              borderRadius: 6, padding: '7px 12px', color: 'var(--hb-text)', fontSize: 13,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* Note count */}
        {Object.keys(notes).length > 0 && (
          <div style={{ padding: '8px 20px', background: 'rgba(239,159,39,0.06)',
            borderBottom: '1px solid rgba(239,159,39,0.15)', flexShrink: 0 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-amber)' }}>
              📝 {Object.keys(notes).length} note{Object.keys(notes).length > 1 ? 's' : ''} saved
            </span>
          </div>
        )}

        {/* Groups */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredGroups.map(g => (
            <div key={g.group} style={{ borderBottom: '1px solid var(--hb-border)' }}>
              <button
                onClick={() => setOpenGroup(o => o === g.group ? null : g.group)}
                style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textAlign: 'left' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--hb-textSub)', fontWeight: 600 }}>
                  {g.group}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {g.exercises.filter(e => notes[e]).length > 0 && (
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-amber)',
                      background: 'rgba(239,159,39,0.1)', borderRadius: 3, padding: '1px 6px' }}>
                      {g.exercises.filter(e => notes[e]).length} note{g.exercises.filter(e => notes[e]).length > 1 ? 's' : ''}
                    </span>
                  )}
                  <span style={{ color: 'var(--hb-textSub)', fontSize: 11, display: 'inline-block',
                    transition: 'transform 0.2s', transform: openGroup === g.group ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </button>

              {openGroup === g.group && (
                <div style={{ paddingBottom: 8 }}>
                  {g.exercises.map(exName => (
                    <div key={exName} style={{ padding: '8px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--hb-text)', marginBottom: 6 }}>
                        {exName}
                      </div>
                      <textarea
                        value={notes[exName] ?? ''}
                        onChange={e => update(exName, e.target.value)}
                        placeholder="Add a note — weight used, form cues, how it felt…"
                        rows={2}
                        style={{ width: '100%', background: 'var(--hb-card)', border: '1px solid var(--hb-border)',
                          borderRadius: 6, padding: '7px 10px', color: 'var(--hb-text)', fontSize: 12,
                          fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                          lineHeight: 1.5,
                          ...(notes[exName] ? { borderColor: 'rgba(239,159,39,0.4)', background: 'rgba(239,159,39,0.04)' } : {}) }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
