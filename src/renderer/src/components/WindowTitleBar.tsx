import { useEffect, useState } from 'react'

function WindowTitleBar(): React.JSX.Element {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const controls = window.gve?.window
    if (!controls) return
    void controls.isMaximized().then(setMaximized)
  }, [])

  const minimize = (): void => {
    void window.gve?.window.minimize()
  }
  const toggleMaximize = (): void => {
    const controls = window.gve?.window
    if (!controls) return
    void controls.toggleMaximize().then(setMaximized)
  }
  const close = (): void => {
    void window.gve?.window.close()
  }

  return (
    <div className="gve-titlebar" onDoubleClick={toggleMaximize}>
      <div className="gve-titlebar-brand">
        <span className="gve-titlebar-mark">GVE</span>
        <span>GEL Visual Editor</span>
      </div>
      <div className="gve-window-controls">
        <button
          type="button"
          className="gve-window-control"
          aria-label="Minimize"
          title="Minimize"
          onClick={minimize}
        >
          −
        </button>
        <button
          type="button"
          className="gve-window-control"
          aria-label={maximized ? 'Restore' : 'Maximize'}
          title={maximized ? 'Restore' : 'Maximize'}
          onClick={toggleMaximize}
        >
          {maximized ? '❐' : '□'}
        </button>
        <button
          type="button"
          className="gve-window-control gve-window-control-close"
          aria-label="Close"
          title="Close"
          onClick={close}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default WindowTitleBar
