'use client'

import { useState, useEffect, useCallback } from 'react'
import MuscleSVG, { type MuscleReg } from '@/app/fun/juan/MuscleSVG'
import { ExerciseAnim } from '@/app/fun/juan/ExerciseAnim'
import LibraryPanel from './LibraryPanel'
import type { Exercise, Session, Preset } from '@/lib/bsc/types'
import {
  PRESET_SCHEDULES, DAYS, GEAR_COLORS, PRIORITY_LABELS,
  PRIORITY_COLORS, SESSION_BADGE_STYLES,
} from '@/lib/bsc/sessions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date); const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0,0,0,0); return d
}
function addDays(date: Date, n: number): Date { const d = new Date(date); d.setDate(d.getDate() + n); return d }
function dateKey(date: Date): string { return date.toISOString().slice(0, 10) }
function formatShortDate(d: Date): string { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

/** Composite key matching format stored in completions.json */
export function exerciseKey(dayDate: Date, exerciseName: string): string {
  return `${dateKey(dayDate)}::${exerciseName}`
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchCompletions(weekMonday: string): Promise<Record<string, boolean>> {
  const res = await fetch(`/api/bsc/completions?weekMonday=${weekMonday}`)
  if (!res.ok) return {}
  const { completions } = await res.json() as { completions: Record<string, boolean> }
  return completions
}

async function fetchNotes(): Promise<Record<string, string>> {
  const res = await fetch('/api/bsc/notes')
  if (!res.ok) return {}
  const { notes } = await res.json() as { notes: Record<string, string> }
  return notes
}

async function postCompletion(weekMonday: string, key: string, checked: boolean): Promise<Record<string, boolean>> {
  const res = await fetch('/api/bsc/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ weekMonday, key, checked }),
  })
  if (!res.ok) return {}
  const { completions } = await res.json() as { completions: Record<string, boolean> }
  return completions
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SessionBadge({ session }: { session: Session }) {
  const s = SESSION_BADGE_STYLES[session.type]
  return (
    <span style={{ background: s.bg, color: s.color, fontFamily: 'monospace', fontSize: 10,
      letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {session.type === 'REST' ? 'Rest' : `Session ${session.type}`}
    </span>
  )
}

function ExerciseRow({ exercise, checked, onToggle, isRest, note }:
  { exercise: Exercise; checked: boolean; onToggle: () => void; isRest: boolean; note: string }) {
  const [expanded, setExpanded] = useState(false)
  const pc = PRIORITY_COLORS[exercise.priority]

  return (
    <div style={{ borderBottom: '1px solid var(--hb-border)', opacity: checked ? 0.5 : 1, transition: 'opacity 0.2s' }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px' }}>
        {/* Checkbox */}
        <button onClick={onToggle} aria-label={checked ? 'Mark incomplete' : 'Mark complete'} style={{
          flexShrink: 0, marginTop: 2, width: 20, height: 20, borderRadius: 4, cursor: 'pointer',
          border: checked ? 'none' : '2px solid var(--hb-border)',
          background: checked ? 'var(--hb-green)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
        }}>
          {checked && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--hb-text)', marginBottom: 2, lineHeight: 1.3,
            textDecoration: checked ? 'line-through' : 'none' }}>
            {exercise.name}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', marginBottom: 5 }}>
            {exercise.prescription}
          </div>
          {exercise.gear.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {exercise.gear.map(g => (
                <span key={g} style={{ fontFamily: 'monospace', fontSize: 9, padding: '1px 6px', borderRadius: 3,
                  background: GEAR_COLORS[g]?.bg ?? 'rgba(180,178,169,0.1)',
                  color: GEAR_COLORS[g]?.color ?? '#aaa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {g}
                </span>
              ))}
            </div>
          )}
          {note && !expanded && (
            <div style={{ marginTop: 5, fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-amber)',
              background: 'rgba(239,159,39,0.07)', borderRadius: 3, padding: '3px 7px',
              borderLeft: '2px solid var(--hb-amber)', display: 'inline-block', maxWidth: '100%',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📝 {note}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {!isRest && (
            <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '2px 6px', borderRadius: 3, background: pc.bg, color: pc.color, border: `1px solid ${pc.border}` }}>
              {PRIORITY_LABELS[exercise.priority]}
            </span>
          )}
          <button onClick={() => setExpanded(x => !x)} aria-label={expanded ? 'Collapse' : 'Expand'} style={{
            fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
            display: 'inline-block', transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}>▾</button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--hb-border)', background: 'var(--hb-surface)' }}>
          <div style={{ display: 'flex', gap: 16, padding: '14px 14px 10px 46px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <MuscleSVG view={exercise.muscleView} reg={exercise.muscleReg as MuscleReg} />
            </div>
            <ExerciseAnim name={exercise.name} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--hb-textSub)', marginBottom: 8 }}>Muscle Targets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e03030', flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ color: 'var(--hb-text)', fontWeight: 500 }}>{exercise.primaryMuscle}</span>
                </div>
                {exercise.secondaryMuscle && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#e8c040', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ color: 'var(--hb-textSub)' }}>{exercise.secondaryMuscle}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--hb-textSub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: '#e03030', borderRadius: 1, display: 'inline-block' }} />Primary
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--hb-textSub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: '#e8c040', borderRadius: 1, display: 'inline-block' }} />Secondary
                </span>
              </div>
            </div>
          </div>

          {exercise.alternatives.length > 0 && (
            <div style={{ padding: '10px 14px 14px 14px', borderTop: '1px solid var(--hb-border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--hb-textSub)', marginBottom: 10 }}>Alternatives</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {exercise.alternatives.map((alt, i) => (
                  <div key={i} style={{ background: 'var(--hb-card)', border: '1px solid var(--hb-border)',
                    borderRadius: 6, padding: '9px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-textSub)',
                      background: 'var(--hb-border)', borderRadius: 3, padding: '1px 6px', flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--hb-text)', marginBottom: 2 }}>{alt.name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-textSub)', marginBottom: 4 }}>{alt.prescription}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-accent)',
                        background: 'rgba(55,138,221,0.08)', borderRadius: 3, padding: '2px 6px', display: 'inline-block' }}>
                        {alt.whenToUse}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {note && (
            <div style={{ padding: '8px 14px 12px 14px', borderTop: '1px solid var(--hb-border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--hb-textSub)', marginBottom: 6 }}>Your Note</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--hb-amber)', lineHeight: 1.6,
                background: 'rgba(239,159,39,0.07)', borderRadius: 4, padding: '8px 10px',
                borderLeft: '2px solid var(--hb-amber)' }}>{note}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayPill({ label, date, session, doneCount, totalCount, isToday, isSelected, onClick }:
  { label: string; date: Date; session: Session; doneCount: number; totalCount: number;
    isToday: boolean; isSelected: boolean; onClick: () => void }) {
  const pct = totalCount > 0 ? doneCount / totalCount : 0
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 0, background: isSelected ? 'var(--hb-card)' : 'var(--hb-surface)',
      border: isSelected ? `2px solid ${session.color}` : isToday ? '2px solid var(--hb-accent)' : '1px solid var(--hb-border)',
      borderRadius: 8, padding: '8px 6px', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s',
    }}>
      <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: isToday ? 'var(--hb-accent)' : 'var(--hb-textSub)' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)' }}>{date.getDate()}</span>
      <SessionBadge session={session} />
      {session.type !== 'REST' && totalCount > 0 && (
        <>
          <div style={{ width: '100%', height: 3, background: 'var(--hb-border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`,
              background: pct === 1 ? 'var(--hb-green)' : session.color,
              borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 10,
            color: pct === 1 ? 'var(--hb-green)' : 'var(--hb-textSub)' }}>
            {doneCount}/{totalCount}
          </span>
        </>
      )}
    </button>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

interface Props {
  initialNotes: Record<string, string>
}

export default function BscClient({ initialNotes }: Props) {
  const [mounted, setMounted] = useState(false)
  const [preset, setPreset] = useState<Preset>('3day')
  const [weekMonday, setWeekMonday] = useState(() => getMondayOfWeek(new Date()))
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay(); return d === 0 ? 6 : d - 1
  })
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<Record<string, string>>(initialNotes)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showTempoRef, setShowTempoRef] = useState(false)

  // Load completions from server on week change
  useEffect(() => {
    setMounted(true)
    const wm = dateKey(weekMonday)
    fetchCompletions(wm).then(setChecked)
  }, [weekMonday])

  const schedule = PRESET_SCHEDULES[preset]
  const cKey = (dayIdx: number, exName: string) =>
    exerciseKey(addDays(weekMonday, dayIdx), exName)

  const toggleExercise = useCallback(async (dayIdx: number, exName: string) => {
    const wm = dateKey(weekMonday)
    const key = cKey(dayIdx, exName)
    const next = !checked[key]
    // Optimistic update
    setChecked(prev => ({ ...prev, [key]: next }))
    // Persist
    const updated = await postCompletion(wm, key, next)
    setChecked(updated)
  }, [weekMonday, checked])

  const getDayProgress = (i: number) => {
    const s = schedule[i]; if (s.type === 'REST') return { done: 0, total: 0 }
    return { total: s.exercises.length, done: s.exercises.filter(ex => checked[cKey(i, ex.name)]).length }
  }

  const today = new Date(); today.setHours(0,0,0,0)
  const weekLabel = `${formatShortDate(weekMonday)} – ${formatShortDate(addDays(weekMonday, 6))}`
  let weekDone = 0, weekTotal = 0
  schedule.forEach((_, i) => { const p = getDayProgress(i); weekDone += p.done; weekTotal += p.total })

  const selectedSession = schedule[selectedDayIdx]
  const selectedDate = addDays(weekMonday, selectedDayIdx)

  if (!mounted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <span style={{ color: 'var(--hb-textSub)', fontFamily: 'monospace', fontSize: 13 }}>Loading…</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860, margin: '0 auto' }}>

      {showLibrary && (
        <LibraryPanel notes={notes} onNotesChange={setNotes} onClose={() => setShowLibrary(false)} />
      )}

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--hb-border)', paddingBottom: 20 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--hb-amber)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--hb-amber)' }} />
          Juan's training tracker
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
              Backyard <span style={{ color: 'var(--hb-amber)' }}>strength</span> &amp; conditioning
            </h1>
            <p style={{ fontSize: 14, color: 'var(--hb-textSub)', maxWidth: 480, lineHeight: 1.7 }}>
              Full-body outdoor training — check off exercises as you complete them.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['Kettlebell', 'Resistance bands', 'Flat bench', 'Bodyweight'].map(g => (
                <span key={g} style={{ fontFamily: 'monospace', fontSize: 11, padding: '3px 9px',
                  border: '1px solid var(--hb-border)', borderRadius: 3, color: 'var(--hb-textSub)', letterSpacing: '0.06em' }}>{g}</span>
              ))}
            </div>
          </div>
          <button onClick={() => setShowLibrary(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.3)',
            borderRadius: 8, cursor: 'pointer', color: 'var(--hb-amber)', fontFamily: 'monospace',
            fontSize: 12, letterSpacing: '0.05em', flexShrink: 0, transition: 'background 0.15s',
          }}>
            <span style={{ fontSize: 16 }}>📚</span>
            Exercise library &amp; notes
            {Object.keys(notes).length > 0 && (
              <span style={{ background: 'var(--hb-amber)', color: '#000', borderRadius: '50%',
                width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center' }}>{Object.keys(notes).length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Week nav + preset */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setWeekMonday(d => addDays(d, -7))} style={{ background: 'var(--hb-surface)',
            border: '1px solid var(--hb-border)', color: 'var(--hb-textSub)', borderRadius: 6,
            padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>← prev</button>
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--hb-text)', minWidth: 160, textAlign: 'center' }}>{weekLabel}</span>
          <button onClick={() => setWeekMonday(d => addDays(d, 7))} style={{ background: 'var(--hb-surface)',
            border: '1px solid var(--hb-border)', color: 'var(--hb-textSub)', borderRadius: 6,
            padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>next →</button>
          <button onClick={() => { setWeekMonday(getMondayOfWeek(new Date())); const d = new Date().getDay(); setSelectedDayIdx(d===0?6:d-1) }}
            style={{ background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.3)',
              color: 'var(--hb-accent)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>today</button>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Template:</span>
          {(['2day','3day','4day'] as const).map(p => (
            <button key={p} onClick={() => setPreset(p)} style={{
              fontFamily: 'monospace', fontSize: 11, padding: '4px 10px', border: '1px solid var(--hb-border)',
              borderRadius: 4, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s',
              background: preset === p ? 'rgba(240,192,64,0.1)' : 'transparent',
              color: preset === p ? '#f0c040' : 'var(--hb-textSub)',
              ...(preset === p ? { borderColor: 'rgba(240,192,64,0.4)' } : {}),
            }}>{p === '2day' ? '2×/wk' : p === '3day' ? '3×/wk' : '4×/wk'}</button>
          ))}
        </div>
      </div>

      {/* Weekly summary cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { label: 'Sessions/wk', value: schedule.filter(s => s.type !== 'REST').length, color: '#f0c040' },
          { label: 'Exercises done', value: `${weekDone}/${weekTotal}`, color: 'var(--hb-green)' },
          { label: 'Week progress', value: weekTotal > 0 ? `${Math.round(weekDone/weekTotal*100)}%` : '0%', color: 'var(--hb-accent)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--hb-surface)', border: '1px solid var(--hb-border)',
            borderRadius: 8, padding: '10px 16px', flex: '1 1 120px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-textSub)', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 6 }}>
        {DAYS.map((day, i) => {
          const dayDate = addDays(weekMonday, i); dayDate.setHours(0,0,0,0)
          const { done, total } = getDayProgress(i)
          return <DayPill key={day} label={day} date={dayDate} session={schedule[i]} doneCount={done} totalCount={total}
            isToday={dayDate.getTime() === today.getTime()} isSelected={selectedDayIdx === i} onClick={() => setSelectedDayIdx(i)} />
        })}
      </div>

      {/* Selected day exercise list */}
      <div style={{ background: 'var(--hb-surface)',
        border: `1px solid ${selectedSession.type !== 'REST' ? selectedSession.color+'55' : 'var(--hb-border)'}`,
        borderRadius: 10, overflow: 'hidden' }}>
        {/* Day header */}
        <div style={{ padding: '14px 16px', background: 'var(--hb-card)', borderBottom: '1px solid var(--hb-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{DAYS[selectedDayIdx]}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)' }}>{formatShortDate(selectedDate)}</span>
                <SessionBadge session={selectedSession} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--hb-text)' }}>{selectedSession.label}</div>
            </div>
          </div>
          {selectedSession.type !== 'REST' && (() => {
            const { done, total } = getDayProgress(selectedDayIdx)
            return (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                <div style={{ width: 120, height: 6, background: 'var(--hb-border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${total > 0 ? done/total*100 : 0}%`,
                    background: done===total && total>0 ? 'var(--hb-green)' : selectedSession.color,
                    borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 12,
                  color: done===total && total>0 ? 'var(--hb-green)' : 'var(--hb-textSub)', minWidth: 40 }}>
                  {done}/{total}
                </span>
                {done > 0 && done < total && (
                  <button onClick={async () => {
                    const wm = dateKey(weekMonday)
                    // Clear all exercises for this day optimistically
                    setChecked(prev => {
                      const next = { ...prev }
                      selectedSession.exercises.forEach(ex => { delete next[cKey(selectedDayIdx, ex.name)] })
                      return next
                    })
                    // Persist each uncheck
                    for (const ex of selectedSession.exercises) {
                      await postCompletion(wm, cKey(selectedDayIdx, ex.name), false)
                    }
                  }} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-textSub)',
                    background: 'none', border: '1px solid var(--hb-border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                    reset
                  </button>
                )}
                {done===total && total>0 && <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-green)' }}>✓ Done!</span>}
              </div>
            )
          })()}
        </div>

        {selectedSession.exercises.map(ex => (
          <ExerciseRow key={ex.name} exercise={ex} checked={!!checked[cKey(selectedDayIdx, ex.name)]}
            onToggle={() => toggleExercise(selectedDayIdx, ex.name)} isRest={selectedSession.type === 'REST'}
            note={notes[ex.name] ?? ''} />
        ))}

        {selectedSession.type !== 'REST' && (
          <div style={{ padding: '10px 14px', background: 'var(--hb-card)', borderTop: '1px solid var(--hb-border)',
            fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', lineHeight: 1.7 }}>
            {selectedSession.type === 'A' && <><span style={{ color: 'var(--hb-amber)' }}>Note:</span> Pull-dominant. Lead with face pulls &amp; pull-aparts before any pressing movement.</>}
            {selectedSession.type === 'B' && <><span style={{ color: 'var(--hb-green)' }}>Note:</span> Push-dominant. Always start with external rotation and pull-aparts before pressing.</>}
            {selectedSession.type === 'C' && <><span style={{ color: '#c88cf0' }}>Note:</span> Conditioning focus. Turkish get-up is the anchor — take your time, 3–5 min between sides.</>}
          </div>
        )}
      </div>

      {/* Tempo reference */}
      <div style={{ background: 'var(--hb-surface)', border: '1px solid var(--hb-border)', borderRadius: 10, overflow: 'hidden' }}>
        <button onClick={() => setShowTempoRef(x => !x)} style={{ width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hb-textSub)' }}>
            Tempo &amp; reference
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', display: 'inline-block',
            transition: 'transform 0.25s', transform: showTempoRef ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {showTempoRef && (
          <div style={{ borderTop: '1px solid var(--hb-border)', padding: 16 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--hb-textSub)', marginBottom: 12 }}>Tempo notation</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1,
              background: 'var(--hb-border)', border: '1px solid var(--hb-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              {[
                { code: '3-1-1', name: 'Standard strength',     desc: 'Push-ups, rows, squats. Slow eccentric builds tendon strength.' },
                { code: '2-1-2', name: 'Controlled bilateral',  desc: 'Rows and pulls. Equal time each direction.' },
                { code: '2-2-1', name: 'Paused contraction',    desc: 'Hip thrust. Pause removes momentum, forces max glute activation.' },
                { code: '2-0-1', name: 'Continuous tension',    desc: 'Band exercises. No pause keeps constant load.' },
                { code: '3-0-1', name: 'Stretch emphasis',      desc: 'Flies and isolation. Maximises the stretched position.' },
                { code: 'X-X-X', name: 'Explosive / ballistic', desc: 'KB swings and cleans. Maximum hip-drive power.' },
              ].map(t => (
                <div key={t.code} style={{ background: 'var(--hb-card)', padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600, color: '#f0c040', letterSpacing: '0.1em', marginBottom: 4 }}>{t.code}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--hb-text)', marginBottom: 6 }}>{t.name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--hb-card)', border: '1px solid var(--hb-border)',
              borderRadius: 6, fontFamily: 'monospace', fontSize: 12, color: 'var(--hb-textSub)', lineHeight: 1.8 }}>
              <span style={{ color: '#f0c040', fontWeight: 500 }}>Desk-job note —</span>{' '}
              Pull exercises should outnumber push 2:1. Lead every session with band pull-aparts and face pulls. KB swing and hip thrust are the highest-value moves for desk-job glute weakness.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
