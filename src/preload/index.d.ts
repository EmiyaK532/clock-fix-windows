import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  toggleAlwaysOnTop: (value: boolean) => void
  getAlwaysOnTop: () => Promise<boolean>
  onAlwaysOnTopChanged: (callback: (value: boolean) => void) => () => void

  // 自动启动相关API
  toggleAutoLaunch: (value: boolean) => void
  getAutoLaunch: () => Promise<boolean>
  onAutoLaunchChanged: (callback: (value: boolean) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
