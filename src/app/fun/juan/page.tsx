'use client'

import { useState, useEffect, useCallback } from 'react'
import MuscleSVG, { type MuscleReg } from './MuscleSVG'
import { ExerciseAnim } from './ExerciseAnim'

// ── Types ─────────────────────────────────────────────────────────────────
interface Alternative {
  name: string
  prescription: string
  whenToUse: string
}

interface Exercise {
  name: string
  prescription: string
  gear: string[]
  priority: 'h' | 'm' | 'l'
  primaryMuscle: string
  secondaryMuscle: string
  muscleView: 'front' | 'back' | 'both'
  muscleReg: MuscleReg
  alternatives: Alternative[]
}

interface Session {
  type: 'A' | 'B' | 'C' | 'REST'
  label: string
  color: string
  exercises: Exercise[]
}

// ── Exercise Lookup ───────────────────────────────────────────────────────
// All unique exercises with full muscle + alternatives data
const EX: Record<string, Exercise> = {
  'Band pull-apart': {
    name: 'Band pull-apart', prescription: '3 × 15–20 · between push sets', gear: ['Band'], priority: 'h',
    primaryMuscle: 'Rear delt · rhomboids', secondaryMuscle: 'Mid traps',
    muscleView: 'back', muscleReg: { rear_delt: 'p', rhomboids: 'p', traps: 's' },
    alternatives: [
      { name: 'Prone Y/T raise (floor)', prescription: '3 × 10 each', whenToUse: 'No band — same posterior chain target' },
      { name: 'Band pull-apart at nose height', prescription: '3 × 15 · rotate wrists out as you pull', whenToUse: 'More external rotation emphasis' },
    ],
  },
  'Band face pull': {
    name: 'Band face pull', prescription: '3 × 15 · anchor at face height', gear: ['Band'], priority: 'h',
    primaryMuscle: 'Rear delt · mid traps', secondaryMuscle: 'Rhomboids · rotator cuff',
    muscleView: 'back', muscleReg: { rear_delt: 'p', traps: 'p', rhomboids: 's' },
    alternatives: [
      { name: 'Prone T-raise (floor)', prescription: '3 × 12 · lie face down, arms to T', whenToUse: 'No band — gravity provides resistance' },
      { name: 'Band pull-apart at face height', prescription: '3 × 15 · elbows flared', whenToUse: 'Simpler setup, same rear delt target' },
    ],
  },
  'KB swing (two-hand)': {
    name: 'KB swing (two-hand)', prescription: '4 × 15–20 · hip hinge, not squat', gear: ['KB'], priority: 'h',
    primaryMuscle: 'Glutes · hamstrings', secondaryMuscle: 'Erector spinae · core',
    muscleView: 'back', muscleReg: { glutes: 'p', hamstrings: 'p', lower_back: 's' },
    alternatives: [
      { name: 'Band pull-through', prescription: '3 × 15 · anchor band low behind you', whenToUse: 'Lighter load — same hinge pattern with less spinal load' },
      { name: 'KB Romanian deadlift', prescription: '3 × 10 · hinge to mid-shin', whenToUse: 'Slower tempo — more hamstring time under tension' },
    ],
  },
  'Hip thrust (bench)': {
    name: 'Hip thrust (bench)', prescription: '3 × 12–15 · 2-2-1 · KB on hips opt.', gear: ['Bench', 'KB'], priority: 'h',
    primaryMuscle: 'Gluteus maximus', secondaryMuscle: 'Hamstrings · adductors',
    muscleView: 'back', muscleReg: { glutes: 'p', hamstrings: 's' },
    alternatives: [
      { name: 'Glute bridge (floor)', prescription: '3 × 15–20 · both feet flat', whenToUse: 'No bench — easier regression, same glute target' },
      { name: 'Single-leg hip thrust', prescription: '3 × 10/side · one foot raised', whenToUse: 'Unilateral progression — more stability demand' },
    ],
  },
  'KB single-arm row': {
    name: 'KB single-arm row', prescription: '3 × 10/side · 2-1-2 tempo', gear: ['KB', 'Bench'], priority: 'h',
    primaryMuscle: 'Latissimus dorsi', secondaryMuscle: 'Rhomboids · rear delt · biceps',
    muscleView: 'back', muscleReg: { lats: 'p', rhomboids: 's', rear_delt: 's' },
    alternatives: [
      { name: 'Band seated row', prescription: '3 × 12–15 · loop band around feet', whenToUse: 'No KB — lighter, easier on lower back' },
      { name: 'Chest-supported KB row', prescription: '3 × 10 · chest flat on bench', whenToUse: 'Removes lower back fatigue — better lat isolation' },
    ],
  },
  'Dead bug': {
    name: 'Dead bug', prescription: '3 × 8/side · press low back flat', gear: ['BW'], priority: 'h',
    primaryMuscle: 'TVA · rectus abdominis', secondaryMuscle: 'Obliques · hip flexors',
    muscleView: 'front', muscleReg: { abs: 'p', obliques: 's' },
    alternatives: [
      { name: 'Bird dog', prescription: '3 × 8/side · slow and deliberate', whenToUse: 'Trains same anti-extension from a different position' },
      { name: 'Hollow body hold', prescription: '3 × 20–30 sec · low back pressed flat', whenToUse: 'Harder progression — more rectus work' },
    ],
  },
  'Band Pallof press': {
    name: 'Band Pallof press', prescription: '3 × 10–12/side · anti-rotation', gear: ['Band'], priority: 'h',
    primaryMuscle: 'Obliques (anti-rotation)', secondaryMuscle: 'TVA · glutes',
    muscleView: 'front', muscleReg: { obliques: 'p', abs: 's' },
    alternatives: [
      { name: 'Side plank', prescription: '3 × 25–30 sec/side · body straight', whenToUse: 'No band — similar anti-lateral demand' },
      { name: 'Half-kneeling chop', prescription: '3 × 10/side · diagonal pull', whenToUse: 'More dynamic anti-rotation pattern' },
    ],
  },
  'Band external rotation': {
    name: 'Band external rotation', prescription: '3 × 15/side · rotator cuff health', gear: ['Band'], priority: 'h',
    primaryMuscle: 'Infraspinatus · teres minor', secondaryMuscle: 'Posterior capsule',
    muscleView: 'back', muscleReg: { rear_delt: 'p' },
    alternatives: [
      { name: 'Side-lying external rotation', prescription: '3 × 15/side · no band — just gravity', whenToUse: 'No band — identical pattern, bodyweight only' },
      { name: '90/90 shoulder stretch', prescription: '2 × 60 sec/side · passive hold', whenToUse: 'Shoulder is stiff — passive mobility work' },
    ],
  },
  'Push-up (standard/incline)': {
    name: 'Push-up (standard/incline)', prescription: '3 × 8–15 · 3-1-1 tempo', gear: ['BW', 'Bench'], priority: 'h',
    primaryMuscle: 'Pectoralis major', secondaryMuscle: 'Anterior delt · triceps',
    muscleView: 'front', muscleReg: { chest: 'p', triceps_f: 's', shoulders: 's' },
    alternatives: [
      { name: 'Incline push-up (hands on bench)', prescription: '3 × 12–15 · easier angle', whenToUse: 'Regression — build up to standard' },
      { name: 'Decline push-up (feet on bench)', prescription: '3 × 8–10 · upper chest emphasis', whenToUse: 'Progression — shifts load to upper chest' },
    ],
  },
  'KB overhead press': {
    name: 'KB overhead press', prescription: '3 × 8–10/side · 3-1-1 tempo', gear: ['KB', 'Bench'], priority: 'h',
    primaryMuscle: 'Deltoids (all heads)', secondaryMuscle: 'Triceps · upper traps',
    muscleView: 'front', muscleReg: { shoulders: 'p', triceps_f: 's' },
    alternatives: [
      { name: 'Band overhead press (bilateral)', prescription: '3 × 12–15 · stand on band', whenToUse: 'Lighter resistance — learn the press pattern first' },
      { name: 'Pike push-up', prescription: '3 × 8–10 · hips high, head toward floor', whenToUse: 'No equipment needed — similar shoulder demand' },
    ],
  },
  'KB goblet squat': {
    name: 'KB goblet squat', prescription: '3 × 10–12 · 3-1-1 · KB at chest', gear: ['KB'], priority: 'h',
    primaryMuscle: 'Quadriceps', secondaryMuscle: 'Glutes · erectors · core',
    muscleView: 'front', muscleReg: { quads: 'p', hip_flexors: 's' },
    alternatives: [
      { name: 'Band squat', prescription: '3 × 15 · stand on band, band at shoulders', whenToUse: 'No KB — deloads the spine' },
      { name: 'Reverse lunge (KB)', prescription: '3 × 10/side · step back, knee to floor', whenToUse: 'Unilateral variation — more glute & balance' },
    ],
  },
  'Plank (standard/RKC)': {
    name: 'Plank (standard/RKC)', prescription: '3 × 20–40 sec · squeeze everything', gear: ['BW'], priority: 'h',
    primaryMuscle: 'TVA · rectus abdominis', secondaryMuscle: 'Glutes · shoulder stabilizers',
    muscleView: 'front', muscleReg: { abs: 'p', obliques: 'p' },
    alternatives: [
      { name: 'Dead bug', prescription: '3 × 8/side · dynamic anti-extension', whenToUse: 'More active alternative — harder to cheat' },
      { name: 'Bear crawl hold', prescription: '3 × 20 sec · hands and knees 1 in off floor', whenToUse: 'Higher shoulder demand — progression option' },
    ],
  },
  'Bird dog': {
    name: 'Bird dog', prescription: '3 × 8/side · slow and deliberate', gear: ['BW'], priority: 'm',
    primaryMuscle: 'Erector spinae · multifidus', secondaryMuscle: 'Glutes · shoulder stabilizers',
    muscleView: 'back', muscleReg: { lower_back: 'p', glutes: 's' },
    alternatives: [
      { name: 'Dead bug', prescription: '3 × 8/side · supine position', whenToUse: 'Complementary — do both when time allows' },
      { name: 'Superman hold', prescription: '3 × 10 × 3 sec · face down on floor', whenToUse: 'More lower back emphasis, no coordination demand' },
    ],
  },
  'KB Turkish get-up': {
    name: 'KB Turkish get-up', prescription: '2–3 × 3–5/side · slow, deliberate', gear: ['KB'], priority: 'h',
    primaryMuscle: 'Shoulder stabilizers · core', secondaryMuscle: 'Glutes · lats · hips',
    muscleView: 'both', muscleReg: { shoulders: 'p', abs: 's', glutes: 's', lats: 's' },
    alternatives: [
      { name: 'Half get-up (to elbow only)', prescription: '3 × 5/side · stop at elbow-supported sit-up', whenToUse: 'Regression — learn the first phase before adding the stand' },
      { name: 'KB windmill', prescription: '3 × 5/side · KB locked overhead', whenToUse: 'Shoulder + hip hinge focus — less full-body complexity' },
    ],
  },
  'KB clean (single arm)': {
    name: 'KB clean (single arm)', prescription: '3 × 5–8/side · hip drive, not arm pull', gear: ['KB'], priority: 'h',
    primaryMuscle: 'Glutes · hamstrings · posterior chain', secondaryMuscle: 'Traps · lats · core',
    muscleView: 'both', muscleReg: { glutes: 'p', hamstrings: 'p', lats: 's', traps: 's' },
    alternatives: [
      { name: 'KB high pull', prescription: '3 × 8/side · pull to shoulder height, no catch', whenToUse: 'Build the hip drive without learning the catch' },
      { name: 'KB swing (one-hand)', prescription: '4 × 15 · practice the hinge portion', whenToUse: 'Simpler regression — same posterior chain demand' },
    ],
  },
  'KB swing + squat complex': {
    name: 'KB swing + squat complex', prescription: '3 rounds: 10 swings + 5 goblet squats', gear: ['KB'], priority: 'm',
    primaryMuscle: 'Full posterior + anterior chain', secondaryMuscle: 'Core · cardiovascular',
    muscleView: 'both', muscleReg: { glutes: 'p', quads: 'p', abs: 's' },
    alternatives: [
      { name: 'Swings only (extended set)', prescription: '4 × 20 · pure conditioning', whenToUse: 'When fatigued — drop the squat, keep the hinge' },
      { name: 'KB thruster (squat + press)', prescription: '3 × 8 · squat then press overhead', whenToUse: 'Push-dominant conditioning alternative' },
    ],
  },
  'KB suitcase carry': {
    name: 'KB suitcase carry', prescription: '3 × 20–30 m/side · lateral core', gear: ['KB'], priority: 'm',
    primaryMuscle: 'Lateral core · QL', secondaryMuscle: 'Glutes · traps · grip',
    muscleView: 'front', muscleReg: { obliques: 'p', abs: 's' },
    alternatives: [
      { name: 'Side plank', prescription: '3 × 30 sec/side · no space needed', whenToUse: 'No room to walk — same anti-lateral demand' },
      { name: 'Single-arm KB overhead carry', prescription: '3 × 20 m/side · arm locked out', whenToUse: 'More shoulder stability — harder progression' },
    ],
  },
  'Band seated row': {
    name: 'Band seated row', prescription: '3 × 12–15 · loop around feet', gear: ['Band'], priority: 'm',
    primaryMuscle: 'Mid back · rhomboids', secondaryMuscle: 'Lats · biceps',
    muscleView: 'back', muscleReg: { rhomboids: 'p', lats: 's', traps: 's' },
    alternatives: [
      { name: 'KB single-arm row', prescription: '3 × 10/side · more range of motion', whenToUse: 'More lat involvement and heavier loading' },
      { name: 'Band pull-apart', prescription: '3 × 20 · lighter volume option', whenToUse: 'Active recovery — same muscle group, lower demand' },
    ],
  },
  "KB farmer's carry": {
    name: "KB farmer's carry", prescription: '3 × 30–40 m · grip, traps, and gait', gear: ['KB'], priority: 'l',
    primaryMuscle: 'Traps · grip · core (static)', secondaryMuscle: 'Erectors · glutes',
    muscleView: 'back', muscleReg: { traps: 'p', lower_back: 's', glutes: 's' },
    alternatives: [
      { name: 'Double KB rack carry', prescription: '3 × 20 m · KBs at shoulder height', whenToUse: 'More core and shoulder demand' },
      { name: 'KB suitcase carry (single arm)', prescription: '3 × 20 m/side · asymmetric load', whenToUse: 'Anti-lateral core progression' },
    ],
  },
  // Rest-day exercises
  'Walk 15–30 min': {
    name: 'Walk 15–30 min', prescription: 'Aerobic recovery · 150 min/week target', gear: [], priority: 'h',
    primaryMuscle: 'Cardiovascular', secondaryMuscle: '',
    muscleView: 'front', muscleReg: {},
    alternatives: [
      { name: 'Easy bike ride', prescription: '20 min · low intensity', whenToUse: 'Joint-friendly aerobic alternative' },
      { name: 'Light mobility circuit', prescription: '15 min · hip circles + shoulder CARs', whenToUse: 'Bad weather — indoor alternative' },
    ],
  },
  'Couch stretch': {
    name: 'Couch stretch', prescription: '2 min/side · hip flexors from desk sitting', gear: [], priority: 'h',
    primaryMuscle: 'Hip flexors', secondaryMuscle: 'Quads (stretch)',
    muscleView: 'front', muscleReg: { hip_flexors: 'p', quads: 's' },
    alternatives: [
      { name: 'Half-kneeling hip flexor stretch', prescription: '90 sec/side · gentler entry', whenToUse: 'Too tight for couch stretch — build up first' },
      { name: '90/90 hip mobility drill', prescription: '10 reps/side · rotate between positions', whenToUse: 'More dynamic — adds internal rotation' },
    ],
  },
  'Thoracic rotations': {
    name: 'Thoracic rotations', prescription: '10 reps/side · counter thoracic rounding', gear: [], priority: 'h',
    primaryMuscle: 'Thoracic spine · obliques', secondaryMuscle: 'Rear delts',
    muscleView: 'back', muscleReg: { lower_back: 'p', rear_delt: 's' },
    alternatives: [
      { name: 'Cat-cow', prescription: '10 reps slow · full spinal wave', whenToUse: 'More spinal flexion/extension work' },
      { name: 'Thread the needle', prescription: '8 reps/side · deep rotation', whenToUse: 'Deeper thoracic rotation — great for desk workers' },
    ],
  },
  'Band pull-aparts (rest)': {
    name: 'Band pull-aparts (rest)', prescription: '2 × 15 · active recovery for posture', gear: ['Band'], priority: 'h',
    primaryMuscle: 'Rear delt · rhomboids', secondaryMuscle: 'Mid traps',
    muscleView: 'back', muscleReg: { rear_delt: 'p', rhomboids: 'p', traps: 's' },
    alternatives: [
      { name: 'Prone Y raise (floor)', prescription: '2 × 12 · face down, arms to Y', whenToUse: 'No band' },
      { name: 'Wall angels', prescription: '2 × 10 · back flat against wall', whenToUse: 'More scapular mobility focus' },
    ],
  },
}

// ── Session Definitions ───────────────────────────────────────────────────
const SA: Session = {
  type: 'A', label: 'Session A — Pull', color: '#f0c040',
  exercises: ['Band pull-apart','Band face pull','KB swing (two-hand)','Hip thrust (bench)','KB single-arm row','Dead bug','Band Pallof press'].map(n => EX[n]),
}
const SB: Session = {
  type: 'B', label: 'Session B — Push', color: '#6dbf8f',
  exercises: ['Band pull-apart','Band external rotation','Push-up (standard/incline)','KB overhead press','KB goblet squat','Plank (standard/RKC)','Bird dog'].map(n => EX[n]),
}
const SC: Session = {
  type: 'C', label: 'Session C — Conditioning', color: '#c88cf0',
  exercises: ['Band pull-apart','KB Turkish get-up','KB clean (single arm)','KB swing + squat complex','KB suitcase carry','Band seated row',"KB farmer's carry"].map(n => EX[n]),
}
const REST: Session = {
  type: 'REST', label: 'Rest Day', color: 'rgba(180,178,169,0.5)',
  exercises: ['Walk 15–30 min','Couch stretch','Thoracic rotations','Band pull-aparts (rest)'].map(n => EX[n]),
}

const PRESET_SCHEDULES: Record<string, Session[]> = {
  '2day': [REST, SA, REST, SB, REST, REST, REST],
  '3day': [SA, REST, SB, REST, SC, REST, REST],
  '4day': [SA, SB, REST, SC, SA, REST, REST],
}

// ── Full library for notes panel ─────────────────────────────────────────
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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const GEAR_COLORS: Record<string, { bg: string; color: string }> = {
  KB:    { bg: 'rgba(232,201,106,0.15)', color: '#e8c96a' },
  Band:  { bg: 'rgba(109,191,143,0.15)', color: '#6dbf8f' },
  BW:    { bg: 'rgba(180,178,169,0.12)', color: '#aaa' },
  Bench: { bg: 'rgba(240,153,123,0.15)', color: '#f0997b' },
}
const PRIORITY_LABELS  = { h: 'Primary', m: 'Secondary', l: 'Accessory' }
const PRIORITY_COLORS  = {
  h: { bg: 'rgba(240,192,64,0.12)',  color: '#f0c040', border: 'rgba(240,192,64,0.3)' },
  m: { bg: 'rgba(240,104,40,0.10)',  color: '#f06828', border: 'rgba(240,104,40,0.25)' },
  l: { bg: 'rgba(180,178,169,0.08)', color: '#888',    border: 'rgba(180,178,169,0.2)' },
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date); const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); d.setHours(0,0,0,0); return d
}
function addDays(date: Date, n: number): Date { const d = new Date(date); d.setDate(d.getDate() + n); return d }
function dateKey(date: Date): string { return date.toISOString().slice(0, 10) }
function formatShortDate(d: Date): string { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
function storageKey(wm: Date): string { return `workout-tracker-${dateKey(wm)}` }
function loadChecked(wm: Date): Record<string, boolean> {
  try { const r = localStorage.getItem(storageKey(wm)); return r ? JSON.parse(r) : {} } catch { return {} }
}
function saveChecked(wm: Date, c: Record<string, boolean>) {
  try { localStorage.setItem(storageKey(wm), JSON.stringify(c)) } catch {}
}
function loadNotes(): Record<string, string> {
  try { const r = localStorage.getItem('exercise-notes'); return r ? JSON.parse(r) : {} } catch { return {} }
}
function saveNotes(notes: Record<string, string>) {
  try { localStorage.setItem('exercise-notes', JSON.stringify(notes)) } catch {}
}

// ── Sub-components ────────────────────────────────────────────────────────
function SessionBadge({ session }: { session: Session }) {
  const c: Record<string, { bg: string; color: string }> = {
    A: { bg: 'rgba(240,192,64,0.15)', color: '#f0c040' }, B: { bg: 'rgba(109,191,143,0.15)', color: '#6dbf8f' },
    C: { bg: 'rgba(200,140,240,0.15)', color: '#c88cf0' }, REST: { bg: 'rgba(180,178,169,0.08)', color: '#888' },
  }
  const s = c[session.type]
  return (
    <span style={{ background: s.bg, color: s.color, fontFamily: 'monospace', fontSize: 10,
      letterSpacing: '0.06em', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {session.type === 'REST' ? 'Rest' : `Session ${session.type}`}
    </span>
  )
}

// ── Exercise Row ──────────────────────────────────────────────────────────
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
          {/* Inline note preview */}
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
          {/* Animation + muscle diagram + targets */}
          <div style={{ display: 'flex', gap: 16, padding: '14px 14px 10px 46px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <MuscleSVG view={exercise.muscleView} reg={exercise.muscleReg} />
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
              {/* Legend */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--hb-textSub)',
                  display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: '#e03030', borderRadius: 1, display: 'inline-block' }} />Primary
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--hb-textSub)',
                  display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, background: '#e8c040', borderRadius: 1, display: 'inline-block' }} />Secondary
                </span>
              </div>
            </div>
          </div>

          {/* Alternatives */}
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

          {/* Note preview in expanded state */}
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

// ── Exercise Library Panel ────────────────────────────────────────────────
function LibraryPanel({ notes, onNotesChange, onClose }:
  { notes: Record<string, string>; onNotesChange: (n: Record<string, string>) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const update = (name: string, val: string) => {
    const next = { ...notes, [name]: val }
    if (!val) delete next[name]
    onNotesChange(next)
    saveNotes(next)
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
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0,
          background: 'var(--hb-surface)', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--hb-textSub)', marginBottom: 4 }}>Exercise Notes</div>
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
              {/* Group header */}
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
                  <span style={{ color: 'var(--hb-textSub)', fontSize: 11,
                    display: 'inline-block', transition: 'transform 0.2s',
                    transform: openGroup === g.group ? 'rotate(180deg)' : 'none' }}>▾</span>
                </div>
              </button>
              {/* Exercises in group */}
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

// ── Day Pill ──────────────────────────────────────────────────────────────
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

// ── Main Page ─────────────────────────────────────────────────────────────
export default function JuanWorkoutPage() {
  const [mounted, setMounted] = useState(false)
  const [preset, setPreset] = useState<'2day' | '3day' | '4day'>('3day')
  const [weekMonday, setWeekMonday] = useState(() => getMondayOfWeek(new Date()))
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay(); return d === 0 ? 6 : d - 1
  })
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [showLibrary, setShowLibrary] = useState(false)
  const [showTempoRef, setShowTempoRef] = useState(false)

  useEffect(() => {
    setMounted(true)
    setChecked(loadChecked(weekMonday))
    setNotes(loadNotes())
  }, [weekMonday])

  const schedule = PRESET_SCHEDULES[preset]
  const cKey = (dayIdx: number, exName: string) => `${dateKey(addDays(weekMonday, dayIdx))}::${exName}`

  const toggleExercise = useCallback((dayIdx: number, exName: string) => {
    setChecked(prev => {
      const k = cKey(dayIdx, exName); const next = { ...prev, [k]: !prev[k] }
      saveChecked(weekMonday, next); return next
    })
  }, [weekMonday])

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

      {/* Library panel overlay */}
      {showLibrary && <LibraryPanel notes={notes} onNotesChange={setNotes} onClose={() => setShowLibrary(false)} />}

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
          {/* Library button */}
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
          {[{ label: '← prev', fn: () => setWeekMonday(d => addDays(d, -7)) },].map(b => (
            <button key={b.label} onClick={b.fn} style={{ background: 'var(--hb-surface)', border: '1px solid var(--hb-border)',
              color: 'var(--hb-textSub)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
              {b.label}
            </button>
          ))}
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--hb-text)', minWidth: 160, textAlign: 'center' }}>{weekLabel}</span>
          <button onClick={() => setWeekMonday(d => addDays(d, 7))} style={{ background: 'var(--hb-surface)', border: '1px solid var(--hb-border)',
            color: 'var(--hb-textSub)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
            next →
          </button>
          <button onClick={() => { setWeekMonday(getMondayOfWeek(new Date())); const d = new Date().getDay(); setSelectedDayIdx(d===0?6:d-1) }}
            style={{ background: 'rgba(55,138,221,0.12)', border: '1px solid rgba(55,138,221,0.3)',
              color: 'var(--hb-accent)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 11 }}>
            today
          </button>
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
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: done===total && total>0 ? 'var(--hb-green)' : 'var(--hb-textSub)', minWidth: 40 }}>
                  {done}/{total}
                </span>
                {done > 0 && done < total && (
                  <button onClick={() => setChecked(prev => {
                    const next = { ...prev }
                    selectedSession.exercises.forEach(ex => { next[cKey(selectedDayIdx, ex.name)] = false })
                    saveChecked(weekMonday, next); return next
                  })} style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--hb-textSub)',
                    background: 'none', border: '1px solid var(--hb-border)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                    reset
                  </button>
                )}
                {done===total && total>0 && <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-green)' }}>✓ Done!</span>}
              </div>
            )
          })()}
        </div>
        {/* Exercises */}
        {selectedSession.exercises.map(ex => (
          <ExerciseRow key={ex.name} exercise={ex} checked={!!checked[cKey(selectedDayIdx, ex.name)]}
            onToggle={() => toggleExercise(selectedDayIdx, ex.name)} isRest={selectedSession.type === 'REST'}
            note={notes[ex.name] ?? ''} />
        ))}
        {/* Session note */}
        {selectedSession.type !== 'REST' && (
          <div style={{ padding: '10px 14px', background: 'var(--hb-card)', borderTop: '1px solid var(--hb-border)',
            fontFamily: 'monospace', fontSize: 11, color: 'var(--hb-textSub)', lineHeight: 1.7 }}>
            {selectedSession.type === 'A' && <><span style={{ color: 'var(--hb-amber)' }}>Note:</span> Pull-dominant. Lead with face pulls &amp; pull-aparts before any pressing movement.</>}
            {selectedSession.type === 'B' && <><span style={{ color: 'var(--hb-green)' }}>Note:</span> Push-dominant. Always start with external rotation and pull-aparts before pressing.</>}
            {selectedSession.type === 'C' && <><span style={{ color: '#c88cf0' }}>Note:</span> Conditioning focus. Turkish get-up is the anchor — take your time, 3–5 min between sides.</>}
          </div>
        )}
      </div>

      {/* Tempo reference (collapsed) */}
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
