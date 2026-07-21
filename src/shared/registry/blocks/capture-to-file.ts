import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const captureToFile: NodeDefinition = {
  type: 'capture-to-file', name: 'Capture Output to File', category: 'core', color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [{ key: 'path', label: 'Output file path', kind: 'text', required: true }],
  introduces: () => [],
  toGel: (block, renderChildren) => [
    `<core:file name="${escapeAttr(block.props.path)}">`,
    ...renderChildren(block.children ?? []).map(line => '  ' + line),
    '</core:file>'
  ]
}
