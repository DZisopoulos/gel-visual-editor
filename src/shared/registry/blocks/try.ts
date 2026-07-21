import type { NodeDefinition } from '../types'

export const tryBlock: NodeDefinition = {
  type: 'try', name: 'Try', category: 'advanced', color: '#F5B84D',
  isContainer: true,
  namespaces: ['core'],
  fields: [],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    '<core:try>',
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:try>'
  ]
}
