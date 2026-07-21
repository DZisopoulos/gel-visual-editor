import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const methodArg: NodeDefinition = {
  type: 'method-arg', name: 'Method Argument', category: 'core', color: '#A78BFA',
  namespaces: ['core'],
  fields: [
    { key: 'type', label: 'Argument type', kind: 'text', placeholder: 'java.lang.String' },
    { key: 'value', label: 'Value', kind: 'expression', required: true }
  ],
  introduces: () => [],
  toGel: block => [
    `<core:arg${block.props.type ? ` type="${escapeAttr(block.props.type)}"` : ''} value="${escapeAttr(block.props.value)}"/>`
  ]
}
