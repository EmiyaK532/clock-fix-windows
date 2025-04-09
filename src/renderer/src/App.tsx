import { useState } from 'react'
import Clock from './components/Clock'

function App(): JSX.Element {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState<boolean>(false)

  // 现在这个函数仅用于更新UI状态，不再负责与主进程通信
  const handleToggleAlwaysOnTop = (value: boolean): void => {
    setIsAlwaysOnTop(value)
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-transparent">
      <Clock isAlwaysOnTop={isAlwaysOnTop} onToggleAlwaysOnTop={handleToggleAlwaysOnTop} />
    </div>
  )
}

export default App
