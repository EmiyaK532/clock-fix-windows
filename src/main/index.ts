import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

// 设置自启动
function setAutoLaunch(enable: boolean): void {
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath
    })
  }
}

// 检查是否设置了自启动
function isAutoLaunchEnabled(): boolean {
  if (process.platform === 'win32') {
    return app.getLoginItemSettings().openAtLogin
  }
  return false
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300, // 默认时钟窗口宽度
    height: 150, // 默认时钟窗口高度
    show: false,
    autoHideMenuBar: true,
    frame: false, // 无边框窗口
    transparent: true, // 透明背景
    resizable: true, // 允许调整大小
    alwaysOnTop: false, // 默认不置顶
    skipTaskbar: false, // 在任务栏显示
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) mainWindow.show()
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
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 添加IPC通信处理置顶切换 - 优化实现
  ipcMain.on('toggle-always-on-top', (_, value) => {
    if (!mainWindow) return

    if (process.platform === 'win32') {
      // 对Windows平台使用专门的处理函数
      ensureWindowAlwaysOnTopForWindows(mainWindow, value)
    } else {
      // 非Windows平台使用标准方式
      mainWindow.setAlwaysOnTop(value, 'screen-saver') // 使用screen-saver级别，这是最高级别的置顶

      // 如果设置为置顶，确保窗口可见
      if (value) {
        // 在某些系统上需要先取消焦点再重新获取焦点以确保置顶生效
        mainWindow.blur()
        mainWindow.focus()
      }
    }

    // 通知渲染进程置顶状态已更改
    mainWindow.webContents.send('always-on-top-changed', value)
  })

  // 获取当前置顶状态
  ipcMain.handle('get-always-on-top', () => {
    if (!mainWindow) return false
    return mainWindow.isAlwaysOnTop()
  })

  // 添加自动启动相关的IPC
  ipcMain.on('toggle-auto-launch', (_, value) => {
    setAutoLaunch(value)
    if (mainWindow) {
      mainWindow.webContents.send('auto-launch-changed', value)
    }
  })

  ipcMain.handle('get-auto-launch', () => {
    return isAutoLaunchEnabled()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

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

// Windows平台特殊处理置顶函数
function ensureWindowAlwaysOnTopForWindows(window: BrowserWindow, value: boolean): void {
  if (!window) return

  if (value) {
    // 先关闭置顶
    window.setAlwaysOnTop(false)

    // 设置多种级别的置顶尝试
    const levels = ['screen-saver', 'always-on-top', 'pop-up-menu', 'floating']

    // 尝试不同的置顶级别
    let currentLevelIndex = 0

    const tryNextLevel = () => {
      if (currentLevelIndex < levels.length) {
        const level = levels[currentLevelIndex] as any
        window.setAlwaysOnTop(true, level)
        window.show()
        window.focus()

        // 检查是否真的置顶
        if (window.isAlwaysOnTop()) {
          console.log(`置顶成功，使用级别: ${level}`)
        } else {
          // 如果没有成功，尝试下一个级别
          currentLevelIndex++
          setTimeout(tryNextLevel, 100)
        }
      }
    }

    // 开始尝试
    tryNextLevel()
  } else {
    // 关闭置顶
    window.setAlwaysOnTop(false)
  }
}
