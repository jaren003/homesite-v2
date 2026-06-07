// ── BSC exercise library ──────────────────────────────────────────────────────
// Single source of truth for all exercise definitions.

import type { Exercise } from './types'

export const EX: Record<string, Exercise> = {
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

// ── Full exercise library grouped by muscle for the Library panel ─────────────

export const LIBRARY_GROUPS = [
  { group: 'Chest',          exercises: ['Push-up (standard/incline)','KB bench press','Band chest press (anchored)','Decline push-up','Band chest fly'] },
  { group: 'Back',           exercises: ['KB single-arm row','Band pull-apart','Band face pull','Band seated row','Chest-supported KB row','Band lat pulldown'] },
  { group: 'Shoulders',      exercises: ['KB overhead press','Band external rotation','KB lateral raise','Band overhead press (bilateral)','Pike push-up'] },
  { group: 'Arms',           exercises: ['Band bicep curl','KB curl (alternating)','Tricep dip (bench)','Band tricep pushdown','KB overhead tricep extension'] },
  { group: 'Glutes & Hams',  exercises: ['KB swing (two-hand)','KB Romanian deadlift','Hip thrust (bench)','Single-leg KB RDL','Band pull-through','Band hip abduction'] },
  { group: 'Quads',          exercises: ['KB goblet squat','Reverse lunge (KB)','Bulgarian split squat','Band squat','Step-up (bench)'] },
  { group: 'Core',           exercises: ['Dead bug','Plank (standard/RKC)','Band Pallof press','KB suitcase carry','Bird dog','Bench leg raise'] },
  { group: 'Full Body',      exercises: ['KB Turkish get-up','KB clean (single arm)','KB swing + squat complex','Push-up → band row superset',"KB farmer's carry"] },
]
