import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const invokeStatic: NodeDefinition = {
  type: 'invoke-static', name: 'Invoke Static Method', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [
    { key: 'className', label: 'Java class', kind: 'text', required: true },
    { key: 'method', label: 'Method name', kind: 'text', required: true },
    { key: 'resultVar', label: 'Result variable', kind: 'text' }
  ],
  introduces: p => (p.resultVar ? [p.resultVar] : []),
  toGel: (block, renderChildren) => [
    `<core:invokeStatic className="${escapeAttr(block.props.className)}" method="${escapeAttr(block.props.method)}"${block.props.resultVar ? ` var="${escapeAttr(block.props.resultVar)}"` : ''}>`,
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:invokeStatic>'
  ]
}
