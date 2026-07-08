/**
 * @file 文件列表状态管理
 * 管理上传的文件列表、选中状态、缩略图 URL 的生命周期。
 */

import { useState, useCallback } from "react"

/** 生成唯一 ID（优先使用 crypto.randomUUID，不支持时回退） */
function uid(): string {
  try { return crypto.randomUUID() } catch { return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}` }
}

/** 文件条目 */
export interface FileItem {
  /** 唯一标识 */
  id: string
  /** 原始 File 对象 */
  file: File
  /** 用于预览的 object URL */
  thumbUrl: string
}

/** 文件列表管理 Hook */
export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  /** 添加文件并自动选中第一个 */
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: FileItem[] = Array.from(newFiles).map((f) => ({
      id: uid(),
      file: f,
      thumbUrl: URL.createObjectURL(f),
    }))
    setFiles((prev) => {
      const updated = [...prev, ...items]
      if (updated.length > 0 && !selectedId) {
        setSelectedId(items[0].id)
      }
      return updated
    })
  }, [])

  /** 移除文件并释放缩略图 URL */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      const item = prev[idx]
      if (item) URL.revokeObjectURL(item.thumbUrl)
      const updated = prev.filter((f) => f.id !== id)
      if (selectedId === id) {
        const nextIdx = Math.min(idx, updated.length - 1)
        setSelectedId(updated[nextIdx]?.id ?? null)
      }
      return updated
    })
  }, [selectedId])

  /** 清空所有文件并释放所有缩略图 URL */
  const clearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.thumbUrl))
    setFiles([])
    setSelectedId(null)
  }, [files])

  const selectedFile = files.find((f) => f.id === selectedId) ?? null

  return { files, selectedId, selectedFile, addFiles, removeFile, setSelectedId, clearAll }
}
