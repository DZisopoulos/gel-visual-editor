import { describe, expect, it } from 'vitest'
import { createEmptyFlow } from '../../src/shared/flow'
import { parseFlowDocument } from '../../src/shared/schema'

describe('flow schema', () => {
  it('accepts a valid flow and rejects malformed metadata', () => {
    const flow = createEmptyFlow('Schema test')
    expect(parseFlowDocument(flow).meta.name).toBe('Schema test')
    expect(() =>
      parseFlowDocument({ ...flow, meta: { ...flow.meta, scriptType: 'invalid' } })
    ).toThrow()
  })

  it('rejects blocks whose type is not in the registry', () => {
    const flow = createEmptyFlow('Unknown type')
    const withUnknown = {
      ...flow,
      blocks: [{ id: 'a', type: 'future-block', props: {}, enabled: true }]
    }
    expect(() => parseFlowDocument(withUnknown)).toThrow(/future-block/)
  })

  it('rejects an unregistered type nested inside a container', () => {
    const flow = createEmptyFlow('Nested unknown')
    const nested = {
      ...flow,
      blocks: [
        {
          id: 'a',
          type: 'for-each',
          props: {},
          enabled: true,
          children: [{ id: 'b', type: 'future-block', props: {}, enabled: true }]
        }
      ]
    }
    expect(() => parseFlowDocument(nested)).toThrow(/future-block/)
  })
})
