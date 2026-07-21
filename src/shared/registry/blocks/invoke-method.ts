import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const invokeMethod: NodeDefinition = {
  type: 'invoke-method', name: 'Invoke Method', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [
    { key: 'on', label: 'Target variable', kind: 'expression', required: true, placeholder: '${myBean}' },
    { key: 'method', label: 'Method name', kind: 'text', required: true },
    { key: 'resultVar', label: 'Result variable', kind: 'text' }
  ],
  introduces: p => (p.resultVar ? [p.resultVar] : []),
  toGel: (block, renderChildren) => [
    `<core:invoke on="${escapeAttr(block.props.on)}" method="${escapeAttr(block.props.method)}"${block.props.resultVar ? ` var="${escapeAttr(block.props.resultVar)}"` : ''}>`,
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:invoke>'
  ]
}
