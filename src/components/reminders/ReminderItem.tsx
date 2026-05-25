'use client'

import { formatRelativeDate, isOverdue, isDueToday } from '@/lib/utils/date'
import type { Reminder } from '@/lib/eventkit/types'

interface Props {
  reminder: Reminder
  onComplete?: (id: string) => void
}

export default function ReminderItem({ reminder, onComplete }: Props) {
  const { id, title, listName, listColor, isCompleted, dueDate, priority } = reminder

  const dueDateLabel = dueDate ? formatRelativeDate(dueDate) : null
  const overdue  = dueDate ? isOverdue(dueDate) : false
  const dueToday = dueDate ? isDueToday(dueDate) : false

  const dueLabelColor = overdue
    ? 'text-hb-coral font-semibold'
    : dueToday
    ? 'text-hb-amber font-semibold'
    : 'text-hb-textSub'

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-hb-card border border-hb-border">
      {/* Checkbox */}
      <input
        type="checkbox"
        aria-label={`Complete: ${title}`}
        checked={isCompleted}
        onChange={() => onComplete?.(id)}
        className="mt-0.5 w-4 h-4 rounded-full border-2 border-hb-muted shrink-0 cursor-pointer accent-hb-accent"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm text-hb-text leading-snug ${isCompleted ? 'line-through opacity-50' : ''}`}>
          {title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {dueDateLabel && (
            <span className={`text-[10px] font-mono ${dueLabelColor}`}>
              {overdue && '⚠ '}{dueDateLabel}
            </span>
          )}
          <span
            className="text-[10px] font-mono text-hb-muted truncate"
            style={{ color: listColor }}
          >
            {listName}
          </span>
        </div>
      </div>

      {/* High priority indicator */}
      {priority === 1 && (
        <span
          aria-label="High priority"
          className="mt-1 w-1.5 h-1.5 rounded-full bg-hb-coral shrink-0"
        />
      )}
    </div>
  )
}
