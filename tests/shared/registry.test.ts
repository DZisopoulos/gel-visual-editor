import { describe, it, expect } from 'vitest'
import { getNodeDef, allNodeDefs, createBlock } from '../../src/shared/registry'

describe('registry', () => {
  it('has exactly the 5 phase-1 blocks', () => {
    expect(allNodeDefs().map(d => d.type).sort()).toEqual(
      ['for-each', 'log-message', 'raw-gel', 'set-variable', 'sql-query'])
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
