export type ScriptType = 'process-step' | 'standalone'
export interface FlowMeta { name: string; description: string; scriptType: ScriptType }
export interface FlowParameter { name: string; type: 'string' | 'number' | 'date'; default: string }
export interface Block {
  id: string; type: string; props: Record<string, string>; enabled: boolean; children?: Block[]
}
export interface Flow {
  gveVersion: '1.0'; meta: FlowMeta; parameters: FlowParameter[]; datasources: string[]; blocks: Block[]
}
export function newId(): string { return crypto.randomUUID() }
export function createEmptyFlow(name = 'Untitled Flow'): Flow {
  return {
    gveVersion: '1.0',
    meta: { name, description: '', scriptType: 'process-step' },
    parameters: [], datasources: ['Niku'], blocks: []
  }
}
