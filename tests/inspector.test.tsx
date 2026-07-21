import { describe, it, expect, beforeEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import Inspector from '../src/renderer/src/components/Inspector'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('inspector', () => {
  beforeEach(() => useGve.getState().loadFlow(createEmptyFlow('T'), null))

  it('edits selected block fields from the registry', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    render(<Inspector />)
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'hello' } })
    expect(useGve.getState().flow.blocks[0].props.message).toBe('hello')

    const level = screen.getByLabelText('Level') as HTMLSelectElement
    expect(Array.from(level.options, option => option.value)).toEqual(['INFO', 'WARN', 'ERROR', 'DEBUG'])
  })

  it('shows and edits the SQL Query escape text dropdown', () => {
    useGve.getState().addBlock('sql-query', { parentId: null, index: 0 })
    render(<Inspector />)

    const escapeText = screen.getByLabelText('Escape text') as HTMLSelectElement
    expect(Array.from(escapeText.options, option => option.value)).toEqual(['false', 'true'])
    expect(escapeText.value).toBe('false')

    fireEvent.change(escapeText, { target: { value: 'true' } })
    expect(useGve.getState().flow.blocks[0].props.escapeText).toBe('true')
  })

  it('keeps the flow name in sync with the store while typing', () => {
    render(<Inspector />)
    const name = screen.getByLabelText('Flow settings name') as HTMLInputElement
    expect(name.value).toBe('T')

    fireEvent.change(name, { target: { value: 'Renamed' } })
    expect(useGve.getState().flow.meta.name).toBe('Renamed')

    // A rename from elsewhere (undo, file open, the header field) must show here.
    act(() => { useGve.getState().loadFlow(createEmptyFlow('From disk'), null) })
    expect((screen.getByLabelText('Flow settings name') as HTMLInputElement).value).toBe('From disk')
  })

  it('adds a flow parameter when nothing is selected', () => {
    render(<Inspector />)
    fireEvent.click(screen.getByRole('button', { name: 'Add parameter' }))
    expect(useGve.getState().flow.parameters).toHaveLength(1)
  })
})
