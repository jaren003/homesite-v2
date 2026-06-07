'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Chore } from '@/lib/fun-corner/types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── common styles ──────────────────────────────────────────────────────────

const s = {
  label: {
    fontSize: 11, fontWeight: 600, letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: 'var(--hb-textSub)',
    marginBottom: 6, display: 'block',
  },
  input: {
    width: '100%', padding: '10px 12px',
    background: 'var(--hb-bg)', border: '1px solid var(--hb-border)',
    borderRadius: 10, color: 'var(--hb-text)',
    fontSize: 14, outline: 'none',
    boxSizing: 'border-box' as const,
  },
}

// ── Add chore form ─────────────────────────────────────────────────────────

function AddChoreForm({ onAdded }: { onAdded: (c: Chore) => void }) {
  const [title, setTitle]   = useState('')
  const [emoji, setEmoji]   = useState('')
  const [points, setPoints] = useState(1)
  const [days, setDays]     = useState<number[]>([])  // empty = every day
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), emoji: emoji.trim(), points, days }),
      })
      if (!res.ok) throw new Error('Save failed')
      const chore = await res.json() as Chore
      onAdded(chore)
      setTitle(''); setEmoji(''); setPoints(1); setDays([])
    } catch {
      setError('Could not save chore.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'var(--hb-surface)', borderRadius: 16,
      border: '1px solid var(--hb-border)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--hb-text)' }}>
        Add new chore
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
        <div>
          <label style={s.label}>Title</label>
          <input
            style={s.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Make your bed"
            required
          />
        </div>
        <div>
          <label style={s.label}>Emoji</label>
          <input
            style={{ ...s.input, textAlign: 'center', fontSize: 22 }}
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            placeholder="🛏️"
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <label style={s.label}>Points (per completion)</label>
        <input
          style={{ ...s.input, width: 80 }}
          type="number" min={1} max={99}
          value={points}
          onChange={e => setPoints(Number(e.target.value))}
        />
      </div>

      <div>
        <label style={s.label}>Days due (leave all off = every day)</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid',
                borderColor: days.includes(i) ? 'var(--hb-accent)' : 'var(--hb-border)',
                background: days.includes(i) ? 'var(--hb-accentDim)' : 'var(--hb-bg)',
                color: days.includes(i) ? 'var(--hb-accent)' : 'var(--hb-textSub)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ margin: 0, color: 'var(--hb-coral)', fontSize: 13 }}>{error}</p>}

      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '10px 20px', borderRadius: 10,
          background: saving ? 'var(--hb-muted)' : 'var(--hb-accent)',
          color: '#fff', border: 'none',
          fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer',
          alignSelf: 'flex-start',
          transition: 'background 0.15s',
        }}
      >
        {saving ? 'Saving…' : '+ Add Chore'}
      </button>
    </form>
  )
}

// ── Chore row ──────────────────────────────────────────────────────────────

function ChoreRow({ chore, onDelete }: { chore: Chore; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const dayLabel = !chore.days || chore.days.length === 0
    ? 'Every day'
    : chore.days.map(d => DAY_LABELS[d]).join(', ')

  async function handleDelete() {
    if (!confirm(`Remove "${chore.title}"?`)) return
    setDeleting(true)
    await fetch(`/api/chores/${chore.id}`, { method: 'DELETE' })
    onDelete()
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      background: 'var(--hb-card)', borderRadius: 12,
      border: '1px solid var(--hb-border)',
    }}>
      <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>
        {chore.emoji || '✨'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--hb-text)' }}>
          {chore.title}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--hb-textSub)' }}>
          {dayLabel} · {chore.points ?? 1} ⭐ per completion
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${chore.title}`}
        style={{
          padding: '6px 12px', borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--hb-border)',
          color: deleting ? 'var(--hb-muted)' : 'var(--hb-coral)',
          fontSize: 13, cursor: deleting ? 'default' : 'pointer',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {deleting ? '…' : 'Remove'}
      </button>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────────────

export default function ChoreSettingsClient({ initialChores }: { initialChores: Chore[] }) {
  const [chores, setChores] = useState<Chore[]>(initialChores)
  const router = useRouter()

  function handleAdded(chore: Chore) {
    setChores(prev => [...prev, chore])
  }

  function handleDeleted(id: string) {
    setChores(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AddChoreForm onAdded={handleAdded} />

      <section>
        <h3 style={{
          margin: '0 0 12px',
          fontSize: 11, fontWeight: 600, letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'var(--hb-textSub)',
        }}>
          {chores.length} chore{chores.length !== 1 ? 's' : ''} configured
        </h3>

        {chores.length === 0 ? (
          <p style={{ color: 'var(--hb-textSub)', fontSize: 14 }}>
            No chores yet — add one above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chores.map(c => (
              <ChoreRow key={c.id} chore={c} onDelete={() => handleDeleted(c.id)} />
            ))}
          </div>
        )}
      </section>

      <div>
        <button
          onClick={() => router.push('/corners/isabella')}
          style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'var(--hb-surface)',
            border: '1px solid var(--hb-border)',
            color: 'var(--hb-text)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back to Isabella's Corner
        </button>
      </div>
    </div>
  )
}
