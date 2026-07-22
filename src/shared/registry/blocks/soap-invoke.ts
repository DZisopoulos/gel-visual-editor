import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const soapInvoke: NodeDefinition = {
  type: 'soap-invoke',
  name: 'SOAP Invoke',
  category: 'integration',
  color: '#60A5FA',
  namespaces: ['soap'],
  fields: [
    { key: 'endpoint', label: 'Endpoint', kind: 'text', required: true },
    { key: 'action', label: 'Action', kind: 'text', required: true },
    { key: 'request', label: 'Request XML', kind: 'xml', required: true },
    {
      key: 'resultVar',
      label: 'Result variable',
      kind: 'text',
      required: true,
      placeholder: 'soapResult'
    }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<soap:invoke endpoint="${escapeAttr(block.props.endpoint || '')}" action="${escapeAttr(block.props.action || '')}" var="${escapeAttr(block.props.resultVar || '')}">`,
    ...(block.props.request || '').split('\n').map((line) => '  ' + escapeXml(line)),
    '</soap:invoke>'
  ]
}
