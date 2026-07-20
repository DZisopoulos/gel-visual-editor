import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import XmlPreview from '../src/renderer/src/components/XmlPreview'
import { useGve } from '../src/renderer/src/store'
import { createEmptyFlow } from '../src/shared/flow'

describe('xml preview', () => {
  it('renders generated GEL in the plain pre fallback', () => {
    useGve.getState().loadFlow(createEmptyFlow('T'), null)
    useGve.getState().addBlock('log-message', { parentId: null, index: 0 })
    const id = useGve.getState().flow.blocks[0].id
    useGve.getState().updateProps(id, { message: 'hello-preview' })
    render(<XmlPreview />)
    const preview = document.querySelector('.gve-xml')
    expect(preview?.textContent).toContain('<gel:log')
    expect(preview?.textContent).toContain('hello-preview')
  })
})
