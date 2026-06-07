'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Chore, ChoreCompletions } from '@/lib/fun-corner/types'

// ── constants ─────────────────────────────────────────────────────────────

const DAY_ABBR  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_EMOJI = ['☀️', '🌙', '🌟', '💫', '⚡', '🌈', '🎉']

/** Rainbow palette — one colour per weekday */
const DAY_PALETTE = [
  { bg: '#FF6B9D', dark: '#c24171' }, // Sun – pink
  { bg: '#A855F7', dark: '#7e3abf' }, // Mon – purple
  { bg: '#3B82F6', dark: '#1d5bbf' }, // Tue – blue
  { bg: '#22C55E', dark: '#158a3e' }, // Wed – green
  { bg: '#F97316', dark: '#c25610' }, // Thu – orange
  { bg: '#EF4444', dark: '#b52222' }, // Fri – red
  { bg: '#06B6D4', dark: '#0485a0' }, // Sat – cyan
]

// ── helpers ───────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

/** Returns an array of 7 date strings starting on Sunday of the current week */
function getWeekDates(): string[] {
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return toDateStr(d)
  })
}

function choresForDay(chores: Chore[], dayIndex: number): Chore[] {
  return chores.filter(c => !c.days || c.days.length === 0 || c.days.includes(dayIndex))
}

// ── sub-components ────────────────────────────────────────────────────────

function StarBurst({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <span
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, pointerEvents: 'none',
        animation: 'starPop 0.6s ease-out forwards',
      }}
    >
      🌟
    </span>
  )
}

interface ChoreCardProps {
  chore: Chore
  completed: boolean
  onToggle: () => void
  dayColor: { bg: string; dark: string }
}

function ChoreCard({ chore, completed, onToggle, dayColor }: ChoreCardProps) {
  const [burst, setBurst] = useState(false)
  const [pressed, setPressed] = useState(false)

  function handleToggle() {
    if (!completed) {
      setBurst(true)
      setTimeout(() => setBurst(false), 700)
    }
    onToggle()
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px',
        borderRadius: 24,
        background: completed
          ? `linear-gradient(135deg, ${dayColor.bg}cc, ${dayColor.dark}cc)`
          : 'rgba(255,255,255,0.93)',
        boxShadow: completed
          ? `0 6px 24px ${dayColor.bg}66`
          : '0 4px 14px rgba(0,0,0,0.12)',
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        overflow: 'hidden',
      }}
    >
      {/* Emoji */}
      <span style={{ fontSize: 44, lineHeight: 1, flexShrink: 0, userSelect: 'none' }}>
        {completed ? '🌟' : (chore.emoji || '✨')}
      </span>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '-0.3px',
        color: completed ? '#fff' : '#1a1a1a',
        textDecoration: completed ? 'line-through' : 'none',
        textDecorationColor: 'rgba(255,255,255,0.5)',
        userSelect: 'none',
      }}>
        {chore.title}
      </span>

      {/* Toggle button */}
      <button
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => { setPressed(false); handleToggle() }}
        onPointerLeave={() => setPressed(false)}
        aria-label={completed ? 'Undo chore' : 'Mark chore done'}
        style={{
          flexShrink: 0,
          width: 60, height: 60,
          borderRadius: '50%',
          border: 'none',
          background: completed ? 'rgba(255,255,255,0.9)' : dayColor.bg,
          color: completed ? dayColor.dark : '#fff',
          fontSize: 28,
          fontWeight: 900,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${dayColor.bg}55`,
          transition: 'transform 0.15s',
          transform: pressed ? 'scale(0.88)' : 'scale(1)',
          lineHeight: 1,
        }}
      >
        {completed ? '✓' : '○'}
      </button>

      <StarBurst visible={burst} />
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────

interface ChoresClientProps {
  initialChores: Chore[]
  weekStart: string
  initialCompletions: ChoreCompletions
}

export default function ChoresClient({
  initialChores,
  weekStart,
  initialCompletions,
}: ChoresClientProps) {
  const [chores] = useState<Chore[]>(initialChores)
  const [completions, setCompletions] = useState<ChoreCompletions>(initialCompletions)
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay())

  const weekDates = getWeekDates()
  const today = toDateStr(new Date())
  const selectedDate = weekDates[selectedDay]
  const dayColor = DAY_PALETTE[selectedDay]

  const dayChores = choresForDay(chores, selectedDay)
  const doneIds = completions[selectedDate] ?? []
  const doneCount = dayChores.filter(c => doneIds.includes(c.id)).length

  const toggleChore = useCallback(async (choreId: string) => {
    const isCompleted = (completions[selectedDate] ?? []).includes(choreId)
    const newCompleted = !isCompleted

    // Optimistic update
    setCompletions(prev => {
      const day = prev[selectedDate] ?? []
      return {
        ...prev,
        [selectedDate]: newCompleted
          ? [...day, choreId]
          : day.filter(id => id !== choreId),
      }
    })

    await fetch('/api/chores/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choreId, date: selectedDate, completed: newCompleted }),
    }).catch(() => {
      // Revert on failure
      setCompletions(prev => {
        const day = prev[selectedDate] ?? []
        return {
          ...prev,
          [selectedDate]: isCompleted
            ? [...day, choreId]
            : day.filter(id => id !== choreId),
        }
      })
    })
  }, [completions, selectedDate])

  // Count weekly stars
  const weeklyStars = weekDates.reduce((sum, date, dayIdx) => {
    const dc = choresForDay(chores, dayIdx)
    const done = (completions[date] ?? []).filter(id => dc.some(c => c.id === id))
    return sum + done.length
  }, 0)

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes starPop {
          0%   { opacity: 1; transform: scale(0.5); }
          60%  { opacity: 1; transform: scale(1.6); }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .day-btn:hover { filter: brightness(1.1); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${dayColor.bg}44 0%, ${dayColor.dark}22 100%), #0d0d0d`,
        padding: '28px 16px 48px',
        transition: 'background 0.4s ease',
      }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 6 }}>⭐</div>
          <h1 style={{
            margin: 0,
            fontSize: 34, fontWeight: 900, letterSpacing: '-1px',
            background: `linear-gradient(90deg, ${dayColor.bg}, #fff, ${dayColor.bg})`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite',
          }}>
            Isabella's Chores!
          </h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
            ⭐ {weeklyStars} star{weeklyStars !== 1 ? 's' : ''} this week!
          </p>
        </div>

        {/* ── Day tabs ────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 4, marginBottom: 28,
          scrollbarWidth: 'none',
          maxWidth: 560, margin: '0 auto 28px',
        }}>
          {weekDates.map((date, i) => {
            const isSelected = i === selectedDay
            const isToday = date === today
            const color = DAY_PALETTE[i]
            return (
              <button
                key={date}
                className="day-btn"
                onClick={() => setSelectedDay(i)}
                style={{
                  flex: '0 0 auto',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: isSelected ? '12px 16px' : '10px 13px',
                  borderRadius: 18,
                  border: isToday
                    ? `3px solid #FFD700`
                    : '3px solid transparent',
                  background: isSelected
                    ? color.bg
                    : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: isSelected ? 15 : 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 14px ${color.bg}88` : 'none',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: 18 }}>{DAY_EMOJI[i]}</span>
                <span>{DAY_ABBR[i]}</span>
                {isToday && (
                  <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.9, letterSpacing: 0.5 }}>
                    TODAY
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Day heading ─────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center', marginBottom: 20,
          color: 'rgba(255,255,255,0.85)',
          fontSize: 18, fontWeight: 700,
        }}>
          {DAY_FULL[selectedDay]}'s Chores
          {dayChores.length > 0 && (
            <span style={{ marginLeft: 8, opacity: 0.7, fontWeight: 500, fontSize: 15 }}>
              ({doneCount}/{dayChores.length})
            </span>
          )}
        </div>

        {/* ── Chore cards ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          maxWidth: 520, margin: '0 auto',
        }}>
          {dayChores.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 24px',
              background: 'rgba(255,255,255,0.08)', borderRadius: 28,
              color: 'rgba(255,255,255,0.7)', fontSize: 18,
              animation: 'bounceIn 0.4s ease-out',
            }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
              <p style={{ margin: 0, fontWeight: 700 }}>No chores today!</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, opacity: 0.7 }}>Go play! 🎈</p>
            </div>
          ) : (
            dayChores.map(chore => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                completed={doneIds.includes(chore.id)}
                onToggle={() => toggleChore(chore.id)}
                dayColor={dayColor}
              />
            ))
          )}
        </div>

      </div>
    </>
  )
}
