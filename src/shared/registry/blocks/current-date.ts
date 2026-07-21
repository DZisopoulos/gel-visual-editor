import type { NodeDefinition } from '../types'
import { escapeAttr } from '../../xmlutil'

export const currentDate: NodeDefinition = {
  type: 'current-date', name: 'Current Date', category: 'clarity', color: '#2DD4BF',
  namespaces: ['gel'],
  fields: [
    { key: 'format', label: 'Format', kind: 'text', placeholder: 'yyyy-MM-dd' },
    { key: 'resultVar', label: 'Result variable', kind: 'text', required: true, placeholder: 'today' }
  ],
  introduces: p => (p.resultVar ? [p.resultVar] : []),
  toGel: block => [`<gel:date format="${escapeAttr(block.props.format || 'yyyy-MM-dd')}" var="${escapeAttr(block.props.resultVar)}"/>`]
}
