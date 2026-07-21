import type { NodeDefinition } from '../types'
import { escapeAttr, escapeXml } from '../../xmlutil'

export const email: NodeDefinition = {
  type: 'email', name: 'Send Email', category: 'clarity', color: '#2DD4BF',
  namespaces: ['gel'],
  fields: [
    { key: 'from', label: 'From', kind: 'text', required: true },
    { key: 'to', label: 'To', kind: 'text', required: true },
    { key: 'cc', label: 'CC', kind: 'text' },
    { key: 'bcc', label: 'BCC', kind: 'text' },
    { key: 'subject', label: 'Subject', kind: 'text', required: true },
    { key: 'body', label: 'Body', kind: 'textarea', required: true }
  ],
  introduces: () => [],
  toGel: block => [
    `<gel:email from="${escapeAttr(block.props.from || '')}" to="${escapeAttr(block.props.to || '')}" cc="${escapeAttr(block.props.cc || '')}" bcc="${escapeAttr(block.props.bcc || '')}" subject="${escapeAttr(block.props.subject || '')}">${escapeXml(block.props.body || '')}</gel:email>`
  ]
}
