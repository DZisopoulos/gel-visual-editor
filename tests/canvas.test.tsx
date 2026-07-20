import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Canvas from '../src/renderer/src/components/Canvas'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

const dt = (type: string, value: string) => ({
  dataTransfer: { getData: (k: string) => (k === type ? value : ''), types: [type], dropEffect: '', effectAllowed: '' }
})

describe('canvas', () => {
  beforeEach(() => useGve.getState().loadFlow(createEmptyFlow('T'), null))

  it('renders blocks and selects on click', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    render(<Canvas />)
    fireEvent.click(screen.getByText('Log Message'))
    expect(useGve.getState().selectedId).toBe(useGve.getState().flow.blocks[0].id)
  })
  it('drop of a palette item inserts at the zone index', () => {
    render(<Canvas />)
    const zones = document.querySelectorAll('.gve-dropzone')
    fireEvent.drop(zones[0], dt('application/x-gve-new-block', 'sql-query'))
    expect(useGve.getState().flow.blocks[0].type).toBe('sql-query')
  })
  it('container renders a nested drop zone that inserts into children', () => {
    useGve.getState().addBlock('for-each', { parentId: null, index: 0 })
    render(<Canvas />)
    const nested = document.querySelector('.gve-nest .gve-dropzone')!
    fireEvent.drop(nested, dt('application/x-gve-new-block', 'log-message'))
    expect(useGve.getState().flow.blocks[0].children![0].type).toBe('log-message')
  })
})
