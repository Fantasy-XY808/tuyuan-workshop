/**
 * @file EXIF 数据状态管理
 * 封装 EXIF 读取、编辑、保存、擦除的完整生命周期。
 * 当选中文件变化时自动加载 EXIF，提供脏状态追踪。
 */

import { useState, useEffect, useCallback } from "react"
import { readExif, writeExif, removeExif, removeExifSelective, type ExifValues } from "@/lib/exif"
import type { FileItem } from "./use-files"

/** EXIF 操作 Hook */
export function useExif(fileItem: FileItem | null) {
  const [exif, setExif] = useState<ExifValues>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  /** 文件切换时自动加载 EXIF */
  useEffect(() => {
    if (!fileItem) {
      setExif({})
      setLoading(false)
      setError(null)
      setDirty(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setDirty(false)

    const run = async () => {
      try {
        const result = await readExif(fileItem.file)
        if (cancelled) return
        setExif(result.exif)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        setError(err?.message || String(err))
        setLoading(false)
      }
    }
    run()

    return () => { cancelled = true }
  }, [fileItem])

  /** 更新单个 EXIF 字段值，标记为脏 */
  const updateValue = useCallback((key: string, value: string) => {
    setExif((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  /** 保存 EXIF 到文件，返回 Blob */
  const save = useCallback(async (): Promise<Blob | null> => {
    if (!fileItem) return null
    try {
      const blob = await writeExif(fileItem.file, exif)
      setDirty(false)
      return blob
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [fileItem, exif])

  /** 擦除全部 EXIF，返回 Blob */
  const remove = useCallback(async (): Promise<Blob | null> => {
    if (!fileItem) return null
    try {
      return await removeExif(fileItem.file)
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [fileItem])

  /** 按字段选择性擦除 EXIF，返回 Blob */
  const removeSelective = useCallback(async (fields: string[]): Promise<Blob | null> => {
    if (!fileItem) return null
    try {
      return await removeExifSelective(fileItem.file, fields)
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [fileItem])

  return { exif, loading, error, dirty, updateValue, save, remove, removeSelective }
}
