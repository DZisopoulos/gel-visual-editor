import { describe, it, expect } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { createBlock } from '../../src/shared/registry'
import { exportXml, importXml, GveImportError } from '../../src/shared/roundtrip'

function flowWithSql() {
  const f = createEmptyFlow('RT')
  const q = createBlock('sql-query')
  q.props = { stepName: '', datasource: 'Niku', resultVar: 'r', sql: 'SELECT 1 -- inline comment' }
  f.blocks = [q]
  return f
}

describe('roundtrip', () => {
  it('export → import returns a deep-equal flow with no drift', () => {
    const f = flowWithSql()
    const res = importXml(exportXml(f))
    expect(res.flow).toEqual(f)
    expect(res.drift).toBe(false)
  })
  it('the marker comment never contains --', () => {
    const xml = exportXml(flowWithSql())
    const marker = xml.slice(0, xml.indexOf('-->'))
    expect(marker.slice(4)).not.toContain('--')  // skip the "<!--" itself
  })
  it('detects drift when body is hand-edited', () => {
    const tampered = exportXml(flowWithSql()).replace('SELECT 1', 'SELECT 2')
    expect(importXml(tampered).drift).toBe(true)
  })
  it('throws no-marker for foreign scripts', () => {
    expect(() => importXml('<gel:script/>')).toThrowError(GveImportError)
    try { importXml('<gel:script/>') } catch (e) { expect((e as GveImportError).reason).toBe('no-marker') }
  })
  it('throws bad-payload for corrupted JSON', () => {
    const broken = '<!-- GVE-FLOW v1.0\n{not json\nBODY-HASH:00000000\n-->\n<gel:script/>'
    try { importXml(broken) } catch (e) { expect((e as GveImportError).reason).toBe('bad-payload') }
  })
})
