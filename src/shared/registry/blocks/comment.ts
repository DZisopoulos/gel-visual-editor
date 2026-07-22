import type { NodeDefinition } from '../types'
import { escapeXml } from '../../xmlutil'

function commentText(value: string): string {
  return escapeXml(value || '').replace(/--/g, '- -')
}

export const comment: NodeDefinition = {
  type: 'comment',
  name: 'Comment',
  category: 'core',
  color: '#8A93A6',
  namespaces: [],
  fields: [{ key: 'message', label: 'Comment', kind: 'textarea', required: true }],
  introduces: () => [],
  toGel: (block) => [`<!-- ${commentText(block.props.message)} -->`]
}
