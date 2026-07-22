import type { NodeDefinition } from '../types'

export const choose: NodeDefinition = {
  type: 'choose',
  name: 'Choose',
  category: 'core',
  color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    '<core:choose>',
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:choose>'
  ]
}
