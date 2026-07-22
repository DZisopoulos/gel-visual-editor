import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Palette from '../src/renderer/src/components/Palette'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('palette', () => {
  it('lists the complete block palette and inserts on double-click', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)
    for (const name of [
      'Set Variable',
      'SQL Query',
      'For Each',
      'Log Message',
      'Raw GEL',
      'Choose',
      'When',
      'Otherwise',
      'Switch',
      'Case',
      'Default',
      'Try',
      'Catch',
      'Comment',
      'Send Email',
      'XOG Read',
      'XOG Write',
      'SOAP Invoke',
      'HTTP Call',
      'File Read',
      'File Write',
      'FTP Transfer',
      'Include Script'
    ]) {
      expect(screen.getByText(name)).toBeTruthy()
    }
    fireEvent.doubleClick(screen.getByText('Log Message'))
    expect(useGve.getState().flow.blocks).toHaveLength(1)
    expect(useGve.getState().flow.blocks[0].type).toBe('log-message')
  })
  it('supports keyboard insertion from focusable palette rows', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)
    const log = screen.getByRole('button', { name: 'Log Message' })
    // Native <button> elements are focusable/keyboard-operable without an
    // explicit tabindex attribute (unlike the old role="button" div).
    expect(log.tagName).toBe('BUTTON')
    // jsdom doesn't simulate a real browser's default action of firing a
    // `click` when Enter/Space is pressed on a focused button, so fire the
    // resulting click directly. A keyboard-triggered click reports
    // `detail === 0` (same as jsdom's default synthetic MouseEvent here),
    // which is exactly the path Palette's onClick handler expects.
    fireEvent.click(log)
    expect(useGve.getState().flow.blocks[0].type).toBe('log-message')
  })

  it('filters blocks and expands matching categories while searching', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)
    fireEvent.change(screen.getByLabelText('Search blocks'), { target: { value: 'xog' } })

    expect(screen.getByText('XOG Read')).toBeTruthy()
    expect(screen.getByText('XOG Write')).toBeTruthy()
    expect(screen.queryByText('Set Variable')).toBeNull()
  })

  it('collapses and reopens a category', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)
    const core = screen.getByRole('button', { name: /core/i })
    expect(core.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(core)
    expect(core.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Set Variable')).toBeNull()
    fireEvent.click(core)
    expect(screen.getByText('Set Variable')).toBeTruthy()
  })

  it('collapses and expands all categories', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)

    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(screen.queryByText('Set Variable')).toBeNull()
    expect(screen.queryByText('SQL Query')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getByText('Set Variable')).toBeTruthy()
    expect(screen.getByText('SQL Query')).toBeTruthy()
  })
})
