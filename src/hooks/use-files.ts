import { useState, useCallback } from "react"

function uid(): string {
  try { return crypto.randomUUID() } catch { return `${Date.now()}-${Math.random().toString(36).slice(2,10)}` }
}

export interface FileItem {
  id: string
  file: File
  thumbUrl: string
}

export function useFiles() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

  const clearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.thumbUrl))
    setFiles([])
    setSelectedId(null)
  }, [files])

  const selectedFile = files.find((f) => f.id === selectedId) ?? null

  return { files, selectedId, selectedFile, addFiles, removeFile, setSelectedId, clearAll }
}
