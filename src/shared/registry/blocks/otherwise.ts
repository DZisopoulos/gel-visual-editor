import type { NodeDefinition } from '../types'

export const otherwise: NodeDefinition = {
  type: 'otherwise', name: 'Otherwise', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    '<core:otherwise>',
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:otherwise>'
  ]
}
