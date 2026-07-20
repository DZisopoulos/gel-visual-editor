import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const setVariable: NodeDefinition = {
  type: 'set-variable', name: 'Set Variable', category: 'core', color: '#A78BFA',
  namespaces: ['core'],
  fields: [
    { key: 'varName', label: 'Variable name', kind: 'text', required: true, placeholder: 'total' },
    { key: 'value', label: 'Value', kind: 'expression', required: true }
  ],
  introduces: p => (p.varName ? [p.varName] : []),
  toGel: block => [
    `<core:set var="${escapeAttr(block.props.varName)}" value="${escapeAttr(block.props.value)}"/>`
  ]
}
