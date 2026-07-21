import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../src/renderer/src/App'

describe('app shell', () => {
  it('renders the shell with flow and XML preview tabs', () => {
    render(<App />)
    expect(document.querySelector('.gve-header')).toBeTruthy()
    expect(document.querySelector('.gve-brand')).toBeNull()
    expect(document.querySelector('.gve-titlebar-brand')).toBeTruthy()
    expect(document.querySelector('.gve-footer')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Minimize' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Maximize' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy()
    expect(document.querySelector('.gve-palette')).toBeTruthy()
    expect(document.querySelector('.gve-canvas')).toBeTruthy()
    expect(document.querySelector('.gve-inspector')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Flow' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'XML Preview' }).getAttribute('aria-selected')).toBe('false')
    expect(document.querySelector('.gve-xmlpane')).toBeNull()
    expect(screen.getByDisplayValue(/Untitled Flow|Test/)).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'XML Preview' }))
    expect(document.querySelector('.gve-canvas')).toBeNull()
    expect(document.querySelector('.gve-xmlpane')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'XML Preview' }).getAttribute('aria-selected')).toBe('true')
  })
})
