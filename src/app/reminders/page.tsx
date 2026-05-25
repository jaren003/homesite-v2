// Reminders page — server component, fetches reminder lists + all incomplete reminders
import { getReminders, getReminderLists } from '@/lib/eventkit/client'
import RemindersPageClient from '@/components/reminders/RemindersPageClient'

export default async function RemindersPage() {
  const [remindersResult, listsResult] = await Promise.allSettled([
    getReminders({ completed: 'false' }),
    getReminderLists(),
  ])

  const reminders     = remindersResult.status === 'fulfilled' ? remindersResult.value : []
  const reminderLists = listsResult.status === 'fulfilled'     ? listsResult.value     : []
  const bridgeError   = remindersResult.status === 'rejected'  || listsResult.status === 'rejected'

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--hb-text)' }}>
        Reminders
      </h1>

      {bridgeError && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--hb-coral)', color: '#fff' }}>
          ⚠ EventKit bridge unavailable. Build it:{' '}
          <code className="font-mono text-xs">./scripts/eventkit-bridge/build.sh</code>
        </div>
      )}

      <RemindersPageClient
        initialReminders={reminders}
        reminderLists={reminderLists}
      />
    </div>
  )
}
