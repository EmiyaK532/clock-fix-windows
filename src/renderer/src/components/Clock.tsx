import React, { useState, useEffect, useRef } from 'react'

interface ClockProps {
  isAlwaysOnTop: boolean
  onToggleAlwaysOnTop: (value: boolean) => void
}

function Clock({ isAlwaysOnTop, onToggleAlwaysOnTop }: ClockProps): JSX.Element {
  const [time, setTime] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const clockRef = useRef<HTMLDivElement>(null)
  const [isAutoLaunch, setIsAutoLaunch] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // 用于跟踪调整大小和拖动
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const [resizeType, setResizeType] = useState<string>('')
  const [clockSize, setClockSize] = useState({ width: 300, height: 150 })
  const [clockPosition, setClockPosition] = useState({ x: 0, y: 0 })

  // 监听主进程发来的置顶状态变化
  useEffect(() => {
    // 注册事件监听器
    const cleanup = window.api.onAlwaysOnTopChanged((value) => {
      // 如果从主进程接收到的状态与当前状态不同，则更新状态
      if (value !== isAlwaysOnTop) {
        onToggleAlwaysOnTop(value)
      }
    })

    // 获取初始置顶状态
    window.api.getAlwaysOnTop().then((value) => {
      if (value !== isAlwaysOnTop) {
        onToggleAlwaysOnTop(value)
      }
    })

    // 组件卸载时清理监听器
    return cleanup
  }, [isAlwaysOnTop, onToggleAlwaysOnTop])

  // 监听主进程发来的自动启动状态变化
  useEffect(() => {
    // 注册事件监听器
    const cleanup = window.api.onAutoLaunchChanged((value) => {
      setIsAutoLaunch(value)
    })

    // 获取初始自动启动状态
    window.api.getAutoLaunch().then((value) => {
      setIsAutoLaunch(value)
    })

    // 组件卸载时清理监听器
    return cleanup
  }, [])

  useEffect(() => {
    // 更新时间的函数
    const updateTime = (): void => {
      const now = new Date()

      // 格式化时间 (小时:分钟:秒钟)
      const timeString = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })

      // 格式化日期 (年月日)
      const dateString = now.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })

      setTime(timeString)
      setDate(dateString)
    }

    // 初次加载时立即更新时间
    updateTime()

    // 设置每秒更新一次时间的定时器
    const timerId = setInterval(updateTime, 1000)

    // 清理函数 - 当组件卸载时清除定时器
    return () => clearInterval(timerId)
  }, [])

  // 拖动相关处理
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target instanceof HTMLInputElement) return // 避免点击复选框时触发拖动
    setIsDragging(true)
    setDragStartPos({
      x: e.clientX - clockPosition.x,
      y: e.clientY - clockPosition.y
    })
  }

  // 调整大小相关处理
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, type: string): void => {
    e.stopPropagation() // 阻止事件冒泡
    setIsResizing(true)
    setResizeType(type)
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (isDragging) {
        setClockPosition({
          x: e.clientX - dragStartPos.x,
          y: e.clientY - dragStartPos.y
        })
      } else if (isResizing) {
        e.preventDefault()

        const deltaX = e.clientX - dragStartPos.x
        const deltaY = e.clientY - dragStartPos.y

        let newWidth = clockSize.width
        let newHeight = clockSize.height
        let newX = clockPosition.x
        let newY = clockPosition.y

        switch (resizeType) {
          case 'top-left':
            newWidth = clockSize.width - deltaX
            newHeight = clockSize.height - deltaY
            newX = clockPosition.x + deltaX
            newY = clockPosition.y + deltaY
            break
          case 'top-right':
            newWidth = clockSize.width + deltaX
            newHeight = clockSize.height - deltaY
            newY = clockPosition.y + deltaY
            break
          case 'bottom-left':
            newWidth = clockSize.width - deltaX
            newHeight = clockSize.height + deltaY
            newX = clockPosition.x + deltaX
            break
          case 'bottom-right':
            newWidth = clockSize.width + deltaX
            newHeight = clockSize.height + deltaY
            break
        }

        // 设置最小尺寸
        newWidth = Math.max(100, newWidth)
        newHeight = Math.max(80, newHeight)

        setClockSize({ width: newWidth, height: newHeight })
        setClockPosition({ x: newX, y: newY })
        setDragStartPos({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = (): void => {
      setIsDragging(false)
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStartPos, clockSize, clockPosition, resizeType])

  // 处理置顶切换
  const handleAlwaysOnTopChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.checked
    window.api.toggleAlwaysOnTop(value)
    // 状态更新通过onAlwaysOnTopChanged事件完成，不在这里直接更新
  }

  // 处理自动启动切换
  const handleAutoLaunchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.checked
    window.api.toggleAutoLaunch(value)
    // 状态更新通过onAutoLaunchChanged事件完成，不在这里直接更新
  }

  // 切换设置面板
  const toggleSettings = (): void => {
    setShowSettings(!showSettings)
  }

  return (
    <div
      ref={clockRef}
      className="clock-container flex flex-col items-center justify-center p-4 rounded-lg backdrop-blur-sm bg-black/30 text-white relative titlebar"
      style={{
        width: `${clockSize.width}px`,
        height: `${clockSize.height}px`,
        transform: `translate(${clockPosition.x}px, ${clockPosition.y}px)`,
        fontSize: `${Math.min(clockSize.width, clockSize.height) / 8}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="time font-bold" style={{ fontSize: '2em' }}>
        {time}
      </div>
      <div className="date mt-1" style={{ fontSize: '0.7em' }}>
        {date}
      </div>

      {/* 设置按钮 */}
      <div className="absolute top-1 right-1 no-drag">
        <button
          onClick={toggleSettings}
          className="text-white opacity-60 hover:opacity-100 text-xs"
        >
          ⚙️
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="settings-panel absolute top-0 right-0 p-2 bg-black/80 rounded-md no-drag mt-6 mr-1 z-20">
          <div className="mb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAlwaysOnTop}
                onChange={handleAlwaysOnTopChange}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="ml-2 text-xs">始终置顶</span>
            </label>
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoLaunch}
                onChange={handleAutoLaunchChange}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
              <span className="ml-2 text-xs">开机自启动</span>
            </label>
          </div>
        </div>
      )}

      {/* 调整大小的手柄 */}
      <div
        className="resize-handle top-left"
        onMouseDown={(e) => handleResizeStart(e, 'top-left')}
      />
      <div
        className="resize-handle top-right"
        onMouseDown={(e) => handleResizeStart(e, 'top-right')}
      />
      <div
        className="resize-handle bottom-left"
        onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
      />
      <div
        className="resize-handle bottom-right"
        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
      />
    </div>
  )
}

export default Clock
