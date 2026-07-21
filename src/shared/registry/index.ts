import type { Block } from '../flow'
import { newId } from '../flow'
import type { NodeDefinition } from './types'
import { setVariable } from './blocks/set-variable'
import { sqlQuery } from './blocks/sql-query'
import { forEach } from './blocks/for-each'
import { logMessage } from './blocks/log-message'
import { rawGel } from './blocks/raw-gel'
import { choose } from './blocks/choose'
import { when } from './blocks/when'
import { otherwise } from './blocks/otherwise'
import { switchBlock } from './blocks/switch'
import { caseBlock } from './blocks/case'
import { defaultBlock } from './blocks/default'
import { tryBlock } from './blocks/try'
import { catchBlock } from './blocks/catch'
import { comment } from './blocks/comment'
import { email } from './blocks/email'
import { xogRead } from './blocks/xog-read'
import { xogWrite } from './blocks/xog-write'
import { soapInvoke } from './blocks/soap-invoke'
import { httpCall } from './blocks/http-call'
import { fileRead } from './blocks/file-read'
import { fileWrite } from './blocks/file-write'
import { ftpTransfer } from './blocks/ftp-transfer'
import { includeScript } from './blocks/include-script'

const defs = new Map<string, NodeDefinition>(
  [
    setVariable, sqlQuery, forEach, logMessage, rawGel,
    choose, when, otherwise, switchBlock, caseBlock, defaultBlock, tryBlock, catchBlock, comment,
    email, xogRead, xogWrite,
    soapInvoke, httpCall, fileRead, fileWrite, ftpTransfer, includeScript
  ].map(d => [d.type, d]))

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
