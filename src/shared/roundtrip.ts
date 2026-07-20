import type { Flow } from './flow'
import { generateGel } from './generate'
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
  if (!text.startsWith(MARKER_START)) {
    throw new GveImportError('no-marker', 'This XML was not exported by GVE (no GVE-FLOW marker found).')
  }
  const end = text.indexOf('\n-->\n')
  if (end === -1) throw new GveImportError('bad-payload', 'GVE-FLOW marker is not terminated.')
  const inner = text.slice(MARKER_START.length, end)
  const hashLine = inner.lastIndexOf('\nBODY-HASH:')
  if (hashLine === -1) throw new GveImportError('bad-payload', 'GVE-FLOW marker is missing its body hash.')
  const jsonText = inner.slice(0, hashLine)
  const storedHash = inner.slice(hashLine + '\nBODY-HASH:'.length).trim()
  let flow: Flow
  try { flow = decodeCommentJson(jsonText) as Flow } catch {
    throw new GveImportError('bad-payload', 'Embedded flow definition is not valid JSON.')
  }
  if (!flow || flow.gveVersion !== '1.0' || !Array.isArray(flow.blocks)) {
    throw new GveImportError('bad-payload', 'Embedded flow definition has an unexpected shape.')
  }
  const body = text.slice(end + '\n-->\n'.length)
  return { flow, drift: fnv1a(body) !== storedHash }
}
