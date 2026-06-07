'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function GearIcon({ size = 18 }: { size?: number }) {
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

export default function NavBar({ chatUrl }: { chatUrl: string }) {
  const pathname = usePathname()

  const NAV_LINKS = [
    { href: '/calendar',  label: 'Calendar',  external: false },
    { href: '/reminders', label: 'Reminders', external: false },
    { href: chatUrl,      label: 'Chat',       external: true  },
    { href: '/corners',   label: 'Corners',   external: false },
    { href: '/guide',     label: 'Guide',     external: false },
  ]

  return (
    <nav
      style={{ borderBottom: '1px solid var(--hb-border)', background: 'var(--hb-surface)' }}
      className="flex items-center gap-0 px-6"
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-sm font-semibold mr-6 py-4"
        style={{ color: 'var(--hb-text)', flexShrink: 0 }}
      >
        Homesite
      </Link>

      {/* Primary tabs */}
      {NAV_LINKS.map(({ href, label, external }) => {
        const active = !external && (pathname === href || pathname.startsWith(href + '/'))
        return (
          <Link
            key={label}
            href={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 4px',
              height: 52,
              marginRight: 24,
              fontSize: 14,
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--hb-text)' : 'var(--hb-textSub)',
              borderBottom: active
                ? '2px solid var(--hb-accent)'
                : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Link>
        )
      })}

      {/* Global settings gear — right-aligned, disabled until settings are built */}
      <button
        disabled
        title="Settings (coming soon)"
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 52,
          width: 36,
          background: 'none',
          border: 'none',
          cursor: 'default',
          color: 'var(--hb-muted)',
          opacity: 0.4,
          flexShrink: 0,
        }}
      >
        <GearIcon size={18} />
      </button>
    </nav>
  )
}
