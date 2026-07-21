import type { Flow } from './flow'
import { generateGel } from './generate'
import { parseFlowDocument } from './schema'
import { decodeCommentJson, encodeCommentJson, fnv1a } from './xmlutil'

export interface ImportResult { flow: Flow; drift: boolean }

export class GveImportError extends Error {
  constructor(public reason: 'no-marker' | 'bad-payload', message: string) { super(message) }
}

const MARKER_START = '<!-- GVE-FLOW v1.0\n'

export function exportXml(flow: Flow): string {
  const body = generateGel(flow)
  return `${MARKER_START}${encodeCommentJson(flow)}\nBODY-HASH:${fnv1a(body)}\n-->\n${body}`
}

export function importXml(text: string): ImportResult {
  // Exports are written with LF, but any Windows editor that touches the file
  // rewrites them as CRLF. Normalise first so the marker, terminator and body
  // hash all still match a file that has merely been opened and saved.
  const normalized = text.replace(/\r\n/g, '\n')
  if (!normalized.startsWith(MARKER_START)) {
    throw new GveImportError('no-marker', 'This XML was not exported by GVE (no GVE-FLOW marker found).')
  }
  const end = normalized.indexOf('\n-->\n')
  if (end === -1) throw new GveImportError('bad-payload', 'GVE-FLOW marker is not terminated.')
  const inner = normalized.slice(MARKER_START.length, end)
  const hashLine = inner.lastIndexOf('\nBODY-HASH:')
  if (hashLine === -1) throw new GveImportError('bad-payload', 'GVE-FLOW marker is missing its body hash.')
  const jsonText = inner.slice(0, hashLine)
  const storedHash = inner.slice(hashLine + '\nBODY-HASH:'.length).trim()
  let payload: unknown
  try { payload = decodeCommentJson(jsonText) } catch {
    throw new GveImportError('bad-payload', 'Embedded flow definition is not valid JSON.')
  }
  // Validate the embedded document exactly as the .gve path does, so a
  // hand-edited export cannot put a malformed block into the editor.
  let flow: Flow
  try { flow = parseFlowDocument(payload) } catch (error) {
    throw new GveImportError('bad-payload', error instanceof Error ? error.message : 'Embedded flow definition has an unexpected shape.')
  }
  const body = normalized.slice(end + '\n-->\n'.length)
  return { flow, drift: fnv1a(body) !== storedHash }
}
