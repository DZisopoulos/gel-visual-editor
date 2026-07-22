import { describe, it, expect } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { generateGel } from '../../src/shared/generate'
import { createBlock, getNodeDef } from '../../src/shared/registry'

describe('planned blocks', () => {
  it.each([
    'choose',
    'when',
    'otherwise',
    'switch',
    'case',
    'default',
    'try',
    'catch',
    'comment',
    'email',
    'xog-read',
    'xog-write',
    'soap-invoke',
    'http-call',
    'file-read',
    'file-write',
    'ftp-transfer',
    'include-script'
  ])('creates %s with registry defaults', (type) => {
    const block = createBlock(type)
    expect(block.type).toBe(type)
    expect(block.enabled).toBe(true)
    expect(getNodeDef(type).toGel(block, () => [])).toBeInstanceOf(Array)
    if (getNodeDef(type).isContainer) expect(block.children).toEqual([])
  })

  it('renders nested control-flow branches', () => {
    const choose = createBlock('choose')
    const when = createBlock('when')
    when.props.test = '${rows.count > 0}'
    const otherwise = createBlock('otherwise')
    otherwise.children = [createBlock('comment')]
    otherwise.children[0].props.message = 'No rows'
    when.children = [createBlock('log-message')]
    when.children[0].props = { stepName: '', level: 'INFO', message: 'Rows found' }
    choose.children = [when, otherwise]

    const switchBlock = createBlock('switch')
    switchBlock.props.value = '${row.status}'
    const caseBlock = createBlock('case')
    caseBlock.props.value = '"OPEN"'
    caseBlock.children = [createBlock('comment')]
    caseBlock.children[0].props.message = 'Open item'
    switchBlock.children = [caseBlock, createBlock('default')]

    const tryBlock = createBlock('try')
    const catchBlock = createBlock('catch')
    catchBlock.props.varName = 'error'
    tryBlock.children = [createBlock('comment'), catchBlock]
    tryBlock.children[0].props.message = 'Attempt operation'

    const flow = createEmptyFlow('Control flow')
    flow.blocks = [choose, switchBlock, tryBlock]
    const xml = generateGel(flow)
    expect(xml).toContain('<core:choose>')
    expect(xml).toContain('<core:when test="${rows.count &gt; 0}">')
    expect(xml).toContain('<core:otherwise>')
    expect(xml).toContain('<core:switch on="${row.status}">')
    expect(xml).toContain('<core:case value="&quot;OPEN&quot;">')
    expect(xml).toContain('<core:default>')
    expect(xml).toContain('<core:try>')
    expect(xml).toContain('<core:catch var="error">')
  })

  it('renders Clarity and integration blocks with their namespaces', () => {
    const flow = createEmptyFlow('Integrations')
    const email = createBlock('email')
    email.props = {
      stepName: '',
      from: 'gve@example.com',
      to: '${row.email}',
      cc: '',
      bcc: '',
      subject: 'Notice',
      body: 'Hello ${row.name}'
    }
    const read = createBlock('xog-read')
    read.props = {
      stepName: '',
      url: 'https://clarity.example/xog',
      username: 'api',
      password: 'secret',
      object: 'project',
      filter: '',
      resultVar: 'projectResult'
    }
    const call = createBlock('soap-invoke')
    call.props = {
      stepName: '',
      endpoint: 'https://example.test/soap',
      action: 'GetProject',
      request: '<request/>',
      resultVar: 'soapResult'
    }
    const http = createBlock('http-call')
    http.props = {
      stepName: '',
      method: 'POST',
      url: 'https://example.test/api',
      headers: 'Content-Type: application/json',
      body: '{"ok":true}',
      resultVar: 'httpResult'
    }
    const file = createBlock('file-read')
    file.props = {
      stepName: '',
      path: '/tmp/input.txt',
      encoding: 'UTF-8',
      resultVar: 'fileContent'
    }
    const write = createBlock('file-write')
    write.props = { stepName: '', path: '/tmp/output.txt', encoding: 'UTF-8', content: 'done' }
    const ftp = createBlock('ftp-transfer')
    ftp.props = {
      stepName: '',
      operation: 'upload',
      host: 'ftp.example.test',
      username: 'gve',
      password: 'secret',
      localPath: '/tmp/a.txt',
      remotePath: '/in/a.txt'
    }
    const include = createBlock('include-script')
    include.props = { stepName: '', file: 'shared/common.gel' }
    flow.blocks = [email, read, createBlock('xog-write'), call, http, file, write, ftp, include]
    flow.blocks[2].props = {
      stepName: '',
      url: 'https://clarity.example/xog',
      username: 'api',
      password: 'secret',
      payload: '<xog/>',
      resultVar: 'writeResult'
    }

    const xml = generateGel(flow)
    for (const namespace of [
      'xmlns:file=',
      'xmlns:ftp=',
      'xmlns:http=',
      'xmlns:soap=',
      'xmlns:xog='
    ]) {
      expect(xml).toContain(namespace)
    }
    expect(xml).toContain('<gel:email')
    expect(xml).toContain('<xog:read')
    expect(xml).toContain('<xog:write')
    expect(xml).toContain('<soap:invoke')
    expect(xml).toContain('<http:request')
    expect(xml).toContain('<file:read')
    expect(xml).toContain('<file:write')
    expect(xml).toContain('<ftp:transfer')
    expect(xml).toContain('<core:include')
  })
})
