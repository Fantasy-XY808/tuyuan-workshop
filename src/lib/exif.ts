/**
 * @file EXIF 元数据核心操作
 * 提供跨格式的 EXIF 读取、写入、擦除功能。
 *
 * 架构说明：
 * - JPEG：使用 @substrate-system/exif 在浏览器中直接操作 APP1 段
 * - PNG/WebP：使用 @substrate-system/exif 读取，stripExif 擦除
 * - HEIC/AVIF：使用 @uswriting/exiftool (WebAssembly) 读写擦除
 */

import { ImageIFD, ExifIFD, GPSIFD } from "@substrate-system/exif"
import type { Exif, ExifValue } from "@substrate-system/exif"
import { detectFormat, canWrite, canStrip, formatLabel, type ImageFormat } from "./format"

/* ------------------------------------------------------------------ */
/*  标签名 ↔ IFD+ID 双向映射                                           */
/*  将 "ISOSpeedRatings" 这样的标签名映射为 { ifd: "Exif", id: 0x8827 } */
/* ------------------------------------------------------------------ */

type TagEntry = { ifd: string; id: number }
const NAME_TO_TAG: Record<string, TagEntry> = {}
const IFDID_TO_NAME: Record<string, string> = {}

function buildTagMaps() {
  for (const [name, id] of Object.entries(ImageIFD)) {
    if (typeof id === "number") {
      NAME_TO_TAG[name] = { ifd: "0th", id }
      IFDID_TO_NAME[`0th.${id}`] = name
      IFDID_TO_NAME[`1st.${id}`] = name
    }
  }
  for (const [name, id] of Object.entries(ExifIFD)) {
    if (typeof id === "number") {
      NAME_TO_TAG[name] = { ifd: "Exif", id }
      IFDID_TO_NAME[`Exif.${id}`] = name
    }
  }
  for (const [name, id] of Object.entries(GPSIFD)) {
    if (typeof id === "number") {
      NAME_TO_TAG[name] = { ifd: "GPS", id }
      IFDID_TO_NAME[`GPS.${id}`] = name
    }
  }
}
buildTagMaps()

/* ------------------------------------------------------------------ */
/*  值格式化处理                                                        */
/* ------------------------------------------------------------------ */

/** 将 GPS DMS 数组（度分秒）转换为十进制数 */
function gpsDmsToDecimal(dms: [number, number][]): number {
  const d = dms[0]?.[0] ?? 0
  const m = dms[1]?.[0] ?? 0
  const s = dms[2]?.[0] ?? 0
  return d + m / 60 + s / 3600
}

/** 将 substrate 库返回的原始 ExifValue 格式化为可读字符串 */
function formatValueForDisplay(val: ExifValue): string {
  if (typeof val === "string") return val
  if (typeof val === "number") return String(val)
  if (!Array.isArray(val)) return ""
  if (val.length > 0 && Array.isArray(val[0])) {
    return String(gpsDmsToDecimal(val as [number, number][]))
  }
  if (val.length === 2 && typeof val[0] === "number") {
    const [num, den] = val as [number, number]
    return den === 0 ? "0" : String(num / den)
  }
  return (val as number[]).join(", ")
}

/* ------------------------------------------------------------------ */
/*  写入时的值猜测                                                      */
/* ------------------------------------------------------------------ */

/** 应保持为文本（而非转为数字）的标签名集合 */
const TEXT_TAGS = new Set([
  "ImageDescription", "Make", "Model", "Software", "Artist", "Copyright",
  "UserComment", "XPAuthor", "XPSubject", "XPKeywords",
  "CameraOwnerName", "LensMake", "LensModel", "ImageUniqueID",
  "BodySerialNumber", "LensSerialNumber",
  "GPSLatitudeRef", "GPSLongitudeRef", "GPSAltitudeRef",
  "GPSDateStamp", "GPSTimeStamp", "DateTimeOriginal", "DateTimeDigitized",
  "DateTime", "HostComputer", "SubSecTime", "SubSecTimeOriginal",
  "SubSecTimeDigitized",
])

function isTextTag(name: string): boolean {
  return TEXT_TAGS.has(name)
}

/** 根据标签名和字符串值猜测合适的 ExifValue 类型 */
function guessExifValue(name: string, str: string): ExifValue {
  if (!str) return ""
  if (isTextTag(name)) return str
  const num = parseFloat(str)
  return isNaN(num) ? str : num
}

/* ------------------------------------------------------------------ */
/*  Substrate 读取（JPEG / PNG / WebP）                                */
/* ------------------------------------------------------------------ */

/**
 * 使用 @substrate-system/exif 读取图片 EXIF。
 * 将 IFD 中的数字 ID 通过 IFDID_TO_NAME 映射回标签名。
 */
async function readSubstrate(file: File): Promise<ExifValues> {
  const mod = await import("@substrate-system/exif/browser")
  const exif: Exif = await mod.loadFromBlob(file)
  const flat: ExifValues = {}
  for (const ifd of ["0th", "1st", "Exif", "GPS", "Interop"] as const) {
    const el = (exif as any)[ifd] as Record<string, ExifValue> | undefined
    if (!el) continue
    for (const [idStr, val] of Object.entries(el)) {
      if (idStr === "first_ifd_pointer") continue
      const name = IFDID_TO_NAME[`${ifd}.${idStr}`]
      if (name) flat[name] = formatValueForDisplay(val)
    }
  }
  return flat
}

/* ------------------------------------------------------------------ */
/*  ExifTool 读取（HEIC / AVIF 兜底）                                   */
/* ------------------------------------------------------------------ */

type ExifToolModule = typeof import("@uswriting/exiftool")

let _exiftool: ExifToolModule | null = null
let _exiftoolLoading: Promise<ExifToolModule> | null = null

/** 懒加载 ExifTool WebAssembly 模块（单例） */
async function getExifTool(): Promise<ExifToolModule> {
  if (_exiftool) return _exiftool
  if (!_exiftoolLoading) {
    _exiftoolLoading = import("@uswriting/exiftool").then((mod) => {
      _exiftool = mod
      return mod
    })
  }
  return _exiftoolLoading
}

/** 只保留 EXIF/GPS/IPTC 组，跳过其他元数据（如 ICC Profile） */
const KEEP_GROUPS = new Set(["EXIF", "GPS", "IPTC", ""])

/** 使用 ExifTool CLI（WASM）解析文件元数据 */
async function readExifTool(file: File): Promise<ExifValues> {
  const et = await getExifTool()
  const result = await et.parseMetadata(file, {
    args: ["-json", "-n", "-G"],
    transform: (data: string) => JSON.parse(data),
  })
  if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
    return {}
  }
  const raw = result.data[0] as Record<string, unknown>
  const flat: ExifValues = {}
  for (const [key, val] of Object.entries(raw)) {
    const idx = key.lastIndexOf(":")
    const group = idx >= 0 ? key.slice(0, idx) : ""
    const tagName = idx >= 0 ? key.slice(idx + 1) : key
    if (tagName === "SourceFile") continue
    if (group && !KEEP_GROUPS.has(group)) continue
    if (val != null) flat[tagName] = String(val)
  }
  return flat
}

/* ------------------------------------------------------------------ */
/*  公共类型                                                           */
/* ------------------------------------------------------------------ */

/** 扁平化的 EXIF 键值对，所有值均序列化为字符串 */
export type ExifValues = Record<string, string>

/** EXIF 读取结果 */
export interface ReadResult {
  /** 检测到的图片格式 */
  format: ImageFormat
  /** 格式化后的 EXIF 数据 */
  exif: ExifValues
  /** 原始 EXIF 数据（当前与 exif 相同） */
  raw: ExifValues
}

/* ------------------------------------------------------------------ */
/*  公共读取 API                                                       */
/* ------------------------------------------------------------------ */

/**
 * 读取图片 EXIF 元数据。
 * 根据格式自动选择读取引擎：
 * - JPEG/PNG/WebP → @substrate-system/exif（浏览器原生）
 * - HEIC/AVIF → ExifTool（WebAssembly）
 * 失败时自动降级到 ExifTool 兜底。
 */
export async function readExif(file: File): Promise<ReadResult> {
  const format = detectFormat(file)
  try {
    let exif: ExifValues
    if (format === "jpeg" || format === "png" || format === "webp") {
      exif = await readSubstrate(file)
    } else {
      exif = await readExifTool(file)
    }
    return { format, exif, raw: exif }
  } catch {
    try {
      const exif = await readExifTool(file)
      return { format, exif, raw: exif }
    } catch {
      return { format, exif: {}, raw: {} }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Substrate 写入（仅 JPEG）                                          */
/* ------------------------------------------------------------------ */

/** 使用 @substrate-system/exif 写入 JPEG 的 EXIF APP1 段 */
async function writeJpegExif(file: File, values: ExifValues): Promise<Blob> {
  const { load, dump, insert } = await import("@substrate-system/exif")
  const uint8 = new Uint8Array(await file.arrayBuffer())
  const exif = load(uint8)

  /** 某些标签同时存在于 ExifIFD 和 ImageIFD，需同步写入 */
  const DUPLICATE_TAGS = new Set([
    "ExposureTime", "FlashEnergy", "SpatialFrequencyResponse",
    "FocalPlaneXResolution", "FocalPlaneYResolution",
    "FocalPlaneResolutionUnit", "ExposureIndex", "SensingMethod", "CFAPattern",
  ])

  for (const [name, strVal] of Object.entries(values)) {
    if (!strVal) continue
    const tag = NAME_TO_TAG[name]
    if (!tag) continue

    const ifds = DUPLICATE_TAGS.has(name) ? ["Exif", "0th"] : [tag.ifd]
    for (const ifd of ifds) {
      const id = NAME_TO_TAG[name]?.id
      if (!id) continue
      if (!(exif as any)[ifd]) (exif as any)[ifd] = {}
      const el = (exif as any)[ifd]
      const origVal = el[id]
      let newVal: ExifValue
      if (origVal !== undefined) {
        if (typeof origVal === "string") newVal = strVal
        else if (typeof origVal === "number") newVal = parseFloat(strVal) || 0
        else if (Array.isArray(origVal)) {
          if (origVal.length === 2 && typeof origVal[0] === "number") {
            newVal = [parseFloat(strVal), 1] as [number, number]
          } else continue
        } else continue
      } else {
        newVal = guessExifValue(name, strVal)
      }
      el[id] = newVal
    }
  }

  return new Blob([insert(dump(exif), uint8).buffer as ArrayBuffer], { type: file.type })
}

/* ------------------------------------------------------------------ */
/*  ExifTool 标签名映射                                                */
/* ------------------------------------------------------------------ */

/**
 * 内部标签名 → ExifTool CLI 标签名映射。
 * 因 @substrate-system/exif 与 ExifTool 对同一标签的命名不同，
 * 写入 HEIC/AVIF 时需转换。
 */
const EXIFTOOL_TAG_MAP: Record<string, string> = {
  ISOSpeedRatings: "ISO",
  ISOSpeed: "ISO",
  FocalLengthIn35mmFilm: "FocalLengthIn35mmFormat",
  ExposureTime: "ShutterSpeed",
  ExifVersion: "EXIF:ExifVersion",
  FlashpixVersion: "EXIF:FlashpixVersion",
  ComponentsConfiguration: "EXIF:ComponentsConfiguration",
  DateTimeOriginal: "EXIF:DateTimeOriginal",
  DateTimeDigitized: "EXIF:CreateDate",
  SubSecTimeOriginal: "EXIF:SubSecTimeOriginal",
  SubSecTimeDigitized: "EXIF:SubSecTimeDigitized",
  SceneType: "EXIF:SceneType",
  FileSource: "EXIF:FileSource",
  CFAPattern: "EXIF:CFAPattern",
  CustomRendered: "EXIF:CustomRendered",
  ExposureMode: "EXIF:ExposureMode",
  WhiteBalance: "EXIF:WhiteBalance",
  DigitalZoomRatio: "EXIF:DigitalZoomRatio",
  SceneCaptureType: "EXIF:SceneCaptureType",
  GainControl: "EXIF:GainControl",
  Contrast: "EXIF:Contrast",
  Saturation: "EXIF:Saturation",
  Sharpness: "EXIF:Sharpness",
  SubjectDistanceRange: "EXIF:SubjectDistanceRange",
}

/** 将内部标签名转换为 ExifTool 兼容的标签名 */
function toExifToolName(name: string): string {
  if (EXIFTOOL_TAG_MAP[name]) return EXIFTOOL_TAG_MAP[name]
  if (name.startsWith("GPS")) return `GPS:${name}`
  return `EXIF:${name}`
}

/* ------------------------------------------------------------------ */
/*  ExifTool 写入（HEIC / AVIF）                                       */
/* ------------------------------------------------------------------ */

/** 使用 ExifTool（WASM）写入元数据 */
async function writeExifTool(file: File, values: ExifValues): Promise<Blob> {
  const et = await getExifTool()
  const tags: Record<string, string> = {}
  for (const [name, val] of Object.entries(values)) {
    if (val === "") continue
    tags[toExifToolName(name)] = val
  }
  const result = await et.writeMetadata(file, tags)
  if (!result.success || !result.data) {
    throw new Error(result.error || "写入失败")
  }
  return new Blob([result.data], { type: file.type })
}

/* ------------------------------------------------------------------ */
/*  公共写入 / 擦除 API                                                */
/* ------------------------------------------------------------------ */

/**
 * 写入 EXIF 元数据到图片文件。
 * - JPEG → 浏览器原生写入 APP1 段（保留 APP2 ICC Profile）
 * - HEIC/AVIF → ExifTool（WASM）
 */
export async function writeExif(file: File, values: ExifValues): Promise<Blob> {
  const format = detectFormat(file)
  if (!canWrite(format)) throw new Error(`${formatLabel(format)} 不支持写入元数据`)
  if (format === "jpeg") return writeJpegExif(file, values)
  return writeExifTool(file, values)
}

/**
 * 擦除图片中的所有 EXIF 元数据。
 * - JPEG/PNG/WebP → 调用 stripExif 移除 APP1 段（保留 APP2 ICC Profile）
 * - HEIC/AVIF → ExifTool 只删除 EXIF/GPS/XMP 组
 */
export async function removeExif(file: File): Promise<Blob> {
  const format = detectFormat(file)
  if (!canStrip(format)) throw new Error(`${formatLabel(format)} 不支持擦除元数据`)
  if (format === "jpeg" || format === "png" || format === "webp") {
    const { stripExif } = await import("@substrate-system/exif/remove")
    const buffer = await file.arrayBuffer()
    const stripped = stripExif(new Uint8Array(buffer))
    return new Blob([stripped.buffer as ArrayBuffer], { type: file.type })
  }
  const et = await getExifTool()
  const result = await et.writeMetadata(file, {}, { args: ["-EXIF=", "-GPS=", "-XMP="] })
  if (!result.success || !result.data) {
    throw new Error(result.error || "擦除失败")
  }
  return new Blob([result.data], { type: file.type })
}

/**
 * 按字段列表选择性擦除 EXIF。
 * 始终使用 ExifTool（WASM）以获得跨格式一致的行为。
 */
export async function removeExifSelective(
  file: File,
  fields: string[]
): Promise<Blob> {
  const et = await getExifTool()
  const args = fields.map((f) => `-${f}=`)
  const result = await et.writeMetadata(file, {}, { args })
  if (!result.success || !result.data) {
    throw new Error(result.error || "擦除失败")
  }
  return new Blob([result.data], { type: file.type })
}

/** 检查 ExifTool WASM 模块是否已加载 */
export function isExifToolLoaded(): boolean {
  return _exiftool !== null
}
