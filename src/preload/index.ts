import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const gve = {
  openFlow: (): Promise<{ filePath: string; content: string } | null> =>
    ipcRenderer.invoke('gve:openFlow'),
  saveFlow: (suggestedName: string, content: string, existingPath: string | null): Promise<string | null> =>
    ipcRenderer.invoke('gve:saveFlow', suggestedName, content, existingPath),
  exportXml: (suggestedName: string, content: string): Promise<string | null> =>
    ipcRenderer.invoke('gve:exportXml', suggestedName, content),
  setDirty: (dirty: boolean): void => {
    ipcRenderer.send('gve:window:set-dirty', dirty)
  },
  onCloseRequest: (listener: () => void): (() => void) => {
    const handler = (): void => listener()
    ipcRenderer.on('gve:window:request-close', handler)
    return () => ipcRenderer.removeListener('gve:window:request-close', handler)
  },
  respondToClose: (discard: boolean): void => {
    ipcRenderer.send('gve:window:close-response', discard)
  },
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('gve:window:minimize'),
    toggleMaximize: (): Promise<boolean> => ipcRenderer.invoke('gve:window:toggle-maximize'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('gve:window:is-maximized'),
    close: (): Promise<void> => ipcRenderer.invoke('gve:window:close')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('gve', gve)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.gve = gve
}
