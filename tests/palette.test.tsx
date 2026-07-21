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
      'Set Variable', 'SQL Query', 'For Each', 'Log Message', 'Raw GEL',
      'Choose', 'When', 'Otherwise', 'Switch', 'Case', 'Default', 'Try', 'Catch', 'Comment',
      'Send Email', 'XOG Read', 'XOG Write', 'SOAP Invoke', 'HTTP Call', 'File Read', 'File Write',
      'FTP Transfer', 'Include Script'
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
    expect(log.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(log, { key: 'Enter' })
    expect(useGve.getState().flow.blocks[0].type).toBe('log-message')
  })
})
