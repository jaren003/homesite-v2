import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReminderItem from '@/components/reminders/ReminderItem'
import type { Reminder } from '@/lib/eventkit/types'

const baseReminder: Reminder = {
  id: 'rem-1',
  title: 'Buy milk',
  listId: 'list-1',
  listName: 'Personal',
  listColor: '#FF9500',
  isCompleted: false,
  hasDueTime: false,
  priority: 0,
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-05-25T10:00:00')) })
afterEach(() => { vi.useRealTimers() })

describe('ReminderItem', () => {
  it('renders the reminder title', () => {
    render(<ReminderItem reminder={baseReminder} />)
    expect(screen.getByText('Buy milk')).toBeTruthy()
  })

  it('renders a checkbox that is unchecked by default', () => {
    render(<ReminderItem reminder={baseReminder} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeTruthy()
    expect((checkbox as HTMLInputElement).checked).toBe(false)
  })

  it('calls onComplete with reminder id when checkbox is clicked', () => {
    const onComplete = vi.fn()
    render(<ReminderItem reminder={baseReminder} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onComplete).toHaveBeenCalledWith('rem-1')
  })

  it('shows "Today" label for reminders due today', () => {
    render(<ReminderItem reminder={{ ...baseReminder, dueDate: '2026-05-25' }} />)
    expect(screen.getByText('Today')).toBeTruthy()
  })

  it('shows red label for overdue reminders', () => {
    render(<ReminderItem reminder={{ ...baseReminder, dueDate: '2026-05-20' }} />)
    // "5 days ago" label should be present with red styling
    expect(screen.getByText(/days ago/)).toBeTruthy()
  })

  it('shows high priority indicator when priority=1', () => {
    const { container } = render(<ReminderItem reminder={{ ...baseReminder, priority: 1 }} />)
    // A red dot indicator for high priority
    const indicator = container.querySelector('[aria-label="High priority"]')
    expect(indicator).toBeTruthy()
  })

  it('does not show priority indicator when priority=0', () => {
    const { container } = render(<ReminderItem reminder={baseReminder} />)
    expect(container.querySelector('[aria-label="High priority"]')).toBeNull()
  })

  it('renders strikethrough title when completed', () => {
    const { container } = render(
      <ReminderItem reminder={{ ...baseReminder, isCompleted: true }} />,
    )
    const title = container.querySelector('.line-through')
    expect(title).toBeTruthy()
  })

  it('shows the list name', () => {
    render(<ReminderItem reminder={baseReminder} />)
    expect(screen.getByText('Personal')).toBeTruthy()
  })
})
