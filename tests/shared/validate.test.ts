import { describe, expect, it } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { createBlock } from '../../src/shared/registry'
import { validateFlow, variablesInScope } from '../../src/shared/validate'

describe('flow validation', () => {
  it('reports missing required fields and empty containers', () => {
    const flow = createEmptyFlow()
    flow.blocks = [createBlock('sql-query'), createBlock('for-each')]
    const issues = validateFlow(flow)
    expect(issues.some(issue => issue.title === 'Required field is empty')).toBe(true)
    expect(issues.some(issue => issue.title === 'Empty container')).toBe(true)
  })

  it('tracks variables introduced above a selected nested block', () => {
    const flow = createEmptyFlow()
    const query = createBlock('sql-query'); query.props.resultVar = 'rows'
    const loop = createBlock('for-each'); loop.props.varName = 'row'
    const log = createBlock('log-message'); loop.children = [log]
    flow.blocks = [query, loop]
    expect(variablesInScope(flow, log.id)).toEqual(['rows', 'row'])
  })
})
