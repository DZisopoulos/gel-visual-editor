import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const catchBlock: NodeDefinition = {
  type: 'catch',
  name: 'Catch',
  category: 'advanced',
  color: '#F5B84D',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'varName', label: 'Error variable', kind: 'text', placeholder: 'error' }],
  introduces: (p) => (p.varName ? [p.varName] : []),
  toGel: (block, renderChildren) => [
    `<core:catch${block.props.varName ? ` var="${escapeAttr(block.props.varName)}"` : ''}>`,
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:catch>'
  ]
}
