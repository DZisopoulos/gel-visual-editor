import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

/** webContents ids whose renderer currently holds unsaved changes. */
const unsavedContents = new Set<number>()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    frame: false,
    backgroundColor: '#0F1218',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Guard every close path — the in-app titlebar button, Alt+F4 and app quit
  // all funnel through here, unlike the renderer-side prompts on New and Open.
  const contentsId = mainWindow.webContents.id
  let confirmedClose = false
  let closeRequestPending = false
  mainWindow.on('close', event => {
    if (confirmedClose || !unsavedContents.has(contentsId)) return
    event.preventDefault()
    if (closeRequestPending) return
    closeRequestPending = true
    mainWindow.webContents.send('gve:window:request-close')
  })

  ipcMain.on('gve:window:close-response', (event, discard: boolean) => {
    if (event.sender.id !== contentsId) return
    closeRequestPending = false
    if (!discard) return
    confirmedClose = true
    mainWindow.close()
  })

  mainWindow.on('closed', () => {
    unsavedContents.delete(contentsId)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.dzisopoulos.gve')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('gve:openFlow', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'GVE Flow', extensions: ['gve'] },
        { name: 'GVE Export', extensions: ['xml'] }
      ]
    })
    if (result.canceled || result.filePaths.length === 0) return null

    const filePath = result.filePaths[0]
    app.addRecentDocument(filePath)
    return { filePath, content: await readFile(filePath, 'utf8') }
  })

  ipcMain.handle(
    'gve:saveFlow',
    async (_event, suggestedName: string, content: string, existingPath: string | null) => {
      let filePath = existingPath
      if (!filePath) {
        const result = await dialog.showSaveDialog({
          defaultPath: withExtension(suggestedName, '.gve'),
          filters: [{ name: 'GVE Flow', extensions: ['gve'] }]
        })
        if (result.canceled || !result.filePath) return null
        filePath = result.filePath
      }

      await atomicWrite(filePath, content)
      app.addRecentDocument(filePath)
      return filePath
    }
  )

  ipcMain.handle('gve:exportXml', async (_event, suggestedName: string, content: string) => {
    const result = await dialog.showSaveDialog({
      defaultPath: withExtension(suggestedName, '.xml'),
      filters: [{ name: 'GVE Export', extensions: ['xml'] }]
    })
    if (result.canceled || !result.filePath) return null

    await atomicWrite(result.filePath, content)
    app.addRecentDocument(result.filePath)
    return result.filePath
  })

  ipcMain.on('gve:window:set-dirty', (event, dirty: boolean) => {
    if (dirty) unsavedContents.add(event.sender.id)
    else unsavedContents.delete(event.sender.id)
  })

  ipcMain.handle('gve:window:minimize', event => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('gve:window:toggle-maximize', event => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return false
    if (window.isMaximized()) window.unmaximize()
    else window.maximize()
    return window.isMaximized()
  })

  ipcMain.handle('gve:window:is-maximized', event => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  ipcMain.handle('gve:window:close', event => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function withExtension(fileName: string, extension: '.gve' | '.xml'): string {
  const safeName = fileName.trim() || 'Untitled Flow'
  return safeName.toLowerCase().endsWith(extension) ? safeName : `${safeName}${extension}`
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const temporaryPath = `${filePath}.gve-writing-${process.pid}-${Date.now()}`
  await writeFile(temporaryPath, content, 'utf8')
  await rename(temporaryPath, filePath)
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
