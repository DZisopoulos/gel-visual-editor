import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const importScript: NodeDefinition = {
  type: 'import-script',
  name: 'Import Script',
  category: 'core',
  color: '#A78BFA',
  namespaces: ['core'],
  fields: [{ key: 'file', label: 'Script file', kind: 'text', required: true }],
  introduces: () => [],
  toGel: (block) => [`<core:import file="${escapeAttr(block.props.file)}"/>`]
}
