export interface GveBridge {
  openFlow(): Promise<{ filePath: string; content: string } | null>
  saveFlow(
    suggestedName: string,
    content: string,
    existingPath: string | null
  ): Promise<string | null>
  exportXml(suggestedName: string, content: string): Promise<string | null>
  setDirty(dirty: boolean): void
  onCloseRequest(listener: () => void): () => void
  respondToClose(discard: boolean): void
  window: {
    minimize(): Promise<void>
    toggleMaximize(): Promise<boolean>
    isMaximized(): Promise<boolean>
    close(): Promise<void>
  }
}

declare global {
  interface Window {
    gve: GveBridge
  }
}
