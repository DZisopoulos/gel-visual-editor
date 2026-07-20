import { describe, it, expect } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { createBlock } from '../../src/shared/registry'
import { generateGel } from '../../src/shared/generate'

function sampleFlow() {
  const f = createEmptyFlow('Sample')
  f.parameters = [{ name: 'projectId', type: 'string', default: '' }]
  const q = createBlock('sql-query')
  q.props = { stepName: 'Get rows', datasource: 'Niku', resultVar: 'rows', sql: 'SELECT 1 FROM dual' }
  const loop = createBlock('for-each')
  loop.props = { stepName: '', items: '${rows.rows}', varName: 'row' }
  const log = createBlock('log-message')
  log.props = { stepName: '', level: 'INFO', message: 'Row ${row.id}' }
  loop.children = [log]
  f.blocks = [q, loop]
  return f
}

describe('generateGel', () => {
  it('generates the full document', () => {
    expect(generateGel(sampleFlow())).toBe(
`<gel:script xmlns:core="jelly:core"
            xmlns:gel="jelly:com.niku.union.gel.GELTagLibrary"
            xmlns:sql="jelly:sql">
  <gel:parameter var="projectId" default=""/>
  <!-- Step: Get rows -->
  <gel:setDataSource dbId="Niku"/>
  <sql:query escapeText="false" var="rows">
    SELECT 1 FROM dual
  </sql:query>
  <core:forEach items="\${rows.rows}" var="row">
    <gel:log level="INFO">Row \${row.id}</gel:log>
  </core:forEach>
</gel:script>
`)
  })
  it('omits unused namespaces', () => {
    const f = createEmptyFlow('X')
    const log = createBlock('log-message')
    log.props = { stepName: '', level: 'INFO', message: 'hi' }
    f.blocks = [log]
    const out = generateGel(f)
    expect(out).not.toContain('xmlns:sql')
    expect(out).not.toContain('xmlns:core')
    expect(out).toContain('xmlns:gel=')
  })
  it('renders disabled blocks as comments with -- sanitized', () => {
    const f = createEmptyFlow('X')
    const log = createBlock('log-message')
    log.props = { stepName: 'Old--log', level: 'INFO', message: 'a--b' }
    log.enabled = false
    f.blocks = [log]
    const out = generateGel(f)
    expect(out).toContain('<!-- disabled: Old- -log')
    expect(out).not.toMatch(/<gel:log[^!]*a--b/)
  })
})
