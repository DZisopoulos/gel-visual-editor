import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const sqlQuery: NodeDefinition = {
  type: 'sql-query',
  name: 'SQL Query',
  category: 'data',
  color: '#60A5FA',
  namespaces: ['gel', 'sql'],
  fields: [
    {
      key: 'datasource',
      label: 'Datasource',
      kind: 'datasource',
      required: true,
      placeholder: 'Niku'
    },
    { key: 'sql', label: 'SQL', kind: 'sql', required: true },
    { key: 'escapeText', label: 'Escape text', kind: 'select', options: ['false', 'true'] },
    {
      key: 'resultVar',
      label: 'Result variable',
      kind: 'text',
      required: true,
      placeholder: 'rows'
    }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<gel:setDataSource dbId="${escapeAttr(block.props.datasource)}"/>`,
    `<sql:query escapeText="${escapeAttr(block.props.escapeText || 'false')}" var="${escapeAttr(block.props.resultVar)}">`,
    ...block.props.sql.split('\n').map((l) => '  ' + escapeXml(l)),
    '</sql:query>'
  ]
}
