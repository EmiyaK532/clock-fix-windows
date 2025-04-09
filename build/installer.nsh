!macro customHeader
  # 自定义头部
!macroend

!macro preInit
  # 预初始化
!macroend

!macro customInstallMode
  # 设置安装模式为当前用户
  SetShellVarContext current
!macroend

!macro customInit
  # 自定义初始化
!macroend

!macro customInstall
  # 创建开机自启动选项页面 - 简化版
  MessageBox MB_YESNO "是否将桌面时钟设置为开机自动启动？" IDNO skipAutostart
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" "$INSTDIR\${PRODUCT_NAME}.exe"
  skipAutostart:
!macroend

!macro customUnInstall
  # 清理开机自启动注册表项
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
!macroend 