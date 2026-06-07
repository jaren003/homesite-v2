'use client'

export type MuscleReg = Partial<Record<
  | 'shoulders' | 'chest' | 'abs' | 'obliques' | 'biceps' | 'triceps_f' | 'hip_flexors' | 'quads'
  | 'traps' | 'lats' | 'rhomboids' | 'rear_delt' | 'lower_back' | 'triceps' | 'glutes' | 'hamstrings' | 'calves',
  'p' | 's'
>>

const PRI = '#e03030'
const SEC = '#e8c040'
const SK  = '#2a3028'
const SKL = '#323b2f'
const BN  = 'rgba(255,255,255,.06)'

const fill = (id: string, reg: MuscleReg) =>
  reg[id as keyof MuscleReg] === 'p' ? PRI : reg[id as keyof MuscleReg] === 's' ? SEC : SK

const op = (id: string, reg: MuscleReg) =>
  reg[id as keyof MuscleReg] ? 1 : 0.42

function FrontView({ reg }: { reg: MuscleReg }) {
  const f = (id: string) => fill(id, reg)
  const o = (id: string) => op(id, reg)
  return (
    <svg width="80" height="150" viewBox="0 0 80 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head / neck */}
      <ellipse cx="40" cy="14" rx="11" ry="12" fill={SKL} opacity={0.55}/>
      <rect x="35" y="25" width="10" height="10" rx="3" fill={SKL} opacity={0.45}/>
      {/* Shoulders */}
      <ellipse cx="17" cy="41" rx="9" ry="8" fill={f('shoulders')} opacity={o('shoulders')}/>
      <ellipse cx="63" cy="41" rx="9" ry="8" fill={f('shoulders')} opacity={o('shoulders')}/>
      {/* Chest */}
      <rect x="25" y="37" width="30" height="20" rx="6" fill={f('chest')} opacity={o('chest')}/>
      <line x1="40" y1="39" x2="40" y2="54" stroke={BN} strokeWidth="1"/>
      {/* Abs */}
      <rect x="27" y="57" width="26" height="20" rx="4" fill={f('abs')} opacity={o('abs')}/>
      <line x1="40" y1="59" x2="40" y2="76" stroke={BN} strokeWidth="1"/>
      <line x1="28" y1="65" x2="52" y2="65" stroke={BN} strokeWidth="1"/>
      <line x1="28" y1="71" x2="52" y2="71" stroke={BN} strokeWidth="1"/>
      {/* Obliques */}
      <ellipse cx="19" cy="62" rx="7" ry="12" fill={f('obliques')} opacity={o('obliques')}/>
      <ellipse cx="61" cy="62" rx="7" ry="12" fill={f('obliques')} opacity={o('obliques')}/>
      {/* Biceps */}
      <rect x="8" y="49" width="9" height="20" rx="4" fill={f('biceps')} opacity={o('biceps')}/>
      <rect x="63" y="49" width="9" height="20" rx="4" fill={f('biceps')} opacity={o('biceps')}/>
      {/* Triceps (front) */}
      <rect x="8" y="49" width="8" height="18" rx="4" fill={f('triceps_f')} opacity={o('triceps_f')}/>
      <rect x="64" y="49" width="8" height="18" rx="4" fill={f('triceps_f')} opacity={o('triceps_f')}/>
      {/* Forearms */}
      <rect x="9" y="69" width="7" height="15" rx="3" fill={SKL} opacity={0.4}/>
      <rect x="64" y="69" width="7" height="15" rx="3" fill={SKL} opacity={0.4}/>
      {/* Hip flexors */}
      <rect x="25" y="76" width="30" height="14" rx="5" fill={f('hip_flexors')} opacity={o('hip_flexors')}/>
      {/* Quads */}
      <rect x="25" y="89" width="13" height="34" rx="5" fill={f('quads')} opacity={o('quads')}/>
      <rect x="42" y="89" width="13" height="34" rx="5" fill={f('quads')} opacity={o('quads')}/>
      <line x1="38" y1="90" x2="38" y2="122" stroke={BN} strokeWidth="1"/>
      <line x1="42" y1="90" x2="42" y2="122" stroke={BN} strokeWidth="1"/>
      {/* Knees / shins */}
      <ellipse cx="32" cy="124" rx="6" ry="4" fill={SKL} opacity={0.3}/>
      <ellipse cx="48" cy="124" rx="6" ry="4" fill={SKL} opacity={0.3}/>
      <rect x="26" y="128" width="11" height="16" rx="4" fill={SKL} opacity={0.28}/>
      <rect x="43" y="128" width="11" height="16" rx="4" fill={SKL} opacity={0.28}/>
    </svg>
  )
}

function BackView({ reg }: { reg: MuscleReg }) {
  const f = (id: string) => fill(id, reg)
  const o = (id: string) => op(id, reg)
  return (
    <svg width="80" height="150" viewBox="0 0 80 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head / neck */}
      <ellipse cx="40" cy="14" rx="11" ry="12" fill={SKL} opacity={0.55}/>
      <rect x="35" y="25" width="10" height="10" rx="3" fill={SKL} opacity={0.45}/>
      {/* Traps */}
      <ellipse cx="40" cy="34" rx="17" ry="7" fill={f('traps')} opacity={o('traps')}/>
      {/* Lats */}
      <path d="M25 37 Q17 52 19 64 L25 78 L55 78 L61 64 Q63 52 55 37 Z" fill={f('lats')} opacity={o('lats')}/>
      {/* Rhomboids */}
      <rect x="30" y="41" width="20" height="20" rx="3" fill={f('rhomboids')} opacity={o('rhomboids')}/>
      {/* Rear delts */}
      <ellipse cx="17" cy="41" rx="9" ry="8" fill={f('rear_delt')} opacity={o('rear_delt')}/>
      <ellipse cx="63" cy="41" rx="9" ry="8" fill={f('rear_delt')} opacity={o('rear_delt')}/>
      {/* Lower back */}
      <rect x="31" y="61" width="18" height="17" rx="3" fill={f('lower_back')} opacity={o('lower_back')}/>
      {/* Triceps */}
      <rect x="8" y="49" width="9" height="22" rx="4" fill={f('triceps')} opacity={o('triceps')}/>
      <rect x="63" y="49" width="9" height="22" rx="4" fill={f('triceps')} opacity={o('triceps')}/>
      {/* Forearms */}
      <rect x="9" y="71" width="7" height="14" rx="3" fill={SKL} opacity={0.4}/>
      <rect x="64" y="71" width="7" height="14" rx="3" fill={SKL} opacity={0.4}/>
      {/* Glutes */}
      <ellipse cx="33" cy="85" rx="11" ry="11" fill={f('glutes')} opacity={o('glutes')}/>
      <ellipse cx="47" cy="85" rx="11" ry="11" fill={f('glutes')} opacity={o('glutes')}/>
      {/* Hamstrings */}
      <rect x="24" y="92" width="13" height="32" rx="5" fill={f('hamstrings')} opacity={o('hamstrings')}/>
      <rect x="43" y="92" width="13" height="32" rx="5" fill={f('hamstrings')} opacity={o('hamstrings')}/>
      {/* Calves */}
      <rect x="25" y="125" width="11" height="18" rx="4" fill={f('calves')} opacity={o('calves')}/>
      <rect x="44" y="125" width="11" height="18" rx="4" fill={f('calves')} opacity={o('calves')}/>
    </svg>
  )
}

export default function MuscleSVG({ view, reg }: { view: 'front' | 'back' | 'both'; reg: MuscleReg }) {
  if (view === 'front') return <FrontView reg={reg} />
  if (view === 'back')  return <BackView  reg={reg} />
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <FrontView reg={reg} />
      <BackView  reg={reg} />
    </div>
  )
}
