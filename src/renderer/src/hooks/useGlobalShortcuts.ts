import { useEffect } from 'react'

interface UseGlobalShortcutsParams {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  setFocusMode: (update: (value: boolean) => boolean) => void
  selectedId: string | null
  select: (id: string | null) => void
  remove: (id: string) => void
  undo: () => void
  redo: () => void
}

// Owns the single global keydown listener routing every app-wide keyboard
// shortcut: Ctrl/Cmd+K (command palette), Ctrl/Cmd+Shift+F (focus mode),
// Ctrl/Cmd+Z / Ctrl/Cmd+Y (undo/redo), Delete/Backspace (remove selection),
// and Escape (deselect, plan 012) — skipped while typing or while the
// command palette is open, matching the pre-extraction behavior.
export function useGlobalShortcuts({
  commandOpen,
  setCommandOpen,
  setFocusMode,
  selectedId,
  select,
  remove,
  undo,
  redo
}: UseGlobalShortcutsParams): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
        return
      }
      if (isTyping || commandOpen) return
      if (event.key === 'Escape') {
        event.preventDefault()
        select(null)
        return
      }
      if (modifier && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFocusMode((value) => !value)
        return
      }
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        remove(selectedId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [commandOpen, redo, remove, select, selectedId, setCommandOpen, setFocusMode, undo])
}
