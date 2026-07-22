import { useEffect } from 'react'
import type { Flow } from '../../../shared/flow'
import { parseFlowDocument } from '../../../shared/schema'
import { redactSecrets } from '../../../shared/roundtrip'
import { readJson, removeJson, writeJson } from '../localStorage'
import type { useDialog } from '../components/DialogProvider'

export const AUTOSAVE_KEY = 'gve-autosave-draft'
const AUTOSAVE_VERSION = 1

interface UseAutosaveParams {
  dirty: boolean
  flow: Flow
  loadFlow: (flow: Flow, filePath: string | null) => void
  dialog: ReturnType<typeof useDialog>
}

// Owns the two localStorage-backed autosave effects: offering to recover a
// draft once when the shell mounts, and debounced-saving (redacting secret
// fields first, per plan 003) whenever the flow is dirty.
export function useAutosave({ dirty, flow, loadFlow, dialog }: UseAutosaveParams): void {
  useEffect(() => {
    const saved = readJson<unknown>(AUTOSAVE_KEY, AUTOSAVE_VERSION, null)
    if (!saved) return
    try {
      const recovered = parseFlowDocument(saved)
      void dialog
        .confirm('Recover unsaved draft?', `Recover the unsaved draft “${recovered.meta.name}”?`, {
          confirmLabel: 'Recover',
          cancelLabel: 'Discard'
        })
        .then((accepted) => {
          if (accepted) loadFlow(recovered, null)
          else removeJson(AUTOSAVE_KEY)
        })
    } catch {
      removeJson(AUTOSAVE_KEY)
    }
    // Recovery is intentionally offered once when the shell mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!dirty) {
      removeJson(AUTOSAVE_KEY)
      return
    }
    const timer = window.setTimeout(
      () => writeJson(AUTOSAVE_KEY, AUTOSAVE_VERSION, redactSecrets(flow)),
      800
    )
    return () => window.clearTimeout(timer)
  }, [dirty, flow])
}
