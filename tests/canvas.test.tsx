import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Canvas from '../src/renderer/src/components/Canvas'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

const dt = (type: string, value: string) => ({
  dataTransfer: {
    getData: (k: string) => (k === type ? value : ''),
    types: [type],
    dropEffect: '',
    effectAllowed: ''
  }
})

describe('canvas', () => {
  beforeEach(() => useGve.getState().loadFlow(createEmptyFlow('T'), null))

  it('renders blocks and selects on click', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    render(<Canvas />)
    fireEvent.click(screen.getByText('Log Message'))
    expect(useGve.getState().selectedId).toBe(useGve.getState().flow.blocks[0].id)
  })
  it('shows an actionable empty state when no blocks exist', () => {
    render(<Canvas />)
    expect(screen.getByText('Start building your flow')).toBeTruthy()
    expect(
      screen.getByText('Drag a block here, or double-click one in the palette to add it.')
    ).toBeTruthy()
    expect(document.querySelector('.gve-empty-state .gve-dropzone')).toBeTruthy()
  })
  it('clears selection when the canvas background is clicked', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    useGve.getState().select(useGve.getState().flow.blocks[0].id)
    render(<Canvas />)
    fireEvent.click(screen.getByLabelText('Flow canvas'))
    expect(useGve.getState().selectedId).toBeNull()
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
  it('nested block click and drag do not bubble to the container', () => {
    useGve.getState().addBlock('for-each', { parentId: null, index: 0 })
    const loopId = useGve.getState().flow.blocks[0].id
    useGve.getState().addBlock('log-message', { parentId: loopId, index: 0 })
    const logId = useGve.getState().flow.blocks[0].children![0].id
    render(<Canvas />)
    const label = screen.getByText('Log Message')

    fireEvent.click(label)
    expect(useGve.getState().selectedId).toBe(logId)

    const payload: Record<string, string> = {}
    fireEvent.dragStart(label.closest('.gve-block')!, {
      dataTransfer: {
        setData: (type: string, value: string) => {
          payload[type] = value
        },
        effectAllowed: ''
      }
    })
    expect(payload['application/x-gve-move-block']).toBe(logId)
  })
  it('block cards support keyboard selection', () => {
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    render(<Canvas />)
    const card = document.querySelector('.gve-block')!
    expect(card.getAttribute('role')).toBe('button')
    expect(card.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(useGve.getState().selectedId).toBe(id)
  })
})
