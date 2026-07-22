import type { Block } from '../flow'

export type FieldKind = 'text' | 'textarea' | 'sql' | 'xml' | 'expression' | 'select' | 'datasource'
export interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  required?: boolean
  options?: string[]
  placeholder?: string
}
export type RenderChildren = (blocks: Block[]) => string[]
export interface NodeDefinition {
  type: string
  name: string
  category: 'core' | 'data' | 'integration' | 'clarity' | 'advanced'
  color: string
  isContainer?: boolean
  namespaces: string[]
  fields: FieldDef[]
  introduces(props: Record<string, string>): string[]
  toGel(block: Block, renderChildren: RenderChildren): string[]
}
