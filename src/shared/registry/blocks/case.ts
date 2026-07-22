import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const caseBlock: NodeDefinition = {
  type: 'case',
  name: 'Case',
  category: 'core',
  color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'value', label: 'Match value', kind: 'expression', required: true }],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    `<core:case value="${escapeAttr(block.props.value || '')}">`,
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:case>'
  ]
}
