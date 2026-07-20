import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const forEach: NodeDefinition = {
  type: 'for-each', name: 'For Each', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [
    { key: 'items', label: 'Items', kind: 'expression', required: true },
    { key: 'varName', label: 'Variable name', kind: 'text', required: true, placeholder: 'row' }
  ],
  introduces: p => (p.varName ? [p.varName] : []),
  toGel: (block, renderChildren) => [
    `<core:forEach items="${escapeAttr(block.props.items)}" var="${escapeAttr(block.props.varName)}">`,
    ...renderChildren(block.children ?? []).map(l => '  ' + l),
    '</core:forEach>'
  ]
}
