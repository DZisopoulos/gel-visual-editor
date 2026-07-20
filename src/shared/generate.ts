import type { Block, Flow } from './flow'
import { getNodeDef } from './registry'
import { escapeAttr } from './xmlutil'

const NS_URI: Record<string, string> = {
  gel: 'jelly:com.niku.union.gel.GELTagLibrary',
  core: 'jelly:core',
  sql: 'jelly:sql'
}

function collectNamespaces(blocks: Block[], acc: Set<string>): void {
  for (const blk of blocks) {
    for (const ns of getNodeDef(blk.type).namespaces) acc.add(ns)
    if (blk.children) collectNamespaces(blk.children, acc)
  }
}

function renderBlocks(blocks: Block[]): string[] {
  const lines: string[] = []
  for (const blk of blocks) {
    const def = getNodeDef(blk.type)
    const body = def.toGel(blk, renderBlocks)
    if (!blk.enabled) {
      lines.push(`<!-- disabled: ${blk.props.stepName || def.name}`)
      lines.push(...body.map(l => l.replace(/--/g, '- -')))
      lines.push('-->')
    } else {
      if (blk.props.stepName) lines.push(`<!-- Step: ${blk.props.stepName.replace(/--/g, '- -')} -->`)
      lines.push(...body)
    }
  }
  return lines
}

export function generateGel(flow: Flow): string {
  const ns = new Set<string>(['gel'])
  if (flow.parameters.length > 0) ns.add('core')
  collectNamespaces(flow.blocks, ns)
  const sorted = [...ns].sort()
  const head = sorted
    .map((n, i) => `${i === 0 ? '<gel:script ' : '            '}xmlns:${n}="${NS_URI[n]}"`)
  const lines = [...head.slice(0, -1), head[head.length - 1] + '>']
  for (const p of flow.parameters)
    lines.push(`  <gel:parameter var="${escapeAttr(p.name)}" default="${escapeAttr(p.default)}"/>`)
  lines.push(...renderBlocks(flow.blocks).map(l => '  ' + l))
  lines.push('</gel:script>')
  return lines.join('\n') + '\n'
}
