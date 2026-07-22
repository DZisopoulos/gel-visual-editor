import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const newObject: NodeDefinition = {
  type: 'new-object',
  name: 'New Object',
  category: 'core',
  color: '#A78BFA',
  isContainer: true,
  namespaces: ['core'],
  fields: [
    { key: 'varName', label: 'Variable name', kind: 'text', required: true },
    {
      key: 'className',
      label: 'Java class',
      kind: 'text',
      required: true,
      placeholder: 'java.util.ArrayList'
    }
  ],
  introduces: (p) => (p.varName ? [p.varName] : []),
  toGel: (block, renderChildren) => [
    `<core:new var="${escapeAttr(block.props.varName)}" className="${escapeAttr(block.props.className)}">`,
    ...renderChildren(block.children ?? []).map((line) => '  ' + line),
    '</core:new>'
  ]
}
