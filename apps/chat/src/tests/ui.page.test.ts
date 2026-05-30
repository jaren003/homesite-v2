// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Page from '../routes/+page.svelte'

describe('+page.svelte', () => {
  it('renders a text input for the prompt', () => {
    render(Page)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders a send button', () => {
    render(Page)
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('renders the message list container', () => {
    render(Page)
    expect(screen.getByRole('log')).toBeInTheDocument()
  })
})
