import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const whileBlock: NodeDefinition = {
  type: 'while', name: 'While', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'test', label: 'Condition', kind: 'expression', required: true }],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    `<core:while test="${escapeAttr(block.props.test || '')}">`,
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:while>'
  ]
}
