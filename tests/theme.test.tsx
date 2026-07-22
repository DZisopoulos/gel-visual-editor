import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from '../src/renderer/src/App'
import { THEME_STORAGE_KEY } from '../src/renderer/src/theme'

describe('theme preferences', () => {
  beforeEach(() => window.localStorage.clear())

  it('switches and persists independent app and XML themes', () => {
    const { unmount } = render(<App />)

    fireEvent.change(screen.getByLabelText('App theme'), { target: { value: 'github-dark' } })
    fireEvent.change(screen.getByLabelText('XML theme'), { target: { value: 'dracula' } })

    expect(document.querySelector('.gve-app')?.getAttribute('data-app-theme')).toBe('github-dark')
    expect(JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? '{}')).toEqual({
      app: 'github-dark',
      xml: 'dracula'
    })

    fireEvent.click(screen.getByRole('tab', { name: 'XML Preview' }))
    expect(document.querySelector('.gve-xmlpane')?.getAttribute('data-xml-theme')).toBe('dracula')

    unmount()
    render(<App />)
    expect((screen.getByLabelText('App theme') as HTMLSelectElement).value).toBe('github-dark')
    expect((screen.getByLabelText('XML theme') as HTMLSelectElement).value).toBe('dracula')
  })
})
