# 图元工坊

浏览器端图片 EXIF 元数据查看、编辑、擦除工具。

支持 JPEG / PNG / WebP / HEIC / AVIF，100% 本地处理，不上传服务器。

## 快速开始

```bash
npm install
npm run dev      # 开发模式
npm run build    # 构建
npm run preview  # 预览构建产物
```

## 技术栈

- Vite 8 + React 19 + TypeScript 6
- TailwindCSS 4 + shadcn/ui
- @substrate-system/exif（JPEG 浏览器端读写）
- @uswriting/exiftool（HEIC/AVIF 读写 + 擦除，基于 WebAssembly）
