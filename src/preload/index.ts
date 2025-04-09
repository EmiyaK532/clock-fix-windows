import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 添加时钟应用所需的API
  toggleAlwaysOnTop: (value: boolean): void => {
    ipcRenderer.send('toggle-always-on-top', value)
  },

  // 获取当前窗口的置顶状态
  getAlwaysOnTop: (): Promise<boolean> => {
    return ipcRenderer.invoke('get-always-on-top')
  },

  // 监听置顶状态变化
  onAlwaysOnTopChanged: (callback: (value: boolean) => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, value: boolean) => callback(value)
    ipcRenderer.on('always-on-top-changed', listener)

    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('always-on-top-changed', listener)
    }
  },

  // 自动启动相关API
  toggleAutoLaunch: (value: boolean): void => {
    ipcRenderer.send('toggle-auto-launch', value)
  },

  // 获取自动启动状态
  getAutoLaunch: (): Promise<boolean> => {
    return ipcRenderer.invoke('get-auto-launch')
  },

  // 监听自动启动状态变化
  onAutoLaunchChanged: (callback: (value: boolean) => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, value: boolean) => callback(value)
    ipcRenderer.on('auto-launch-changed', listener)

    // 返回清理函数
    return () => {
      ipcRenderer.removeListener('auto-launch-changed', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
