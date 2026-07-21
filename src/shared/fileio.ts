import type { Flow } from './flow'
import { GveImportError, importXml, type ImportResult } from './roundtrip'
import { parseFlowDocument } from './schema'

export function serializeFlow(flow: Flow): string {
  return `${JSON.stringify(flow, null, 2)}\n`
}

export function parseFlowFile(content: string, fileName: string): ImportResult {
  if (fileName.toLowerCase().endsWith('.xml')) return importXml(content)

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new GveImportError('bad-payload', 'Flow file is not valid JSON.')
  }

  try { return { flow: parseFlowDocument(parsed), drift: false } }
  catch (error) { throw new GveImportError('bad-payload', error instanceof Error ? error.message : 'Flow file has an unexpected shape.') }
}
