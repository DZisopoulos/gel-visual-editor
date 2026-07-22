import { describe, it, expect } from 'vitest'
import { createEmptyFlow } from '../src/shared/flow'
import { createBlock } from '../src/shared/registry'
import { exportXml, GveImportError } from '../src/shared/roundtrip'
import { parseFlowFile, serializeFlow } from '../src/shared/fileio'

describe('fileio', () => {
  it('serializeFlow produces pretty JSON that round-trips', () => {
    const flow = createEmptyFlow('Saved flow')
    expect(JSON.parse(serializeFlow(flow))).toEqual(flow)
    expect(serializeFlow(flow)).toContain('\n  "gveVersion"')
  })

  it('parseFlowFile accepts a .gve flow', () => {
    const flow = createEmptyFlow('Opened flow')
    expect(parseFlowFile(serializeFlow(flow), 'opened.gve')).toEqual({ flow, drift: false })
  })

  it('parseFlowFile rejects garbage with GveImportError', () => {
    expect(() => parseFlowFile('not json', 'broken.gve')).toThrowError(GveImportError)
    try {
      parseFlowFile('not json', 'broken.gve')
    } catch (error) {
      expect((error as GveImportError).reason).toBe('bad-payload')
    }
  })

  it('parseFlowFile delegates .xml import and propagates drift', () => {
    const flow = createEmptyFlow('XML flow')
    const log = createBlock('log-message')
    log.props.message = 'hello'
    flow.blocks = [log]
    const tampered = exportXml(flow).replace('</gel:script>', '  <!-- edit -->\n</gel:script>')
    expect(parseFlowFile(tampered, 'opened.xml')).toEqual({ flow, drift: true })
  })
})
