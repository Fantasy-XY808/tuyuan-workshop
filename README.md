# 图元工坊 · Tuyuan Workshop

> 浏览器端图片 EXIF 元数据查看、编辑、擦除工具  
> 100% 本地处理，不上传服务器

<p align="center">
  <img src="./public/favicon.svg" width="80" height="80" alt="logo" />
</p>

<p align="center">
  <a href="#-features">功能特性</a> ·
  <a href="#-getting-started">快速开始</a> ·
  <a href="#-architecture">架构说明</a> ·
  <a href="#-development">开发指南</a> ·
  <a href="#-deployment">部署</a> ·
  <a href="#-faq">FAQ</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs" />
</p>

---

## 📖 概述

**图元工坊**是一款纯浏览器端的 EXIF 元数据编辑工具，支持 JPEG、PNG、WebP、HEIC、AVIF 五种主流图片格式。所有处理均在用户本地浏览器中完成，**图片数据不会上传至任何服务器**。

### 适用场景

- 摄影师批量清理图片 GPS 位置信息
- 社交媒体发布前移除私人元数据
- 查看和学习照片的拍摄参数（光圈、快门、ISO 等）
- 批量编辑版权信息

### 核心设计原则

- **隐私优先**：所有运算在浏览器本地完成，无服务器通信
- **渐进增强**：JPEG 使用浏览器原生 API 读写；HEIC/AVIF 降级到 WebAssembly
- **中文优先**：全部 200+ EXIF 标签配有中文名称和枚举值说明
- **极简交互**：三步完成操作（拖拽 → 编辑/擦除 → 导出）

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| **EXIF 查看** | 200+ 标签按 8 类中文分类展示：基本信息、拍摄参数、GPS、版权等 |
| **EXIF 编辑** | 支持 text / number / date / select 四种控件，修改后导出原格式 |
| **EXIF 擦除** | 一键清除全部 EXIF；或按类别选择性擦除（GPS / 相机信息 / 时间戳等） |
| **批量处理** | 多文件批量编辑，一键打包 ZIP 下载 |
| **隐私保护** | JPEG 仅移除 APP1 段，保留 APP2 ICC Profile；ExifTool 路径只删 EXIF/GPS/XMP |
| **暗色模式** | 跟随系统主题自动切换 |
| **响应式** | 桌面端三栏布局，移动端自动适配 |
| **未保存提醒** | 修改后离开页面时弹窗提示，支持继续编辑或放弃 |

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 20
- **npm**: >= 10

```bash
# 克隆仓库
git clone https://github.com/<username>/tuyuan-workshop.git
cd tuyuan-workshop

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建产物
npm run preview
```

### 命令参考

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（HMR） |
| `npm run build` | TypeScript 类型检查 + Vite 生产构建 |
| `npm run preview` | 使用 Vite 预览服务提供构建产物 |
| `npm run lint` | 运行 Oxlint 代码检查 |

---

## 🏗 架构

### 项目结构

```
tuyuan-workshop/
├── .github/workflows/deploy.yml    # GitHub Pages CI/CD
├── public/
│   ├── favicon.svg                  # 网站图标
│   └── zeroperl.wasm               # ExifTool WebAssembly 运行时
├── src/
│   ├── components/                 # UI 组件
│   │   ├── ui/                     # shadcn/ui 基础组件（button/dialog/select 等）
│   │   ├── batch-panel.tsx         # 批量处理面板
│   │   ├── exif-editor.tsx         # EXIF 编辑器（标签页 + 字段表单）
│   │   ├── file-list.tsx           # 文件列表
│   │   ├── header.tsx              # 顶栏（暗色开关 + 返回首页）
│   │   ├── image-preview.tsx       # 图片/视频预览
│   │   ├── logo.tsx                # SVG Logo
│   │   ├── privacy-panel.tsx       # 隐私擦除面板
│   │   └── upload-zone.tsx         # 拖拽上传区
│   ├── hooks/                      # React Hooks
│   │   ├── use-exif.ts             # EXIF 操作生命周期
│   │   ├── use-files.ts            # 文件列表状态管理
│   │   └── use-theme.ts            # 暗色模式切换
│   ├── lib/                        # 工具库
│   │   ├── exif.ts                 # EXIF 核心逻辑（读/写/擦除）
│   │   ├── format.ts               # 图片格式检测与能力查询
│   │   ├── tags.ts                 # EXIF 标签中文映射（200+ 标签）
│   │   ├── utils.ts                # 通用工具函数
│   │   └── fs-mock.ts              # node:fs/promises 浏览器空实现
│   ├── pages/
│   │   ├── home.tsx                # 首页（Logo + 上传区）
│   │   └── editor.tsx              # 编辑器页面
│   ├── App.tsx                     # 根组件（路由 + 全局设施）
│   ├── index.css                   # 全局样式 + Tailwind + 动画
│   └── main.tsx                    # 应用入口
├── index.html                      # HTML 模板
├── vite.config.ts                  # Vite 构建配置
├── tsconfig.json                   # TypeScript 配置
├── package.json
├── LICENSE                         # MIT 开源协议
├── .editorconfig                   # 编辑器一致性配置
├── .gitattributes                  # Git 换行符规则
├── .nvmrc                          # Node.js 版本锁定
└── .oxlintrc.json                  # Oxlint 代码检查配置
```

### 数据流

```
用户拖拽图片
       ↓
  UploadZone → useFiles.addFiles()  →  FileItem[]（含 object URL）
       ↓
  FileList（选择文件）
       ↓
  useExif（自动） → readExif()
       ├── JPEG/PNG/WebP → @substrate-system/exif（浏览器原生解析 APP1）
       └── HEIC/AVIF     → ExifTool WASM（解析全部元数据）
       ↓
  ExifEditor（展示 + 编辑）
       ↓
  保存 → writeExif()
       ├── JPEG → insert() 写入 APP1（保留 APP2 ICC Profile）
       └── 其他 → ExifTool WASM 写入
       ↓
  下载 Blob
```

### EXIF 处理引擎对比

| 特性 | @substrate-system/exif | @uswriting/exiftool |
|------|----------------------|---------------------|
| 运行环境 | 浏览器原生 JS | WebAssembly（Perl 编译） |
| 适用格式 | JPEG / PNG / WebP | HEIC / AVIF / 全部格式 |
| 写入方式 | 修改 APP1 段 | 重写文件元数据 |
| ICC Profile | 保留（APP2 段不受影响） | 需指定参数避免删除 |
| 体积 | ~30 KB | ~25 MB（zeroperl.wasm） |
| 加载速度 | 同步 | 异步（首次需初始化 WASM） |

---

## 🔧 开发指南

### 代码规范

- **TypeScript**：严格模式 (strict: true)
- **命名**：camelCase（变量/函数）、PascalCase（组件/类型）、SCREAMING_SNAKE_CASE（常量）
- **导入顺序**：React → 第三方库 → @/ 内部模块
- **样式**：Tailwind CSS 原子类，复杂样式使用 cn() 合并

### 添加新标签

1. 在 `src/lib/tags.ts` 中寻找对应分类，添加 `TagDef`
2. key 需与 `@substrate-system/exif` 的 ImageIFD/ExifIFD/GPSIFD 枚举名一致
3. 如需 ExifTool 写入映射，在 `src/lib/exif.ts` 的 `EXIFTOOL_TAG_MAP` 中添加对应项

### 构建优化

生产构建产物位于 `dist/` 目录，包含：
- `index.html`：入口页面（已使用相对路径 `./`，适用于 GitHub Pages 子路径部署）
- `assets/`：JS + CSS 构建产物（Vite 自动 code splitting）
- `zeroperl.wasm`：ExifTool WebAssembly 运行时

---

## 🌐 部署

### GitHub Pages（自动）

推送至 `main` 分支后，GitHub Actions 自动执行：
1. 安装依赖
2. TypeScript 类型检查 + Vite 构建
3. 上传 `dist/` 目录到 GitHub Pages
4. 发布到 `https://<username>.github.io/tuyuan-workshop/`

### 手动部署

```bash
npm run build
# 将 dist/ 目录部署到任何静态文件服务器
```

---

## ❓ FAQ

**Q: 哪些图片格式支持写入 EXIF？**  
A: JPEG、HEIC、AVIF 支持完整读写。PNG、WebP 支持读取和擦除，不支持写入。

**Q: 擦除 EXIF 后会影响图片质量吗？**  
A: JPEG 模式仅移除 APP1 段，不影响像素数据；ExifTool 模式会重写文件，理论上像素无损失。

**Q: ICC Profile 会被删除吗？**  
A: JPEG 模式通过 `stripExif` 只移除 APP1 段，APP2（ICC Profile）不受影响。ExifTool 模式使用 `-EXIF= -GPS= -XMP=` 参数，不涉及 ICC 相关组。

**Q: 为什么 HEIC/AVIF 首次加载慢？**  
A: ExifTool 需要初始化 WebAssembly 运行时（~25MB 的 zeroperl.wasm），首次加载需下载并编译，后续调用使用缓存。

**Q: 是否支持视频文件？**  
A: 当前版本专注于图片格式，不支持视频 EXIF 编辑。

---

## 📄 许可

[MIT License](./LICENSE) © 2025
