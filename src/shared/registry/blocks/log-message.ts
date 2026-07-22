import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const logMessage: NodeDefinition = {
  type: 'log-message',
  name: 'Log Message',
  category: 'clarity',
  color: '#2DD4BF',
  namespaces: ['gel'],
  fields: [
    { key: 'level', label: 'Level', kind: 'select', options: ['INFO', 'WARN', 'ERROR', 'DEBUG'] },
    { key: 'message', label: 'Message', kind: 'textarea', required: true }
  ],
  introduces: () => [],
  toGel: (block) => [
    `<gel:log level="${escapeAttr(block.props.level || 'INFO')}">${escapeXml(block.props.message)}</gel:log>`
  ]
}
