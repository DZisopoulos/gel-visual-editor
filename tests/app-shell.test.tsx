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
    expect(screen.getByRole('separator', { name: 'Resize block palette' })).toBeTruthy()
    expect(screen.getByRole('separator', { name: 'Resize inspector' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Flow' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'XML Preview' }).getAttribute('aria-selected')).toBe(
      'false'
    )
    expect(document.querySelector('.gve-xmlpane')).toBeNull()
    expect(screen.getByDisplayValue(/Untitled Flow|Test/)).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'XML Preview' }))
    expect(document.querySelector('.gve-canvas')).toBeNull()
    expect(document.querySelector('.gve-xmlpane')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'XML Preview' }).getAttribute('aria-selected')).toBe(
      'true'
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Validate' }))
    expect(screen.getByRole('tab', { name: 'Validate' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('region', { name: 'Validation view' })).toBeTruthy()
  })

  it('opens the About dialog from the application menu', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    fireEvent.click(screen.getByRole('button', { name: 'About GVE' }))
    expect(screen.getByRole('dialog', { name: 'GEL Visual Editor' })).toBeTruthy()
    expect(screen.getByText('Created by Dimitrios Zisopoulos')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(document.querySelector('.gve-about-dialog')).toBeNull()
  })

  it('opens the command palette with Ctrl-K', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search commands' }), { key: 'Escape' })
    expect(document.querySelector('.gve-command-palette')).toBeNull()
  })

  it('opens the outline and focus mode affordances', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle flow outline' }))
    expect(screen.getByRole('complementary', { name: 'Flow outline' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'View' }))
    fireEvent.click(screen.getByRole('button', { name: /Focus mode/ }))
    expect(document.querySelector('.gve-shell-focus')).toBeTruthy()
  })
})
