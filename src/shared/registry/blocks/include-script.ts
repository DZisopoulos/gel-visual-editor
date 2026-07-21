import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const includeScript: NodeDefinition = {
  type: 'include-script', name: 'Include Script', category: 'advanced', color: '#F5B84D',
  namespaces: ['core'],
  fields: [{ key: 'file', label: 'Script file', kind: 'text', required: true }],
  introduces: () => [],
  toGel: block => [`<core:include file="${escapeAttr(block.props.file || '')}"/>`]
}
