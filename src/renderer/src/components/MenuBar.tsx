import { useEffect, useRef, useState } from 'react'
import { createEmptyFlow } from '../../../shared/flow'
import { useGve } from '../store'
import Header from './Header'

type MenuId = 'file' | 'edit' | 'view' | 'help'
interface MenuBarProps {
  activeView: 'flow' | 'xml' | 'validate'
  onViewChange: (view: 'flow' | 'xml' | 'validate') => void
  onOpenCommandPalette: () => void
  onAbout: () => void
  onResetLayout: () => void
  focusMode: boolean
  onToggleFocusMode: () => void
}

function MenuBar({ activeView, onViewChange, onOpenCommandPalette, onAbout, onResetLayout, focusMode, onToggleFocusMode }: MenuBarProps): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const dirty = useGve(s => s.dirty)
  const loadFlow = useGve(s => s.loadFlow)
  const undo = useGve(s => s.undo)
  const redo = useGve(s => s.redo)
  const canUndo = useGve(s => s.past.length > 0)
  const canRedo = useGve(s => s.future.length > 0)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const close = (): void => setOpenMenu(null)
  const newFlow = (): void => {
    if (dirty && !window.confirm('Discard your unsaved changes and start a new flow?')) return
    loadFlow(createEmptyFlow(), null)
    close()
  }

  const item = (label: string, action: () => void, disabled = false, hint?: string): React.JSX.Element => (
    <button type="button" className="gve-menu-item" disabled={disabled} onClick={() => { action(); if (!disabled) close() }}>
      <span>{label}</span>{hint && <kbd>{hint}</kbd>}
    </button>
  )

  return (
    <nav className="gve-menubar" aria-label="Application menu" ref={menuRef}>
      <div className="gve-menu-groups">
        {(['file', 'edit', 'view', 'help'] as const).map(menu => (
          <div className="gve-menu" key={menu}>
            <button type="button" className={`gve-menu-trigger${openMenu === menu ? ' gve-menu-trigger-open' : ''}`} aria-haspopup="true" aria-expanded={openMenu === menu} onClick={() => setOpenMenu(current => current === menu ? null : menu)}>
              {menu[0].toUpperCase() + menu.slice(1)}
            </button>
            {openMenu === menu && <div className="gve-menu-popover">
              {menu === 'file' && <>
                {item('New flow', newFlow, false, 'Ctrl+N')}
                {item('Command palette', () => { onOpenCommandPalette(); close() }, false, 'Ctrl+K')}
              </>}
              {menu === 'edit' && <>
                {item('Undo', () => undo(), !canUndo, 'Ctrl+Z')}
                {item('Redo', () => redo(), !canRedo, 'Ctrl+Y')}
              </>}
              {menu === 'view' && <>
                {item('Flow canvas', () => onViewChange('flow'), activeView === 'flow')}
                {item('XML preview', () => onViewChange('xml'), activeView === 'xml')}
                {item('Validate flow', () => onViewChange('validate'), activeView === 'validate')}
                <div className="gve-menu-separator" />
                {item(focusMode ? 'Exit focus mode' : 'Focus mode', onToggleFocusMode, false, 'Ctrl+Shift+F')}
                {item('Reset panel layout', onResetLayout)}
              </>}
              {menu === 'help' && <>
                {item('Command palette', () => { onOpenCommandPalette(); close() }, false, 'Ctrl+K')}
                {item('About GVE', () => { onAbout(); close() })}
                <div className="gve-menu-separator" />
                <div className="gve-menu-version">GVE · Version 1.0.0</div>
              </>}
            </div>}
          </div>
        ))}
      </div>
      <Header />
      <button type="button" className="gve-menubar-command" onClick={onOpenCommandPalette} title="Open command palette (Ctrl/Cmd K)">
        <span>Search commands</span><kbd>Ctrl K</kbd>
      </button>
    </nav>
  )
}

export default MenuBar
