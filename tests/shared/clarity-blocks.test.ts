import { describe, it, expect } from 'vitest'
import { createBlock, getNodeDef } from '../../src/shared/registry'

describe('core Jelly control-flow additions', () => {
  it('if renders core:if with children', () => {
    const blk = createBlock('if')
    blk.props.test = '${row.status == "OPEN"}'
    const lines = getNodeDef('if').toGel(blk, () => ['<gel:log level="INFO">open</gel:log>'])
    expect(lines).toEqual([
      '<core:if test="${row.status == &quot;OPEN&quot;}">',
      '  <gel:log level="INFO">open</gel:log>',
      '</core:if>'
    ])
  })

  it('while renders core:while with children', () => {
    const blk = createBlock('while')
    blk.props.test = '${counter < 10}'
    const lines = getNodeDef('while').toGel(blk, () => [
      '<core:set var="counter" value="${counter + 1}"/>'
    ])
    expect(lines[0]).toBe('<core:while test="${counter &lt; 10}">')
    expect(lines[lines.length - 1]).toBe('</core:while>')
  })

  it('remove-variable renders core:remove', () => {
    const blk = createBlock('remove-variable')
    blk.props.varName = 'tempRows'
    expect(getNodeDef('remove-variable').toGel(blk, () => [])).toEqual([
      '<core:remove var="tempRows"/>'
    ])
  })

  it('new-object wraps method-arg children in core:new', () => {
    const outer = createBlock('new-object')
    outer.props = { stepName: '', varName: 'list', className: 'java.util.ArrayList' }
    const arg = createBlock('method-arg')
    arg.props = { stepName: '', type: 'int', value: '10' }
    expect(
      getNodeDef('new-object').toGel(outer, () => getNodeDef('method-arg').toGel(arg, () => []))
    ).toEqual([
      '<core:new var="list" className="java.util.ArrayList">',
      '  <core:arg type="int" value="10"/>',
      '</core:new>'
    ])
  })

  it('invoke-method includes an optional result variable', () => {
    const blk = createBlock('invoke-method')
    blk.props = { stepName: '', on: '${myBean}', method: 'doWork', resultVar: 'result' }
    const lines = getNodeDef('invoke-method').toGel(blk, () => [])
    expect(lines[0]).toBe('<core:invoke on="${myBean}" method="doWork" var="result">')
  })

  it('invoke-method omits var when no result variable is set', () => {
    const blk = createBlock('invoke-method')
    blk.props = { stepName: '', on: '${myBean}', method: 'doWork', resultVar: '' }
    expect(getNodeDef('invoke-method').toGel(blk, () => [])[0]).toBe(
      '<core:invoke on="${myBean}" method="doWork">'
    )
  })

  it('invoke-static renders core:invokeStatic', () => {
    const blk = createBlock('invoke-static')
    blk.props = { stepName: '', className: 'java.lang.Math', method: 'abs', resultVar: 'absValue' }
    expect(getNodeDef('invoke-static').toGel(blk, () => [])[0]).toBe(
      '<core:invokeStatic className="java.lang.Math" method="abs" var="absValue">'
    )
  })

  it('use-bean renders core:useBean', () => {
    const blk = createBlock('use-bean')
    blk.props = { stepName: '', varName: 'helper', className: 'com.example.Helper' }
    expect(getNodeDef('use-bean').toGel(blk, () => [])).toEqual([
      '<core:useBean var="helper" class="com.example.Helper"/>'
    ])
  })

  it('capture-to-file wraps children in core:file', () => {
    const blk = createBlock('capture-to-file')
    blk.props.path = '${NIKU_HOME}/logs/out.txt'
    const lines = getNodeDef('capture-to-file').toGel(blk, () => [
      '<gel:log level="INFO">hi</gel:log>'
    ])
    expect(lines).toEqual([
      '<core:file name="${NIKU_HOME}/logs/out.txt">',
      '  <gel:log level="INFO">hi</gel:log>',
      '</core:file>'
    ])
  })

  it('import-script renders core:import', () => {
    const blk = createBlock('import-script')
    blk.props.file = 'common/shared.gel'
    expect(getNodeDef('import-script').toGel(blk, () => [])).toEqual([
      '<core:import file="common/shared.gel"/>'
    ])
  })

  it('print-expression renders core:expr', () => {
    const blk = createBlock('print-expression')
    blk.props.value = '${project.name}'
    expect(getNodeDef('print-expression').toGel(blk, () => [])).toEqual([
      '<core:expr value="${project.name}"/>'
    ])
  })
})

describe('GEL runtime utility additions', () => {
  it('release-datasource renders gel:releaseDataSource', () => {
    const blk = createBlock('release-datasource')
    blk.props.datasource = 'Niku'
    expect(getNodeDef('release-datasource').toGel(blk, () => [])).toEqual([
      '<gel:releaseDataSource dbId="Niku"/>'
    ])
  })

  it('current-date defaults the format and renders gel:date', () => {
    const blk = createBlock('current-date')
    blk.props.resultVar = 'today'
    expect(getNodeDef('current-date').toGel(blk, () => [])).toEqual([
      '<gel:date format="yyyy-MM-dd" var="today"/>'
    ])
  })

  it('sleep expands into invokeStatic + arg on Thread.sleep', () => {
    const blk = createBlock('sleep')
    blk.props.millis = '2000'
    expect(getNodeDef('sleep').toGel(blk, () => [])).toEqual([
      '<core:invokeStatic className="java.lang.Thread" method="sleep">',
      '  <core:arg type="long" value="2000"/>',
      '</core:invokeStatic>'
    ])
  })
})

describe('Clarity domain presets', () => {
  it.each([
    ['xog-read-project', 'project'],
    ['xog-read-resource', 'resource'],
    ['xog-read-obs', 'obs'],
    ['xog-read-custom-object', 'customObject']
  ])('%s fixes the XOG object attribute to %s', (type, object) => {
    const blk = createBlock(type)
    blk.props = {
      stepName: '',
      url: 'https://clarity.example/xog',
      username: '',
      password: '',
      filter: '',
      resultVar: 'result'
    }
    expect(getNodeDef(type).toGel(blk, () => [])[0]).toContain(`object="${object}"`)
  })

  it.each(['xog-write-project', 'xog-write-resource', 'xog-write-obs', 'xog-write-custom-object'])(
    '%s renders an xog:write envelope from its payload field',
    (type) => {
      const blk = createBlock(type)
      blk.props = {
        stepName: '',
        url: 'https://clarity.example/xog',
        username: '',
        password: '',
        payload: '<Root/>',
        resultVar: ''
      }
      const lines = getNodeDef(type).toGel(blk, () => [])
      expect(lines[0]).toMatch(/^<xog:write /)
      expect(lines).toContain('  &lt;Root/&gt;')
      expect(lines[lines.length - 1]).toBe('</xog:write>')
    }
  )

  it('set-custom-field builds a NikuDataBus write envelope with a dynamic attribute', () => {
    const blk = createBlock('set-custom-field')
    blk.props = {
      stepName: '',
      url: 'https://clarity.example/xog',
      username: '',
      password: '',
      objectCode: 'project',
      instanceCode: '${project.id}',
      fieldName: 'riskFlag',
      fieldValue: 'true',
      resultVar: ''
    }
    const xml = getNodeDef('set-custom-field')
      .toGel(blk, () => [])
      .join('\n')
    expect(xml).toContain('objectType="project"')
    expect(xml).toContain('<Object code="${project.id}">')
    expect(xml).toContain('<Custom riskFlag="true"/>')
  })

  it.each([
    'lookup-resource-by-username',
    'lookup-project-by-code',
    'get-project-tasks',
    'get-resource-allocation',
    'get-timesheet-status',
    'get-cost-plan-summary',
    'translate-lookup-value',
    'get-security-group-members'
  ])('%s renders a setDataSource + sql:query pair', (type) => {
    const blk = createBlock(type)
    blk.props.datasource = 'Niku'
    blk.props.resultVar = 'result'
    blk.props.sql = 'SELECT 1 FROM dual'
    const lines = getNodeDef(type).toGel(blk, () => [])
    expect(lines[0]).toBe('<gel:setDataSource dbId="Niku"/>')
    expect(lines[1]).toBe('<sql:query escapeText="false" var="result">')
    expect(lines[lines.length - 1]).toBe('</sql:query>')
  })
})
