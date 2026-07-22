import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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

  it('backfills ids for pre-migration parameters and datasources', () => {
    const flow = createEmptyFlow('Old format')
    const legacy = {
      ...flow,
      parameters: [{ name: 'projectId', type: 'string', default: '' }],
      datasources: ['Niku', 'Warehouse']
    }
    const parsed = parseFlowDocument(legacy)
    expect(parsed.parameters).toHaveLength(1)
    expect(typeof parsed.parameters[0].id).toBe('string')
    expect(parsed.parameters[0].id.length).toBeGreaterThan(0)
    expect(parsed.parameters[0].name).toBe('projectId')
    expect(parsed.datasources.map((d) => d.value)).toEqual(['Niku', 'Warehouse'])
    expect(parsed.datasources.every((d) => typeof d.id === 'string' && d.id.length > 0)).toBe(true)
  })

  it('preserves existing ids on already-migrated parameters and datasources', () => {
    const flow = createEmptyFlow('New format')
    const withIds = {
      ...flow,
      parameters: [{ id: 'p1', name: 'projectId', type: 'string', default: '' }],
      datasources: [{ id: 'd1', value: 'Niku' }]
    }
    const parsed = parseFlowDocument(withIds)
    expect(parsed.parameters[0].id).toBe('p1')
    expect(parsed.datasources[0].id).toBe('d1')
  })

  it('loads a real pre-migration .gve fixture (no parameter/datasource ids)', () => {
    const raw = readFileSync(join(__dirname, '../../examples/risk-escalation.gve'), 'utf-8')
    const parsed = parseFlowDocument(JSON.parse(raw))
    expect(parsed.parameters.map((p) => p.name)).toEqual(['varianceThresholdPct', 'notifyList'])
    expect(parsed.parameters.every((p) => typeof p.id === 'string' && p.id.length > 0)).toBe(true)
    expect(parsed.datasources.map((d) => d.value)).toEqual(['Niku'])
    expect(parsed.datasources.every((d) => typeof d.id === 'string' && d.id.length > 0)).toBe(true)
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
