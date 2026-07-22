import type { NodeDefinition } from './types'
import { escapeAttr, escapeXml } from '../xmlutil'

// Shared shapes for the "Clarity domain" convenience blocks: thin, labeled
// presets over the already-verified xog:read / xog:write / sql:query
// emitters, so the generated GEL never introduces a tag shape that isn't
// already proven correct elsewhere in the registry.

export function xogReadPreset(
  type: string,
  name: string,
  object: string,
  resultVarPlaceholder: string
): NodeDefinition {
  return {
    type,
    name,
    category: 'clarity',
    color: '#2DD4BF',
    namespaces: ['xog'],
    fields: [
      { key: 'url', label: 'XOG URL', kind: 'text', required: true },
      { key: 'username', label: 'Username', kind: 'text' },
      { key: 'password', label: 'Password', kind: 'text' },
      { key: 'filter', label: 'Filter', kind: 'expression' },
      {
        key: 'resultVar',
        label: 'Result variable',
        kind: 'text',
        required: true,
        placeholder: resultVarPlaceholder
      }
    ],
    introduces: (p) => (p.resultVar ? [p.resultVar] : []),
    toGel: (block) => [
      `<xog:read url="${escapeAttr(block.props.url || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}" object="${object}" filter="${escapeAttr(block.props.filter || '')}" var="${escapeAttr(block.props.resultVar || '')}"/>`
    ]
  }
}

export function xogWritePreset(
  type: string,
  name: string,
  payloadPlaceholder: string
): NodeDefinition {
  return {
    type,
    name,
    category: 'clarity',
    color: '#2DD4BF',
    namespaces: ['xog'],
    fields: [
      { key: 'url', label: 'XOG URL', kind: 'text', required: true },
      { key: 'username', label: 'Username', kind: 'text' },
      { key: 'password', label: 'Password', kind: 'text' },
      {
        key: 'payload',
        label: 'Payload',
        kind: 'xml',
        required: true,
        placeholder: payloadPlaceholder
      },
      { key: 'resultVar', label: 'Result variable', kind: 'text' }
    ],
    introduces: (p) => (p.resultVar ? [p.resultVar] : []),
    toGel: (block) => [
      `<xog:write url="${escapeAttr(block.props.url || '')}" username="${escapeAttr(block.props.username || '')}" password="${escapeAttr(block.props.password || '')}"${block.props.resultVar ? ` var="${escapeAttr(block.props.resultVar)}"` : ''}>`,
      ...(block.props.payload || '').split('\n').map((line) => '  ' + escapeXml(line)),
      '</xog:write>'
    ]
  }
}

export function sqlPreset(
  type: string,
  name: string,
  resultVarPlaceholder: string,
  sqlPlaceholder: string
): NodeDefinition {
  return {
    type,
    name,
    category: 'clarity',
    color: '#2DD4BF',
    namespaces: ['gel', 'sql'],
    fields: [
      {
        key: 'datasource',
        label: 'Datasource',
        kind: 'datasource',
        required: true,
        placeholder: 'Niku'
      },
      { key: 'sql', label: 'SQL', kind: 'sql', required: true, placeholder: sqlPlaceholder },
      { key: 'escapeText', label: 'Escape text', kind: 'select', options: ['false', 'true'] },
      {
        key: 'resultVar',
        label: 'Result variable',
        kind: 'text',
        required: true,
        placeholder: resultVarPlaceholder
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
}
