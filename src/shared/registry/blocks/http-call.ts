import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const httpCall: NodeDefinition = {
  type: 'http-call',
  name: 'HTTP Call',
  category: 'integration',
  color: '#60A5FA',
  namespaces: ['http'],
  fields: [
    {
      key: 'method',
      label: 'Method',
      kind: 'select',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    { key: 'url', label: 'URL', kind: 'text', required: true },
    { key: 'headers', label: 'Headers', kind: 'textarea' },
    { key: 'body', label: 'Body', kind: 'textarea' },
    {
      key: 'resultVar',
      label: 'Result variable',
      kind: 'text',
      required: true,
      placeholder: 'httpResult'
    }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<http:request method="${escapeAttr(block.props.method || 'GET')}" url="${escapeAttr(block.props.url || '')}" headers="${escapeAttr(block.props.headers || '')}" var="${escapeAttr(block.props.resultVar || '')}">${escapeXml(block.props.body || '')}</http:request>`
  ]
}
