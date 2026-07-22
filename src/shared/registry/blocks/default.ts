import type { NodeDefinition } from '../types'

export const defaultBlock: NodeDefinition = {
  type: 'default',
  name: 'Default',
  category: 'core',
  color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    '<core:default>',
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:default>'
  ]
}
