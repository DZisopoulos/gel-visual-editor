import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const removeVariable: NodeDefinition = {
  type: 'remove-variable',
  name: 'Remove Variable',
  category: 'core',
  color: '#A78BFA',
  namespaces: ['core'],
  fields: [{ key: 'varName', label: 'Variable name', kind: 'text', required: true }],
  introduces: () => [],
  toGel: (block) => [`<core:remove var="${escapeAttr(block.props.varName)}"/>`]
}
