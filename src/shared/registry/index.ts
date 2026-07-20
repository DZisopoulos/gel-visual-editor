import type { Block } from '../flow'
import { newId } from '../flow'
import type { NodeDefinition } from './types'
import { setVariable } from './blocks/set-variable'
import { sqlQuery } from './blocks/sql-query'
import { forEach } from './blocks/for-each'
import { logMessage } from './blocks/log-message'
import { rawGel } from './blocks/raw-gel'

const defs = new Map<string, NodeDefinition>(
  [setVariable, sqlQuery, forEach, logMessage, rawGel].map(d => [d.type, d]))

export function getNodeDef(type: string): NodeDefinition {
  const def = defs.get(type)
  if (!def) throw new Error(`Unknown node type: ${type}`)
  return def
}
export function allNodeDefs(): NodeDefinition[] { return [...defs.values()] }
export function createBlock(type: string): Block {
  const def = getNodeDef(type)
  const props: Record<string, string> = { stepName: '' }
  for (const f of def.fields) props[f.key] = f.kind === 'select' ? (f.options?.[0] ?? '') : ''
  return { id: newId(), type, props, enabled: true, ...(def.isContainer ? { children: [] } : {}) }
}
