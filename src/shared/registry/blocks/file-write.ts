import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const fileWrite: NodeDefinition = {
  type: 'file-write', name: 'File Write', category: 'integration', color: '#60A5FA',
  namespaces: ['file'],
  fields: [
    { key: 'path', label: 'Path', kind: 'text', required: true },
    { key: 'encoding', label: 'Encoding', kind: 'select', options: ['UTF-8', 'ISO-8859-1', 'US-ASCII'] },
    { key: 'content', label: 'Content', kind: 'textarea', required: true }
  ],
  introduces: () => [],
  toGel: block => [
    `<file:write path="${escapeAttr(block.props.path || '')}" encoding="${escapeAttr(block.props.encoding || 'UTF-8')}">${escapeXml(block.props.content || '')}</file:write>`
  ]
}
