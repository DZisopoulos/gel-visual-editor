import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const releaseDatasource: NodeDefinition = {
  type: 'release-datasource', name: 'Release Datasource', category: 'clarity', color: '#2DD4BF',
  namespaces: ['gel'],
  fields: [{ key: 'datasource', label: 'Datasource', kind: 'datasource', required: true, placeholder: 'Niku' }],
  introduces: () => [],
  toGel: block => [`<gel:releaseDataSource dbId="${escapeAttr(block.props.datasource)}"/>`]
}
