<div align="center">
  <br />
  <img src="./public/favicon.svg" width="80" height="80" alt="logo" />
  <h1 align="center">图元工坊</h1>
  <p align="center">浏览器端图片 EXIF 元数据查看·编辑·擦除工具</p>

  <p align="center">
    <a href="#features">功能特性</a> ·
    <a href="#getting-started">快速开始</a> ·
    <a href="#tech-stack">技术栈</a> ·
    <a href="#project-structure">项目结构</a> ·
    <a href="#license">开源协议</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
  </p>
</div>

## 简介

**图元工坊**是一款纯浏览器端的图片 EXIF 元数据编辑工具。支持 JPEG、PNG、WebP、HEIC、AVIF 五种主流图片格式。所有处理均在本地浏览器中完成，**图片不会上传至任何服务器**，充分保障隐私安全。

## 功能特性

- **查看** — 以中文标签分类浏览 EXIF 信息（基本信息、拍摄参数、GPS 位置、版权等）
- **编辑** — 修改 EXIF 字段值，按原格式导出保存
- **擦除** — 一键清除全部 EXIF，或按类别选择性擦除（GPS、相机信息、时间戳等）
- **批量处理** — 多文件批量编辑，一键打包 ZIP 下载
- **响应式布局** — 适配桌面与移动设备
- **暗色模式** — 跟随系统主题自动切换
- **隐私优先** — 100% 浏览器本地处理，无数据上传

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 技术栈

| 类别 | 技术 |
|------|------|
| 构建工具 | [Vite 8](https://vite.dev) |
| 前端框架 | [React 19](https://react.dev) |
| 编程语言 | [TypeScript 6](https://www.typescriptlang.org) |
| 样式方案 | [Tailwind CSS 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| JPEG EXIF 读写 | [@substrate-system/exif](https://github.com/substrate-system/exif)（浏览器原生） |
| HEIC/AVIF 处理 | [@uswriting/exiftool](https://github.com/uswriting/exiftool)（WebAssembly） |
| 批量导出 | [JSZip](https://stuk.github.io/jszip/) + [FileSaver](https://github.com/eligrey/FileSaver.js) |

## 项目结构

```
tuyuan-workshop/
├── public/               # 静态资源
│   ├── favicon.svg
│   └── zeroperl.wasm     # ExifTool WebAssembly 运行时
├── src/
│   ├── components/       # UI 组件
│   │   ├── ui/           # shadcn/ui 基础组件
│   │   ├── batch-panel.tsx
│   │   ├── exif-editor.tsx
│   │   ├── file-list.tsx
│   │   ├── header.tsx
│   │   ├── image-preview.tsx
│   │   ├── logo.tsx
│   │   ├── privacy-panel.tsx
│   │   └── upload-zone.tsx
│   ├── hooks/            # React Hooks
│   │   ├── use-exif.ts
│   │   ├── use-files.ts
│   │   └── use-theme.ts
│   ├── lib/              # 工具库
│   │   ├── exif.ts       # EXIF 读写/擦除核心逻辑
│   │   ├── format.ts     # 图片格式检测
│   │   ├── tags.ts       # EXIF 标签中文映射
│   │   └── utils.ts      # 通用工具函数
│   ├── pages/            # 页面组件
│   │   ├── home.tsx
│   │   └── editor.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .github/workflows/    # CI/CD 配置
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── LICENSE
```

## 开发指南

### 环境要求

- Node.js 20+
- npm 10+

### 命令参考

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 类型检查 + Vite 生产构建 |
| `npm run preview` | 预览生产构建产物 |
| `npm run lint` | 运行 Oxlint 代码检查 |

### EXIF 处理流程

- **JPEG**：使用 `@substrate-system/exif` 在浏览器中直接读写 APP1 段，支持所有字段
- **HEIC/AVIF**：使用 ExifTool（WebAssembly）通过 `@uswriting/exiftool` 处理
- **擦除操作**：JPEG/PNG/WebP 调用浏览器原生 `stripExif`，HEIC/AVIF 使用 ExifTool

## 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages。推送至 `main` 分支后，CI 会自动构建并发布。

访问地址：`https://<用户名>.github.io/tuyuan-workshop/`

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
