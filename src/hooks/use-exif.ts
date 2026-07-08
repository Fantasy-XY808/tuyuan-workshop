import { useState, useEffect, useCallback } from "react"
import { readExif, writeExif, removeExif, removeExifSelective, type ExifValues } from "@/lib/exif"
import type { FileItem } from "./use-files"

export function useExif(fileItem: FileItem | null) {
  const [exif, setExif] = useState<ExifValues>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

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
        console.log("[useExif] reading", fileItem.file.name)
        const result = await readExif(fileItem.file)
        if (cancelled) return
        console.log("[useExif] result", result)
        if (result.exif && Object.keys(result.exif).length === 0) {
          console.warn("[useExif] no EXIF found")
        }
        setExif(result.exif)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        console.error("[useExif] error", err)
        setError(err?.message || String(err))
        setLoading(false)
      }
    }
    run()

    return () => { cancelled = true }
  }, [fileItem])

  const updateValue = useCallback((key: string, value: string) => {
    setExif((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

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

  const remove = useCallback(async (): Promise<Blob | null> => {
    if (!fileItem) return null
    try {
      return await removeExif(fileItem.file)
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [fileItem])

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
