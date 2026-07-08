<p align="center">
  <img src="./public/favicon.svg" width="80" height="80" alt="logo" />
</p>

<h1 align="center">图元工坊 · Tuyuan Workshop</h1>

<p align="center">
  <em>浏览器端图片 EXIF 元数据查看、编辑、擦除工具</em>
  <br />
  <em>100% 本地处理，图片不上传服务器</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/license-AGPLv3-green" alt="AGPL-3.0" />
</p>

---

## 概述

图元工坊是一款纯浏览器端的图片 EXIF 元数据编辑工具，支持 JPEG、PNG、WebP、HEIC、AVIF 五种图片格式。所有处理均在本地浏览器中完成，保障用户隐私安全。

### 功能

- **查看**：200+ EXIF 标签以中文分类展示（基本信息、拍摄参数、GPS 位置、版权信息等）
- **编辑**：修改 EXIF 字段值，按原格式导出自定义文件名
- **擦除**：一键清除全部 EXIF，或按类别选择性擦除（GPS、相机信息、时间戳等）
- **批量**：多文件批量处理，打包 ZIP 下载
- **暗色模式**：跟随系统主题
- **响应式布局**：适配桌面与移动设备

### 适用场景

- 社交媒体发布前移除私人元数据（GPS 位置、相机序列号等）
- 摄影师批量清理照片版权和 EXIF 信息
- 查看和学习照片的拍摄参数

### 技术亮点

- **JPEG 浏览器原生写入**：使用 @substrate-system/exif 直接在浏览器中操作 APP1 段，保留 APP2 ICC Profile，无需服务器
- **HEIC/AVIF 全格式覆盖**：使用 ExifTool（Perl → WebAssembly）处理浏览器原生不支持的格式
- **中文标签系统**：200+ EXIF 标签配备完整中文名称和枚举值说明

---

## 快速开始

```bash
npm install
npm run dev       # 开发
npm run build     # 构建
npm run preview   # 预览构建产物
```

构建产物位于 `dist/` 目录，可直接部署到任何静态文件服务器。

---

## 在线体验

[https://Fantasy-XY808.github.io/tuyuan-workshop/](https://Fantasy-XY808.github.io/tuyuan-workshop/)

---

## 技术栈

| 类别 | 选型 |
|------|------|
| 构建工具 | Vite 8 |
| 前端框架 | React 19 |
| 编程语言 | TypeScript 6 |
| 样式方案 | Tailwind CSS 4 + shadcn/ui |
| JPEG EXIF 读写 | @substrate-system/exif（浏览器原生） |
| HEIC/AVIF 处理 | @uswriting/exiftool（WebAssembly） |
| 批量导出 | JSZip + FileSaver |

---

## 项目结构

```
src/
├── components/    # UI 组件
│   ├── ui/        # shadcn/ui 基础组件
│   ├── batch-panel.tsx
│   ├── exif-editor.tsx
│   ├── file-list.tsx
│   ├── header.tsx
│   ├── image-preview.tsx
│   ├── logo.tsx
│   ├── privacy-panel.tsx
│   └── upload-zone.tsx
├── hooks/         # React Hooks
├── lib/           # 核心工具库
│   ├── exif.ts    # EXIF 读写/擦除
│   ├── format.ts  # 格式检测
│   └── tags.ts    # 标签中文映射
├── pages/         # 页面组件
│   ├── home.tsx
│   └── editor.tsx
├── App.tsx
├── index.css
└── main.tsx
```

---

## 许可

[GNU AGPL-3.0](./LICENSE) © 2025 Fantasy-XY808
