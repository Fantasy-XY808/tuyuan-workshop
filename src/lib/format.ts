/**
 * @file 图片格式检测与能力查询
 * 定义支持的图片格式及其读写/擦除能力，提供格式检测工具函数。
 */

/** 支持的图片格式枚举 */
export type ImageFormat = "jpeg" | "png" | "webp" | "heic" | "avif" | "unknown"

/** 格式能力标记 */
export type FormatCap = "read" | "write" | "strip"

interface FormatInfo {
  fmt: ImageFormat
  exts: string[]
  mimes: string[]
  caps: FormatCap[]
  label: string
}

const FORMATS: Record<string, FormatInfo> = {
  jpeg: { fmt: "jpeg", exts: [".jpg", ".jpeg"], mimes: ["image/jpeg"], caps: ["read", "write", "strip"], label: "JPEG" },
  png: { fmt: "png", exts: [".png"], mimes: ["image/png"], caps: ["read", "strip"], label: "PNG" },
  webp: { fmt: "webp", exts: [".webp"], mimes: ["image/webp"], caps: ["read", "strip"], label: "WebP" },
  heic: { fmt: "heic", exts: [".heic", ".heif"], mimes: ["image/heic", "image/heif"], caps: ["read", "write", "strip"], label: "HEIC" },
  avif: { fmt: "avif", exts: [".avif"], mimes: ["image/avif"], caps: ["read", "write", "strip"], label: "AVIF" },
}

const extMap: { ext: string; fmt: ImageFormat }[] = []
const mimeMap: Record<string, ImageFormat> = {}

for (const info of Object.values(FORMATS)) {
  for (const ext of info.exts) extMap.push({ ext, fmt: info.fmt })
  for (const mime of info.mimes) mimeMap[mime] = info.fmt
}

/** 通过文件扩展名或 MIME 类型检测图片格式 */
export function detectFormat(file: File): ImageFormat {
  const name = file.name.toLowerCase()
  for (const { ext, fmt } of extMap) {
    if (name.endsWith(ext)) return fmt
  }
  return mimeMap[file.type] ?? "unknown"
}

/** 获取格式的中文显示标签 */
export function formatLabel(fmt: ImageFormat): string {
  if (fmt === "unknown") return "未知"
  return FORMATS[fmt]?.label ?? fmt.toUpperCase()
}

/** 判断格式是否支持读取 EXIF */
export function canRead(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("read") ?? false)
}

/** 判断格式是否支持写入 EXIF */
export function canWrite(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("write") ?? false)
}

/** 判断格式是否支持擦除 EXIF */
export function canStrip(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("strip") ?? false)
}

/** 文件上传 input 的 accept 属性值 */
export const ACCEPT_TYPES = "image/*,.heic,.heif,.avif"

/** 上传区域格式徽章列表 */
export const FORMAT_BADGES = [
  { label: "JPEG", fmt: "jpeg" as ImageFormat, caps: "读写擦" },
  { label: "PNG", fmt: "png" as ImageFormat, caps: "读取擦除" },
  { label: "WebP", fmt: "webp" as ImageFormat, caps: "读取擦除" },
  { label: "HEIC", fmt: "heic" as ImageFormat, caps: "读写擦" },
  { label: "AVIF", fmt: "avif" as ImageFormat, caps: "读写擦" },
]
