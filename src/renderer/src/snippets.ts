import type { Block } from '../../shared/flow'
import { redactBlockSecrets } from '../../shared/roundtrip'
import { readJson, writeJson } from './localStorage'

export interface SavedSnippet {
  id: string
  name: string
  block: Block
}
export const SNIPPETS_KEY = 'gve-snippets'
const SNIPPETS_VERSION = 1

export function readSnippets(): SavedSnippet[] {
  const value = readJson<unknown>(SNIPPETS_KEY, SNIPPETS_VERSION, [])
  return Array.isArray(value)
    ? (value.filter(
        (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && item.block
      ) as SavedSnippet[])
    : []
}

export function saveSnippet(block: Block, name: string): SavedSnippet {
  const snippet: SavedSnippet = {
    id: `snippet-${Date.now()}`,
    name: name.trim() || block.props.stepName || block.type,
    block: redactBlockSecrets(structuredClone(block))
  }
  writeJson(SNIPPETS_KEY, SNIPPETS_VERSION, [snippet, ...readSnippets()].slice(0, 30))
  return snippet
}

export function removeSnippet(id: string): void {
  writeJson(
    SNIPPETS_KEY,
    SNIPPETS_VERSION,
    readSnippets().filter((snippet) => snippet.id !== id)
  )
}
