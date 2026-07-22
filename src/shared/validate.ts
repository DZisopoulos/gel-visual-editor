import type { Block, Flow } from './flow'
import { getNodeDef } from './registry'

export type ValidationSeverity = 'error' | 'warning' | 'info'
export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  title: string
  message: string
  blockId?: string
}

export function variablesInScope(flow: Flow, targetId: string): string[] {
  const initial = new Set(flow.parameters.map((parameter) => parameter.name).filter(Boolean))
  const walk = (blocks: Block[], available: Set<string>): string[] | null => {
    for (const block of blocks) {
      if (block.id === targetId) return [...available]
      let definition
      try {
        definition = getNodeDef(block.type)
      } catch {
        continue
      }
      const next = new Set(available)
      definition
        .introduces(block.props)
        .filter(Boolean)
        .forEach((variable) => next.add(variable))
      if (block.children) {
        const nested = walk(block.children, next)
        if (nested) return nested
      }
      definition
        .introduces(block.props)
        .filter(Boolean)
        .forEach((variable) => available.add(variable))
    }
    return null
  }
  return walk(flow.blocks, initial) ?? []
}

function label(block: Block): string {
  try {
    return block.props.stepName || getNodeDef(block.type).name
  } catch {
    return block.type
  }
}

function referencedVariables(value: string): string[] {
  const names: string[] = []
  for (const match of value.matchAll(/\$\{\s*([A-Za-z_][\w.]*)/g)) {
    const root = match[1]?.split('.')[0]
    if (root && !names.includes(root)) names.push(root)
  }
  return names
}

export function validateFlow(flow: Flow): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const seen = new Set<string>()
  const scope = new Set(flow.parameters.map((parameter) => parameter.name).filter(Boolean))
  const add = (issue: Omit<ValidationIssue, 'id'>): void => {
    const key = `${issue.severity}:${issue.blockId ?? 'flow'}:${issue.title}:${issue.message}`
    if (seen.has(key)) return
    seen.add(key)
    issues.push({ ...issue, id: `issue-${issues.length + 1}` })
  }

  const walk = (blocks: Block[], available: Set<string>): void => {
    for (const block of blocks) {
      let definition
      try {
        definition = getNodeDef(block.type)
      } catch {
        add({
          severity: 'error',
          title: 'Unknown block type',
          message: `The block type “${block.type}” is not registered.`,
          blockId: block.id
        })
        continue
      }
      const blockName = label(block)
      for (const field of definition.fields) {
        const value = block.props[field.key] ?? ''
        if (field.required && !value.trim())
          add({
            severity: 'error',
            title: 'Required field is empty',
            message: `${field.label} is required on “${blockName}”.`,
            blockId: block.id
          })
        if (field.kind === 'expression' && value.trim()) {
          for (const variable of referencedVariables(value)) {
            if (!available.has(variable))
              add({
                severity: 'warning',
                title: 'Variable may be out of scope',
                message: `“${variable}” is referenced before it is introduced.`,
                blockId: block.id
              })
          }
        }
      }
      if (!block.enabled)
        add({
          severity: 'info',
          title: 'Block is disabled',
          message: `“${blockName}” will be exported as a comment.`,
          blockId: block.id
        })
      if (definition.isContainer && (block.children?.length ?? 0) === 0)
        add({
          severity: 'warning',
          title: 'Empty container',
          message: `“${blockName}” has no child blocks.`,
          blockId: block.id
        })

      const introduced = definition.introduces(block.props).filter(Boolean)
      for (const variable of introduced) {
        if (available.has(variable))
          add({
            severity: 'warning',
            title: 'Variable is already in scope',
            message: `“${variable}” is introduced again by “${blockName}”.`,
            blockId: block.id
          })
      }
      const nextScope = new Set(available)
      introduced.forEach((variable) => nextScope.add(variable))
      if (block.children) walk(block.children, nextScope)
      introduced.forEach((variable) => available.add(variable))
    }
  }

  walk(flow.blocks, scope)
  if (!flow.meta.name.trim())
    add({
      severity: 'warning',
      title: 'Flow has no name',
      message: 'Give the flow a name before exporting.'
    })
  return issues
}
