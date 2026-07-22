import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const xogRead: NodeDefinition = {
  type: 'xog-read',
  name: 'XOG Read',
  category: 'clarity',
  color: '#2DD4BF',
  namespaces: ['xog'],
  fields: [
    { key: 'url', label: 'XOG URL', kind: 'text', required: true },
    { key: 'username', label: 'Username', kind: 'text' },
    { key: 'password', label: 'Password', kind: 'secret' },
    { key: 'object', label: 'Object', kind: 'text', required: true, placeholder: 'project' },
    { key: 'filter', label: 'Filter', kind: 'expression' },
    {
      key: 'resultVar',
      label: 'Result variable',
      kind: 'text',
      required: true,
      placeholder: 'xogResult'
    }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<xog:read url="${escapeAttr(block.props.url || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}" object="${escapeAttr(block.props.object || '')}" filter="${escapeAttr(block.props.filter || '')}" var="${escapeAttr(block.props.resultVar || '')}"/>`
  ]
}
