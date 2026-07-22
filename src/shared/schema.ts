import type { Block, Flow, FlowDatasource, FlowMeta, FlowParameter } from './flow'
import { newId } from './flow'
import { getNodeDef } from './registry'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function parseBlock(value: unknown): Block {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.type !== 'string' ||
    typeof value.enabled !== 'boolean' ||
    !isRecord(value.props)
  )
    throw new Error('A block has an invalid shape.')
  // Reject unregistered types here: the canvas, inspector and generator all call
  // getNodeDef without a guard, so an unknown type would throw mid-render.
  try {
    getNodeDef(value.type)
  } catch {
    throw new Error(`The block type “${value.type}” is not supported by this version of GVE.`)
  }
  const block: Block = {
    id: value.id,
    type: value.type,
    props: Object.fromEntries(
      Object.entries(value.props).map(([key, entry]) => [key, String(entry ?? '')])
    ),
    enabled: value.enabled
  }
  if (value.children !== undefined) {
    if (!Array.isArray(value.children))
      throw new Error(`Children for ${value.type} must be an array.`)
    block.children = value.children.map(parseBlock)
  }
  return block
}

export function parseFlowDocument(value: unknown): Flow {
  if (
    !isRecord(value) ||
    value.gveVersion !== '1.0' ||
    !isRecord(value.meta) ||
    !Array.isArray(value.parameters) ||
    !Array.isArray(value.datasources) ||
    !Array.isArray(value.blocks)
  )
    throw new Error('Flow file has an unexpected shape.')
  const meta = value.meta as Partial<FlowMeta>
  if (
    typeof meta.name !== 'string' ||
    typeof meta.description !== 'string' ||
    (meta.scriptType !== 'process-step' && meta.scriptType !== 'standalone')
  )
    throw new Error('Flow metadata is invalid.')
  // `id` was added to parameters and datasources after 1.0 shipped. Older
  // saved/exported documents won't have it — backfill a fresh id at parse
  // time so those files keep loading instead of failing validation.
  const parameters: FlowParameter[] = value.parameters.map((parameter) => {
    if (
      !isRecord(parameter) ||
      typeof parameter.name !== 'string' ||
      typeof parameter.default !== 'string' ||
      !['string', 'number', 'date'].includes(String(parameter.type))
    )
      throw new Error('A flow parameter is invalid.')
    return {
      id: typeof parameter.id === 'string' ? parameter.id : newId(),
      name: parameter.name,
      type: parameter.type as FlowParameter['type'],
      default: parameter.default
    }
  })
  const datasources: FlowDatasource[] = value.datasources.map((datasource) => {
    // Pre-migration documents store datasources as plain strings.
    if (typeof datasource === 'string') return { id: newId(), value: datasource }
    if (isRecord(datasource) && typeof datasource.value === 'string')
      return {
        id: typeof datasource.id === 'string' ? datasource.id : newId(),
        value: datasource.value
      }
    throw new Error('Flow datasources are invalid.')
  })
  return {
    gveVersion: '1.0',
    meta: { name: meta.name, description: meta.description, scriptType: meta.scriptType },
    parameters,
    datasources,
    blocks: value.blocks.map(parseBlock)
  }
}
