import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const ifBlock: NodeDefinition = {
  type: 'if', name: 'If', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'test', label: 'Condition', kind: 'expression', required: true }],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    `<core:if test="${escapeAttr(block.props.test || '')}">`,
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:if>'
  ]
}
