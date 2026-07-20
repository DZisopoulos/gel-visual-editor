import type { NodeDefinition } from '../types'

export const rawGel: NodeDefinition = {
  type: 'raw-gel', name: 'Raw GEL', category: 'advanced', color: '#FB7185',
  namespaces: [],
  fields: [
    { key: 'xml', label: 'XML', kind: 'xml', required: true }
  ],
  introduces: () => [],
  toGel: block => block.props.xml.split('\n')
}
