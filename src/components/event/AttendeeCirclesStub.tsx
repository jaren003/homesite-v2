/**
 * Stub placeholder for event attendee/user circles.
 * TODO: wire-attendee-data — replace with real user data once
 * the user model and EventKit attendee bridge are defined.
 */
export default function AttendeeCirclesStub() {
  return (
    <div
      data-testid="attendee-circles-stub"
      data-todo="wire-attendee-data"
      className="flex items-center"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-6 h-6 rounded-full border-2"
          style={{
            background: 'var(--hb-muted)',
            borderColor: 'var(--hb-card)',
            marginLeft: i > 0 ? '-6px' : '0',
          }}
        />
      ))}
    </div>
  )
}
