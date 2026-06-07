// /guide — User & Admin help page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Guide · Homesite',
  description: 'How to use Homesite — user and admin reference',
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-semibold" style={{ color: 'var(--hb-text)' }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-col gap-2"
      style={{ background: 'var(--hb-card)', border: '1px solid var(--hb-border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--hb-text)' }}>
          {title}
        </h3>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--hb-textSub)' }}>
        {children}
      </div>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <code
      className="block font-mono text-xs rounded-lg px-4 py-3 mt-1 overflow-x-auto"
      style={{ background: 'var(--hb-surface)', color: 'var(--hb-accent)', border: '1px solid var(--hb-border)' }}
    >
      {children}
    </code>
  )
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block text-xs font-mono rounded px-2 py-0.5 mr-1"
      style={{ background: color + '22', color }}
    >
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--hb-text)' }}>
          Homesite Guide
        </h1>
        <p className="text-sm" style={{ color: 'var(--hb-textSub)' }}>
          Everything you need to use and manage the family dashboard.
        </p>
      </div>

      {/* ── Tab switcher ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-8 md:items-start">

        {/* ── USER GUIDE ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div
            className="rounded-xl px-4 py-2 inline-flex items-center gap-2 self-start"
            style={{ background: 'var(--hb-accentDim)', color: 'var(--hb-accent)' }}
          >
            <span>👥</span>
            <span className="text-xs font-semibold uppercase tracking-wider">User Guide</span>
          </div>

          <Section title="Dashboard">
            <Card icon="🏠" title="Today at a glance">
              The home screen shows two panels: <strong>Today&apos;s Events</strong> pulled from
              your Mac calendar, and <strong>Due Today &amp; Overdue</strong> reminders from the
              Reminders app. Everything refreshes when you reload the page.
            </Card>
            <Card icon="⚠️" title="Bridge unavailable banner">
              If you see an orange warning at the top, the EventKit bridge isn&apos;t running.
              Ask your admin to rebuild it — see the Admin section below.
            </Card>
          </Section>

          <Section title="Calendar">
            <Card icon="📅" title="Week view">
              Click <strong>Calendar</strong> in the top nav to see the current week —
              Sunday through Saturday. Each event card leads with the event name so you
              can scan what&apos;s happening at a glance; the time appears below it in smaller
              text. All-day events appear at the top of each day column.
            </Card>
            <Card icon="◀ ▶" title="Moving between weeks">
              Use the <strong>‹</strong> and <strong>›</strong> buttons to step backward or
              forward one week at a time. Hit <strong>Today</strong> to snap back to the
              current week from anywhere.
            </Card>
            <Card icon="🎨" title="Filter by calendar">
              Use the sidebar on the left to show or hide events from specific calendars.
              Each calendar is color-coded to match your Mac Calendar app.
            </Card>
            <Card icon="📋" title="Day detail">
              Click any day cell to open the full day view — all events with times, locations,
              and notes. Days with more than 4 events show a &ldquo;+N more&rdquo; link that
              takes you to the full day detail.
            </Card>
          </Section>

          <Section title="Reminders">
            <Card icon="✅" title="All active reminders">
              The <strong>Reminders</strong> page lists every incomplete reminder from all your
              reminder lists. Overdue items appear first in red, due-today in amber.
            </Card>
            <Card icon="☑️" title="Completing a reminder">
              Tap the circle next to any reminder to mark it complete. The item disappears from
              the list immediately and is updated in the Reminders app on your Mac.
            </Card>
          </Section>
        </div>

        {/* ── ADMIN GUIDE ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <div
            className="rounded-xl px-4 py-2 inline-flex items-center gap-2 self-start"
            style={{ background: '#4CAF7D22', color: 'var(--hb-green)' }}
          >
            <span>🔧</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Admin Guide</span>
          </div>

          <Section title="EventKit Bridge">
            <Card icon="🔌" title="What the bridge does">
              Homesite can&apos;t read macOS Calendar &amp; Reminders directly from Node.js.
              A small Swift binary (<code className="font-mono text-xs">eventkit-bridge</code>)
              runs as a local HTTP server on port <strong>2999</strong> and proxies EventKit
              data to the Next.js app.
            </Card>
            <Card icon="🔨" title="Build the bridge">
              Run this once after cloning, and again whenever you update the bridge source:
              <Code>./scripts/eventkit-bridge/build.sh</Code>
            </Card>
            <Card icon="▶️" title="How the bridge runs">
              You don&apos;t start the bridge manually — the Next.js server spawns it
              automatically on each request. Just run <code className="font-mono text-xs">npm run dev</code> and
              the bridge is invoked in the background whenever a page loads.
            </Card>
            <Card icon="🔑" title="Grant macOS permissions (first time only)">
              On first use, macOS must grant Calendar &amp; Reminders access. Run this once to
              trigger the permission prompt:
              <Code>./scripts/eventkit-bridge/eventkit-bridge calendars</Code>
              Accept both prompts in System Settings. After that, <code className="font-mono text-xs">npm run dev</code> is
              all you need.
            </Card>
            <Card icon="🔁" title="Rebuild after macOS update">
              If the bridge errors after a macOS update, rebuild it — the EventKit API
              sometimes changes between OS versions:
              <Code>./scripts/eventkit-bridge/build.sh</Code>
            </Card>
          </Section>

          <Section title="Dev Server">
            <Card icon="🚀" title="Starting Homesite">
              From the project folder, run:
              <Code>npm run dev</Code>
              The site is then available at{' '}
              <span className="font-mono text-xs" style={{ color: 'var(--hb-accent)' }}>
                http://localhost:3000
              </span>
              . For other devices on the local network use the Mac&apos;s IP address instead.
            </Card>
            <Card icon="📦" title="After pulling updates">
              If dependencies changed, run <code className="font-mono text-xs">npm install</code>{' '}
              before starting the dev server.
            </Card>
          </Section>

          <Section title="Tech Stack">
            <Card icon="🗂️" title="How the project is structured">
              <Pill label="Next.js 15" color="var(--hb-accent)" />
              App Router — pages live under <code className="font-mono text-xs">src/app/</code>.
              <br />
              <Pill label="Swift bridge" color="var(--hb-green)" />
              Native EventKit access in <code className="font-mono text-xs">scripts/eventkit-bridge/</code>.
              <br />
              <Pill label="Tailwind + CSS vars" color="var(--hb-amber)" />
              Design tokens defined in <code className="font-mono text-xs">src/app/globals.css</code>.
            </Card>
          </Section>
        </div>
      </div>
    </div>
  )
}
