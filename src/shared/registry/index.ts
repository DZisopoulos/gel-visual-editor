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
import { ifBlock } from './blocks/if'
import { whileBlock } from './blocks/while'
import { removeVariable } from './blocks/remove-variable'
import { newObject } from './blocks/new-object'
import { invokeMethod } from './blocks/invoke-method'
import { invokeStatic } from './blocks/invoke-static'
import { methodArg } from './blocks/method-arg'
import { useBean } from './blocks/use-bean'
import { captureToFile } from './blocks/capture-to-file'
import { importScript } from './blocks/import-script'
import { printExpression } from './blocks/print-expression'
import { releaseDatasource } from './blocks/release-datasource'
import { currentDate } from './blocks/current-date'
import { sleep } from './blocks/sleep'
import { xogReadProject } from './blocks/xog-read-project'
import { xogWriteProject } from './blocks/xog-write-project'
import { xogReadResource } from './blocks/xog-read-resource'
import { xogWriteResource } from './blocks/xog-write-resource'
import { xogReadObs } from './blocks/xog-read-obs'
import { xogWriteObs } from './blocks/xog-write-obs'
import { xogReadCustomObject } from './blocks/xog-read-custom-object'
import { xogWriteCustomObject } from './blocks/xog-write-custom-object'
import { setCustomField } from './blocks/set-custom-field'
import { lookupResourceByUsername } from './blocks/lookup-resource-by-username'
import { lookupProjectByCode } from './blocks/lookup-project-by-code'
import { getProjectTasks } from './blocks/get-project-tasks'
import { getResourceAllocation } from './blocks/get-resource-allocation'
import { getTimesheetStatus } from './blocks/get-timesheet-status'
import { getCostPlanSummary } from './blocks/get-cost-plan-summary'
import { translateLookupValue } from './blocks/translate-lookup-value'
import { getSecurityGroupMembers } from './blocks/get-security-group-members'

const defs = new Map<string, NodeDefinition>(
  [
    setVariable, sqlQuery, forEach, logMessage, rawGel,
    choose, when, otherwise, switchBlock, caseBlock, defaultBlock, tryBlock, catchBlock, comment,
    email, xogRead, xogWrite,
    soapInvoke, httpCall, fileRead, fileWrite, ftpTransfer, includeScript,
    ifBlock, whileBlock, removeVariable, newObject, invokeMethod, invokeStatic, methodArg,
    useBean, captureToFile, importScript, printExpression,
    releaseDatasource, currentDate, sleep,
    xogReadProject, xogWriteProject, xogReadResource, xogWriteResource,
    xogReadObs, xogWriteObs, xogReadCustomObject, xogWriteCustomObject, setCustomField,
    lookupResourceByUsername, lookupProjectByCode, getProjectTasks, getResourceAllocation,
    getTimesheetStatus, getCostPlanSummary, translateLookupValue, getSecurityGroupMembers
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
