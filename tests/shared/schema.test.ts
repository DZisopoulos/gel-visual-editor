import { describe, expect, it } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { parseFlowDocument } from '../../src/shared/schema'

describe('flow schema', () => {
  it('accepts a valid flow and rejects malformed metadata', () => {
    const flow = createEmptyFlow('Schema test')
    expect(parseFlowDocument(flow).meta.name).toBe('Schema test')
    expect(() => parseFlowDocument({ ...flow, meta: { ...flow.meta, scriptType: 'invalid' } })).toThrow()
  })
})
