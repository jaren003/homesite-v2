import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AttendeeCirclesStub from '@/components/event/AttendeeCirclesStub'

describe('AttendeeCirclesStub', () => {
  it('renders exactly three circle elements', () => {
    render(<AttendeeCirclesStub />)
    const container = screen.getByTestId('attendee-circles-stub')
    expect(container.children).toHaveLength(3)
  })

  it('each child is a rounded element (circle)', () => {
    render(<AttendeeCirclesStub />)
    const container = screen.getByTestId('attendee-circles-stub')
    for (const child of Array.from(container.children)) {
      expect(child.className).toMatch(/rounded-full/)
    }
  })

  it('carries a TODO marker for future wiring', () => {
    render(<AttendeeCirclesStub />)
    const container = screen.getByTestId('attendee-circles-stub')
    expect(container.getAttribute('data-todo')).toBe('wire-attendee-data')
  })
})
