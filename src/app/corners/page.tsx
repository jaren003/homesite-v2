import Link from 'next/link'

interface Corner {
  id: string             // zero-padded 3-digit corner ID for documentation (e.g. "001")
  href: string | null
  settingsHref: string | null   // null = no settings defined yet → greyed gear
  title: string
  long: string
  description: string
  icon: string
  accent: string
  active: boolean
}

const CORNERS: Corner[] = [
  {
    id: '001',
    href: '/corners/bsc',
    settingsHref: '/corners/bsc/settings',
    title: 'BSC - Backyard Strength & Conditioning',
    long: '',
    description: 'Workout tracker — kettlebell, bands, and bodyweight sessions.',
    icon: '🏋️',
    accent: '#f0c040',
    active: true,
  },
  {
    id: '002',
    href: '/corners/isabella',
    settingsHref: '/corners/isabella/settings',
    title: 'Isabella',
    long: "Isabella's Chores",
    description: 'Weekly chore tracker — check off tasks and earn stars! ⭐',
    icon: '⭐',
    accent: '#FF6B9D',
    active: true,
  },
  {
    id: '003',
    href: null,
    settingsHref: null,
    title: 'Coming soon',
    long: '',
    description: 'Another corner to be built.',
    icon: '✦',
    accent: 'var(--hb-border)',
    active: false,
  },
  {
    id: '004',
    href: null,
    settingsHref: null,
    title: 'Coming soon',
    long: '',
    description: 'Another corner to be built.',
    icon: '✦',
    accent: 'var(--hb-border)',
    active: false,
  },
]

function GearIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function CornersPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--hb-text)' }}>
          Corners
        </h1>
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CORNERS.map((corner, i) => {
          const card = (
            <div
              className="flex flex-col gap-4 rounded-2xl p-6 h-52 border transition-all"
              style={{
                background: corner.active ? 'var(--hb-surface)' : 'var(--hb-bg)',
                borderColor: corner.active ? corner.accent + '55' : 'var(--hb-border)',
                opacity: corner.active ? 1 : 0.5,
                cursor: corner.active ? 'pointer' : 'default',
              }}
            >
              {/* Icon */}
              <div className="text-3xl leading-none"
                   style={{ filter: corner.active ? 'none' : 'grayscale(1)' }}>
                {corner.icon}
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-1 mt-auto">
                <span className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: corner.active ? corner.accent : 'var(--hb-textSub)' }}>
                  {corner.title}
                </span>
                {corner.long && (
                  <span className="text-sm font-semibold leading-tight"
                        style={{ color: 'var(--hb-text)' }}>
                    {corner.long}
                  </span>
                )}
                <span className="text-xs leading-snug"
                      style={{ color: 'var(--hb-textSub)' }}>
                  {corner.description}
                </span>
              </div>

              {/* Active indicator */}
              {corner.active && (
                <div className="absolute bottom-4 right-4 text-xs font-mono"
                     style={{ color: corner.accent }}>
                  → open
                </div>
              )}
            </div>
          )

          return (
            <div key={i} className="relative hover:scale-[1.02] transition-transform">
              {/* Card — links to corner or non-clickable */}
              {corner.href ? (
                <Link href={corner.href} className="block">
                  {card}
                </Link>
              ) : (
                <div>{card}</div>
              )}

              {/* Gear icon — top-right corner of the card */}
              {corner.settingsHref ? (
                <Link
                  href={corner.settingsHref}
                  className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                  title={`${corner.title} settings`}
                  style={{
                    color: 'var(--hb-textSub)',
                    background: 'var(--hb-bg)',
                  }}
                >
                  <GearIcon size={15} />
                </Link>
              ) : (
                <div
                  className="absolute top-3 right-3 flex items-center justify-center w-7 h-7"
                  title="No settings configured"
                  style={{ color: 'var(--hb-muted)', opacity: 0.3, pointerEvents: 'none' }}
                >
                  <GearIcon size={15} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
