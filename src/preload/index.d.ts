import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  toggleAlwaysOnTop: (value: boolean) => void
  getAlwaysOnTop: () => Promise<boolean>
  onAlwaysOnTopChanged: (callback: (value: boolean) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
