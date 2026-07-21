import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const fileRead: NodeDefinition = {
  type: 'file-read', name: 'File Read', category: 'integration', color: '#60A5FA',
  namespaces: ['file'],
  fields: [
    { key: 'path', label: 'Path', kind: 'text', required: true },
    { key: 'encoding', label: 'Encoding', kind: 'select', options: ['UTF-8', 'ISO-8859-1', 'US-ASCII'] },
    { key: 'resultVar', label: 'Result variable', kind: 'text', required: true, placeholder: 'fileContent' }
  ],
  introduces: p => (p.resultVar ? [p.resultVar] : []),
  toGel: block => [
    `<file:read path="${escapeAttr(block.props.path || '')}" encoding="${escapeAttr(block.props.encoding || 'UTF-8')}" var="${escapeAttr(block.props.resultVar || '')}"/>`
  ]
}
