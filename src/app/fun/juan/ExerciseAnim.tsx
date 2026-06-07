'use client'
import { useEffect, useState } from 'react'
import { ANIMS } from './anims'

const FRAME_COUNT = 5
const FRAME_MS = 360 // 1800ms ÷ 5 frames

/**
 * Fuzzy ANIMS lookup — handles key mismatches between the auto-generated
 * anims.ts (e.g. "standard / incline") and page.tsx names ("standard/incline").
 * Falls back to prefix match for cases like "KB overhead press" →
 * "KB overhead press (seated / standing)".
 */
function findAnim(name: string): string | undefined {
  if (ANIMS[name]) return ANIMS[name]
  // Normalise spaces around slashes
  const slashNorm = name.replace(/\s*\/\s*/g, ' / ')
  if (ANIMS[slashNorm]) return ANIMS[slashNorm]
  // Prefix match
  const prefixKey = Object.keys(ANIMS).find(k => k.startsWith(name))
  if (prefixKey) return ANIMS[prefixKey]
  return undefined
}

/**
 * 5-frame SVG flipbook animation for a named exercise.
 * Uses JS-driven SVG transform (reliable across browsers) instead of CSS
 * animation on a <g> element. Stops on prefers-reduced-motion.
 */
export function ExerciseAnim({ name }: { name: string }) {
  const svg = findAnim(name)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setFrame(f => (f + 1) % FRAME_COUNT), FRAME_MS)
    return () => clearInterval(id)
  }, [svg])

  if (!svg) return null

  // Shift the flipbook group using SVG's own transform attribute — no CSS
  // transform quirks on <g> elements, works in all browsers.
  const shifted = svg.replace(
    'class="ex-anim-inner"',
    `transform="translate(0, ${-frame * 100})"`
  )

  return (
    <div style={{
      width: 120, height: 100, overflow: 'hidden',
      borderRadius: 4, flexShrink: 0,
      background: 'var(--hb-surface)',
      border: '1px solid var(--hb-border)',
    }} aria-hidden="true">
      <div dangerouslySetInnerHTML={{ __html: shifted }} />
    </div>
  )
}
