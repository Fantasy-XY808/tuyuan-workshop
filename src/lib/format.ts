export type ImageFormat = "jpeg" | "png" | "webp" | "heic" | "avif" | "unknown"
export type FormatCap = "read" | "write" | "strip"

const FORMATS: Record<string, { fmt: ImageFormat; exts: string[]; mimes: string[]; caps: FormatCap[]; label: string }> = {
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

export function detectFormat(file: File): ImageFormat {
  const name = file.name.toLowerCase()
  for (const { ext, fmt } of extMap) {
    if (name.endsWith(ext)) return fmt
  }
  return mimeMap[file.type] ?? "unknown"
}

export function formatLabel(fmt: ImageFormat): string {
  if (fmt === "unknown") return "未知"
  return FORMATS[fmt]?.label ?? fmt.toUpperCase()
}

export function canRead(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("read") ?? false)
}

export function canWrite(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("write") ?? false)
}

export function canStrip(fmt: ImageFormat): boolean {
  return fmt !== "unknown" && (FORMATS[fmt]?.caps?.includes("strip") ?? false)
}

export const ACCEPT_TYPES = "image/*,.heic,.heif,.avif"

export const FORMAT_BADGES = [
  { label: "JPEG", fmt: "jpeg" as ImageFormat, caps: "读写擦" },
  { label: "PNG", fmt: "png" as ImageFormat, caps: "读取擦除" },
  { label: "WebP", fmt: "webp" as ImageFormat, caps: "读取擦除" },
  { label: "HEIC", fmt: "heic" as ImageFormat, caps: "读写擦" },
  { label: "AVIF", fmt: "avif" as ImageFormat, caps: "读写擦" },
]
