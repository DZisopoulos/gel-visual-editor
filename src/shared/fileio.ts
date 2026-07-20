import type { Flow } from './flow'
import { GveImportError, importXml, type ImportResult } from './roundtrip'

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

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as Partial<Flow>).gveVersion !== '1.0' ||
    !Array.isArray((parsed as Partial<Flow>).blocks)
  ) {
    throw new GveImportError('bad-payload', 'Flow file has an unexpected shape.')
  }

  return { flow: parsed as Flow, drift: false }
}
