<p align="center">
  <img src="./public/favicon.svg" width="80" height="80" alt="logo" />
</p>

<h1 align="center">图元工坊 · Tuyuan Workshop</h1>

<p align="center">
  <em>浏览器端图片 EXIF 元数据查看、编辑、擦除工具</em>
</p>

<p align="center">
  <a href="https://github.com/<username>/tuyuan-workshop/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/<username>/tuyuan-workshop/deploy.yml" alt="build" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/github/license/<username>/tuyuan-workshop" alt="license" />
  </a>
  <br />
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
</p>

---

## 概述

**图元工坊** 是一款纯浏览器端的图片 EXIF 元数据编辑工具，支持 JPEG / PNG / WebP / HEIC / AVIF 五种主流图片格式。所有处理均在本地浏览器中完成，**图片不上传任何服务器**。

## 功能

- **查看** — 中文标签分类浏览 EXIF（基本信息、拍摄参数、GPS、版权等）
- **编辑** — 修改 EXIF 字段，按原格式导出
- **擦除** — 一键清除全部 EXIF，或按类别选择性删除
- **批量** — 多文件打包 ZIP 下载
- **暗色模式** — 跟随系统
- **响应式** — 桌面 / 移动端适配

## 快速开始

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## 技术栈

| 类别 | 选型 |
|------|------|
| 构建 | Vite 8 |
| 框架 | React 19 |
| 语言 | TypeScript 6 |
| 样式 | Tailwind CSS 4 + shadcn/ui |
| JPEG EXIF | @substrate-system/exif（浏览器原生） |
| HEIC/AVIF | @uswriting/exiftool（WebAssembly） |
| 批量导出 | JSZip + FileSaver |

## 项目结构

```
src/
├── components/     # UI 组件
│   ├── ui/         # shadcn/ui 基础组件
│   ├── batch-panel.tsx
│   ├── exif-editor.tsx
│   ├── file-list.tsx
│   ├── header.tsx
│   ├── image-preview.tsx
│   ├── logo.tsx
│   ├── privacy-panel.tsx
│   └── upload-zone.tsx
├── hooks/          # 自定义 Hooks
│   ├── use-exif.ts
│   ├── use-files.ts
│   └── use-theme.ts
├── lib/            # 工具库
│   ├── exif.ts     # EXIF 读写 / 擦除
│   ├── format.ts   # 格式检测
│   ├── tags.ts     # 标签中文映射
│   └── utils.ts    # 通用工具
├── pages/          # 页面
│   ├── home.tsx
│   └── editor.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## 脚本

| 命令 | 说明 |
|------|------|
| `dev` | 启动开发服务器 |
| `build` | TypeScript 检查 + 生产构建 |
| `preview` | 预览构建产物 |
| `lint` | 代码检查 |

## 部署

推送 `main` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

访问地址：`https://<username>.github.io/tuyuan-workshop/`

## 许可

[MIT](./LICENSE)
