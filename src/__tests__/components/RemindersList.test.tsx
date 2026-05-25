import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RemindersList from '@/components/reminders/RemindersList'
import type { Reminder } from '@/lib/eventkit/types'

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-05-25T10:00:00')) })
afterEach(() => { vi.useRealTimers() })

const overdue: Reminder = {
  id: 'r1', title: 'Overdue task', listId: 'l1', listName: 'Work',
  listColor: '#007AFF', isCompleted: false, dueDate: '2026-05-20',
  hasDueTime: false, priority: 0,
}
const dueToday: Reminder = {
  id: 'r2', title: 'Today task', listId: 'l1', listName: 'Work',
  listColor: '#007AFF', isCompleted: false, dueDate: '2026-05-25',
  hasDueTime: false, priority: 0,
}
const upcoming: Reminder = {
  id: 'r3', title: 'Future task', listId: 'l2', listName: 'Personal',
  listColor: '#FF9500', isCompleted: false, dueDate: '2026-06-10',
  hasDueTime: false, priority: 0,
}
const noDate: Reminder = {
  id: 'r4', title: 'Undated task', listId: 'l2', listName: 'Personal',
  listColor: '#FF9500', isCompleted: false, hasDueTime: false, priority: 0,
}
const completed: Reminder = {
  id: 'r5', title: 'Done task', listId: 'l1', listName: 'Work',
  listColor: '#007AFF', isCompleted: true, completionDate: '2026-05-24T09:00:00',
  hasDueTime: false, priority: 0,
}

describe('RemindersList', () => {
  it('renders all incomplete reminders', () => {
    render(<RemindersList reminders={[overdue, dueToday, upcoming, noDate]} />)
    expect(screen.getByText('Overdue task')).toBeTruthy()
    expect(screen.getByText('Today task')).toBeTruthy()
    expect(screen.getByText('Future task')).toBeTruthy()
    expect(screen.getByText('Undated task')).toBeTruthy()
  })

  it('places overdue items before due-today items', () => {
    render(<RemindersList reminders={[dueToday, overdue]} />)
    const items = screen.getAllByRole('checkbox')
    // overdue should come first — its row appears earlier in the DOM
    const allText = screen.getAllByText(/task/)
    const overdueIdx = allText.findIndex(el => el.textContent === 'Overdue task')
    const todayIdx   = allText.findIndex(el => el.textContent === 'Today task')
    expect(overdueIdx).toBeLessThan(todayIdx)
  })

  it('shows Completed section collapsed by default', () => {
    render(<RemindersList reminders={[completed]} />)
    expect(screen.getByText(/Completed/i)).toBeTruthy()
    // Content of completed section should not be visible by default
    expect(screen.queryByText('Done task')).toBeNull()
  })

  it('expands Completed section on click', () => {
    render(<RemindersList reminders={[completed]} />)
    fireEvent.click(screen.getByText(/Completed/i))
    expect(screen.getByText('Done task')).toBeTruthy()
  })

  it('calls onComplete when a checkbox is clicked', () => {
    const onComplete = vi.fn()
    render(<RemindersList reminders={[overdue]} onComplete={onComplete} />)
    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onComplete).toHaveBeenCalledWith('r1')
  })

  it('filters reminders by search query', () => {
    render(<RemindersList reminders={[overdue, upcoming]} />)
    const input = screen.getByPlaceholderText(/filter/i)
    fireEvent.change(input, { target: { value: 'future' } })
    expect(screen.getByText('Future task')).toBeTruthy()
    expect(screen.queryByText('Overdue task')).toBeNull()
  })

  it('shows empty state when no reminders match filter', () => {
    render(<RemindersList reminders={[overdue]} />)
    fireEvent.change(screen.getByPlaceholderText(/filter/i), { target: { value: 'zzz' } })
    expect(screen.getByText(/no reminders/i)).toBeTruthy()
  })
})
