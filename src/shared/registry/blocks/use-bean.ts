import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const useBean: NodeDefinition = {
  type: 'use-bean',
  name: 'Use Bean',
  category: 'core',
  color: '#A78BFA',
  namespaces: ['core'],
  fields: [
    { key: 'varName', label: 'Variable name', kind: 'text', required: true },
    { key: 'className', label: 'Java class', kind: 'text', required: true }
  ],
  introduces: (p) => (p.varName ? [p.varName] : []),
  toGel: (block) => [
    `<core:useBean var="${escapeAttr(block.props.varName)}" class="${escapeAttr(block.props.className)}"/>`
  ]
}
