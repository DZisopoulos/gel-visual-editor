import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const printExpression: NodeDefinition = {
  type: 'print-expression', name: 'Print Expression', category: 'core', color: '#A78BFA',
  namespaces: ['core'],
  fields: [{ key: 'value', label: 'Expression', kind: 'expression', required: true }],
  introduces: () => [],
  toGel: block => [`<core:expr value="${escapeAttr(block.props.value)}"/>`]
}
