import { describe, it, expect } from 'vitest'
import { getNodeDef, allNodeDefs, createBlock } from '../../src/shared/registry'

describe('registry', () => {
  it('registers the complete planned block palette', () => {
    expect(allNodeDefs().map(d => d.type).sort()).toEqual(
      [
        'case', 'catch', 'choose', 'comment', 'default', 'email', 'file-read', 'file-write',
        'for-each', 'ftp-transfer', 'http-call', 'include-script', 'log-message', 'otherwise',
        'raw-gel', 'set-variable', 'soap-invoke', 'sql-query', 'switch', 'try', 'when',
        'xog-read', 'xog-write'
      ])
  })
  it('throws on unknown type', () => { expect(() => getNodeDef('nope')).toThrow() })
  it('createBlock fills defaults and container children', () => {
    const loop = createBlock('for-each')
    expect(loop.children).toEqual([])
    expect(loop.enabled).toBe(true)
    const log = createBlock('log-message')
    expect(log.children).toBeUndefined()
    expect(Object.keys(log.props)).toEqual(expect.arrayContaining(['level', 'message', 'stepName']))
  })
  it('set-variable generates core:set and introduces its var', () => {
    const blk = { ...createBlock('set-variable'), props: { stepName: '', varName: 'total', value: '${rows.rowCount}' } }
    expect(getNodeDef('set-variable').toGel(blk, () => [])).toEqual(
      ['<core:set var="total" value="${rows.rowCount}"/>'])
    expect(getNodeDef('set-variable').introduces(blk.props)).toEqual(['total'])
  })
  it('sql-query generates setDataSource + sql:query with escaped SQL', () => {
    const blk = { ...createBlock('sql-query'), props: { stepName: '', datasource: 'Niku', resultVar: 'rows', sql: 'SELECT 1 FROM dual WHERE 1 < 2' } }
    expect(getNodeDef('sql-query').toGel(blk, () => [])).toEqual([
      '<gel:setDataSource dbId="Niku"/>',
      '<sql:query escapeText="false" var="rows">',
      '  SELECT 1 FROM dual WHERE 1 &lt; 2',
      '</sql:query>'])
  })

  it('sql-query supports enabling text escaping', () => {
    const blk = { ...createBlock('sql-query'), props: { stepName: '', datasource: 'Niku', escapeText: 'true', resultVar: 'rows', sql: 'SELECT 1' } }
    expect(getNodeDef('sql-query').toGel(blk, () => [])[1]).toContain('escapeText="true"')
  })
  it('for-each wraps rendered children indented', () => {
    const blk = { ...createBlock('for-each'), props: { stepName: '', items: '${rows.rows}', varName: 'row' } }
    const lines = getNodeDef('for-each').toGel(blk, () => ['<gel:log level="INFO">hi</gel:log>'])
    expect(lines).toEqual([
      '<core:forEach items="${rows.rows}" var="row">',
      '  <gel:log level="INFO">hi</gel:log>',
      '</core:forEach>'])
  })
  it('raw-gel passes xml through verbatim', () => {
    const blk = { ...createBlock('raw-gel'), props: { stepName: '', xml: '<gel:out>x</gel:out>' } }
    expect(getNodeDef('raw-gel').toGel(blk, () => [])).toEqual(['<gel:out>x</gel:out>'])
  })
})
