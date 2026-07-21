import type { Block } from '../../shared/flow'

export interface SavedSnippet { id: string; name: string; block: Block }
export const SNIPPETS_KEY = 'gve-snippets'

export function readSnippets(): SavedSnippet[] {
  try {
    const value = JSON.parse(localStorage.getItem(SNIPPETS_KEY) ?? '[]') as unknown
    return Array.isArray(value) ? value.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.block) as SavedSnippet[] : []
  } catch { return [] }
}

export function saveSnippet(block: Block, name: string): SavedSnippet {
  const snippet: SavedSnippet = { id: `snippet-${Date.now()}`, name: name.trim() || block.props.stepName || block.type, block: structuredClone(block) }
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify([snippet, ...readSnippets()].slice(0, 30)))
  return snippet
}

export function removeSnippet(id: string): void { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(readSnippets().filter(snippet => snippet.id !== id))) }
