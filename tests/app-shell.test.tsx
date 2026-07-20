import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/renderer/src/App'

describe('app shell', () => {
  it('renders the four regions and the flow name', () => {
    render(<App />)
    expect(document.querySelector('.gve-header')).toBeTruthy()
    expect(document.querySelector('.gve-palette')).toBeTruthy()
    expect(document.querySelector('.gve-canvas')).toBeTruthy()
    expect(document.querySelector('.gve-inspector')).toBeTruthy()
    expect(document.querySelector('.gve-xmlpane')).toBeTruthy()
    expect(screen.getByDisplayValue(/Untitled Flow|Test/)).toBeTruthy()
  })
})
