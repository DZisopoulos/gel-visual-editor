import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const switchBlock: NodeDefinition = {
  type: 'switch',
  name: 'Switch',
  category: 'core',
  color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'value', label: 'Value', kind: 'expression', required: true }],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    `<core:switch on="${escapeAttr(block.props.value || '')}">`,
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:switch>'
  ]
}
