import { ElectronAPI } from '@electron-toolkit/preload'

export interface GveBridge {
  openFlow(): Promise<{ filePath: string; content: string } | null>
  saveFlow(suggestedName: string, content: string, existingPath: string | null): Promise<string | null>
  exportXml(suggestedName: string, content: string): Promise<string | null>
}

declare global {
  interface Window {
    electron: ElectronAPI
    gve: GveBridge
  }
}
