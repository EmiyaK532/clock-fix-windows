# 桌面时钟 (Desktop Clock)

一个基于 Electron、React 和 TypeScript 开发的桌面时钟应用，特别针对 Windows 10 系统优化了置顶功能。

![桌面时钟截图](resources/icon.png)

## 主要功能

- 简洁美观的时钟界面，显示当前时间和日期
- 无边框透明背景设计
- 支持窗口拖动和大小调整
- 置顶显示功能，不会被其他窗口覆盖
- 开机自启动设置
- 针对 Windows 10 系统进行了特别优化

## 开发环境配置

推荐使用以下工具进行开发：

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 项目安装

```bash
$ pnpm install
```

## 开发调试

```bash
$ pnpm dev
```

## 构建应用

```bash
# Windows 版本构建
$ pnpm build:win

# macOS 版本构建
$ pnpm build:mac

# Linux 版本构建
$ pnpm build:linux
```

## 技术实现

- 使用 Electron 构建跨平台桌面应用
- 使用 React 和 TypeScript 开发前端界面
- 使用 Tailwind CSS 实现界面样式
- 特别针对 Windows 10 系统优化了窗口置顶功能

## 贡献

欢迎提交 Issue 或 Pull Request 来帮助改进这个项目。

## 许可证

[MIT](LICENSE)

## 项目地址

https://github.com/EmiyaK532/clock-fix-windows
