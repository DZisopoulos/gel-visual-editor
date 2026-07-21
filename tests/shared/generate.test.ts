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
  it('generates the full document for a process step', () => {
    expect(generateGel(sampleFlow())).toBe(
`<gel:script xmlns:core="jelly:core"
            xmlns:gel="jelly:com.niku.union.gel.GELTagLibrary"
            xmlns:sql="jelly:sql">
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

  it('a standalone script declares its own datasources and parameters', () => {
    const f = sampleFlow()
    f.meta.scriptType = 'standalone'
    f.datasources = ['Niku', 'Warehouse']
    const out = generateGel(f)
    expect(out).toContain(
`<gel:script xmlns:core="jelly:core"
            xmlns:gel="jelly:com.niku.union.gel.GELTagLibrary"
            xmlns:sql="jelly:sql">
  <gel:setDataSource dbId="Niku"/>
  <gel:setDataSource dbId="Warehouse"/>
  <gel:parameter var="projectId" default=""/>
`)
  })

  it('a process step declares neither, leaving them to Clarity', () => {
    const f = sampleFlow()
    f.datasources = ['Niku', 'Warehouse']
    const out = generateGel(f)
    expect(out).not.toContain('<gel:parameter')
    expect(out).not.toContain('dbId="Warehouse"')
  })

  it('emits the description as a header comment with -- sanitized', () => {
    const f = sampleFlow()
    f.meta.description = 'Nightly sync -- see ticket 42\nOwned by Platform'
    const out = generateGel(f)
    expect(out.startsWith('<!-- Nightly sync - - see ticket 42 -->\n<!-- Owned by Platform -->\n<gel:script')).toBe(true)
  })

  it('omits the header comment when there is no description', () => {
    expect(generateGel(sampleFlow()).startsWith('<gel:script')).toBe(true)
  })

  it('does not declare the core namespace just because parameters exist', () => {
    const f = createEmptyFlow('Params only')
    f.meta.scriptType = 'standalone'
    f.parameters = [{ name: 'projectId', type: 'string', default: '' }]
    const out = generateGel(f)
    expect(out).toContain('<gel:parameter var="projectId"')
    expect(out).not.toContain('xmlns:core')
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

  it('keeps a multi-line attribute value on one line and encoded', () => {
    const f = createEmptyFlow('Headers')
    const call = createBlock('http-call')
    call.props = { ...call.props, method: 'GET', url: 'http://x', headers: 'A: 1\nB: 2', resultVar: 'r' }
    f.blocks = [call]
    const out = generateGel(f)
    expect(out).toContain('headers="A: 1&#10;B: 2"')
    expect(out.split('\n').filter(line => line.includes('<http:request'))).toHaveLength(1)
  })
})
