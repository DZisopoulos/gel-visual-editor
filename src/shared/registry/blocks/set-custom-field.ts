import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const setCustomField: NodeDefinition = {
  type: 'set-custom-field',
  name: 'Set Custom Field',
  category: 'clarity',
  color: '#2DD4BF',
  namespaces: ['xog'],
  fields: [
    { key: 'url', label: 'XOG URL', kind: 'text', required: true },
    { key: 'username', label: 'Username', kind: 'text' },
    { key: 'password', label: 'Password', kind: 'secret' },
    {
      key: 'objectCode',
      label: 'Object type',
      kind: 'text',
      required: true,
      placeholder: 'project'
    },
    {
      key: 'instanceCode',
      label: 'Instance code',
      kind: 'expression',
      required: true,
      placeholder: '${project.id}'
    },
    {
      key: 'fieldName',
      label: 'Custom field name',
      kind: 'text',
      required: true,
      placeholder: 'riskFlag'
    },
    { key: 'fieldValue', label: 'Value', kind: 'expression', required: true },
    { key: 'resultVar', label: 'Result variable', kind: 'text' }
  ],
  introduces: (p) => (p.resultVar ? [p.resultVar] : []),
  toGel: (block) => [
    `<xog:write url="${escapeAttr(block.props.url || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}"${block.props.resultVar ? ` var="${escapeAttr(block.props.resultVar)}"` : ''}>`,
    '  <NikuDataBus>',
    `    <Header version="7.0" externalSource="NIKU" action="write" objectType="${escapeAttr(block.props.objectCode || '')}"/>`,
    '    <Instance>',
    `      <Object code="${escapeAttr(block.props.instanceCode || '')}">`,
    `        <Custom ${block.props.fieldName || 'field'}="${escapeAttr(block.props.fieldValue || '')}"/>`,
    '      </Object>',
    '    </Instance>',
    '  </NikuDataBus>',
    '</xog:write>'
  ]
}
