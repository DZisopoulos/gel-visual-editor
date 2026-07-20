import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Palette from '../src/renderer/src/components/Palette'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('palette', () => {
  it('lists all phase-1 blocks and inserts on double-click', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    render(<Palette />)
    for (const name of ['Set Variable', 'SQL Query', 'For Each', 'Log Message', 'Raw GEL']) {
      expect(screen.getByText(name)).toBeTruthy()
    }
    fireEvent.doubleClick(screen.getByText('Log Message'))
    expect(useGve.getState().flow.blocks).toHaveLength(1)
    expect(useGve.getState().flow.blocks[0].type).toBe('log-message')
  })
})
