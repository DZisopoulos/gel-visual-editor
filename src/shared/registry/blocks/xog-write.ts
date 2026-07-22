import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const xogWrite: NodeDefinition = {
  type: 'xog-write',
  name: 'XOG Write',
  category: 'clarity',
  color: '#2DD4BF',
  namespaces: ['xog'],
  fields: [
    { key: 'url', label: 'XOG URL', kind: 'text', required: true },
    { key: 'username', label: 'Username', kind: 'text' },
    { key: 'password', label: 'Password', kind: 'text' },
    { key: 'payload', label: 'Payload', kind: 'xml', required: true },
    { key: 'resultVar', label: 'Result variable', kind: 'text', placeholder: 'xogResult' }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<xog:write url="${escapeAttr(block.props.url || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}"${block.props.resultVar ? ` var="${escapeAttr(block.props.resultVar)}"` : ''}>`,
    ...(block.props.payload || '').split('\n').map((line) => '  ' + escapeXml(line)),
    '</xog:write>'
  ]
}
