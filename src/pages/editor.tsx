/**
 * @file 编辑器页面
 * 核心工作区，提供三栏布局：
 * - 左侧：文件列表 + 添加更多
 * - 右侧：预览 + EXIF 编辑 / 批量 / 隐私面板（标签切换）
 *
 * 功能：
 * - 文件选择与移除
 * - 左滑手势返回首页
 * - 未保存修改检测与弹窗提醒
 */

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Images, SlidersHorizontal, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FileList } from "@/components/file-list"
import { ImagePreview } from "@/components/image-preview"
import { ExifEditor } from "@/components/exif-editor"
import { BatchPanel } from "@/components/batch-panel"
import { PrivacyPanel } from "@/components/privacy-panel"
import { ErrorBoundary } from "@/components/error-boundary"
import { useFiles } from "@/hooks/use-files"
import { useExif } from "@/hooks/use-exif"

interface EditorPageProps {
  onBack: () => void
  uploadFiles?: FileList | File[]
}

export function EditorPage({ onBack, uploadFiles }: EditorPageProps) {
  const { files, selectedId, selectedFile, addFiles, removeFile, setSelectedId, clearAll } = useFiles()
  const { exif, loading, dirty, updateValue, save, remove } = useExif(selectedFile)
  const [mode, setMode] = useState<"editor" | "batch" | "privacy">("editor")
  const consumed = useRef(false)

  /* ---- 未保存检测 ---- */
  const [dirtyFiles, setDirtyFiles] = useState<Map<string, string>>(new Map())
  const [showBackWarn, setShowBackWarn] = useState(false)

  const handleDirtyChange = useCallback((fileId: string, fileName: string, isDirty: boolean) => {
    setDirtyFiles((prev) => {
      const next = new Map(prev)
      if (isDirty) next.set(fileId, fileName)
      else next.delete(fileId)
      return next
    })
  }, [])

  const handleBack = useCallback(() => {
    if (dirtyFiles.size > 0) setShowBackWarn(true)
    else { clearAll(); onBack() }
  }, [dirtyFiles, clearAll, onBack])

  const handleForceBack = useCallback(() => {
    setShowBackWarn(false)
    clearAll()
    onBack()
  }, [clearAll, onBack])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyFiles.size > 0) e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirtyFiles])

  /* ---- 左滑手势 ---- */
  const touchStartX = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 80) handleBack()
  }, [handleBack])

  /* ---- 处理由首页传入的文件 ---- */
  if (uploadFiles && !consumed.current) {
    consumed.current = true
    addFiles(uploadFiles)
  }

  return (
    <div
      className="flex flex-col max-w-6xl mx-auto w-full px-2 sm:px-4 py-4 gap-4 flex-1 min-h-0 animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 顶栏 */}
      <div className="flex items-center justify-between shrink-0">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </Button>
        <div className="bg-muted rounded-lg p-0.5 flex items-center">
          {([
            { key: "editor" as const, icon: Images, label: "编辑" },
            { key: "batch" as const, icon: SlidersHorizontal, label: "批量" },
            { key: "privacy" as const, icon: Shield, label: "隐私" },
          ]).map((item) => (
            <Button
              key={item.key}
              variant={mode === item.key ? "default" : "ghost"}
              size="sm"
              className="rounded-md px-2 sm:px-3"
              onClick={() => setMode(item.key)}
            >
              <item.icon className="h-4 w-4 mr-1" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 主体 */}
      <div className={`flex-1 min-h-0 grid gap-4 ${mode === "editor" ? "grid-rows-[auto_1fr] md:grid-cols-[220px_1fr] md:grid-rows-none" : "grid-cols-1"}`}>
        {/* 左侧：文件列表 */}
        <div className="flex flex-col gap-3 min-h-0 md:max-h-full">
          <div
            className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/30 transition-all shrink-0"
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = () => input.files && addFiles(input.files)
              input.click()
            }}
          >
            + 添加更多文件
          </div>
          <div className="bg-card border rounded-lg p-3 overflow-y-auto min-h-0 scrollbar-thin animate-slide-up">
            <FileList
              files={files}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRemove={removeFile}
              dirtyIds={new Set(dirtyFiles.keys())}
            />
          </div>
        </div>

        {/* 右侧：内容区 */}
        <div className="bg-card border rounded-lg p-4 overflow-y-auto min-h-0 scrollbar-thin animate-slide-up">
          {mode === "editor" && (
            <ErrorBoundary>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-[200px] lg:w-[220px] shrink-0">
                  <ImagePreview fileItem={selectedFile} />
                </div>
                <div className="flex-1 min-w-0">
                  <ExifEditor
                    fileItem={selectedFile}
                    exif={exif}
                    loading={loading}
                    dirty={dirty}
                    onUpdate={(k, v) => {
                      updateValue(k, v)
                      if (selectedFile) handleDirtyChange(selectedFile.id, selectedFile.file.name, true)
                    }}
                    onSave={save}
                    onRemove={remove}
                    onSaved={() => {
                      if (selectedFile) handleDirtyChange(selectedFile.id, selectedFile.file.name, false)
                    }}
                  />
                </div>
              </div>
            </ErrorBoundary>
          )}
          {mode === "batch" && <ErrorBoundary><BatchPanel files={files} /></ErrorBoundary>}
          {mode === "privacy" && <ErrorBoundary><PrivacyPanel files={files} /></ErrorBoundary>}
        </div>
      </div>

      {/* 未保存弹窗 */}
      <AlertDialog open={showBackWarn} onOpenChange={setShowBackWarn}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              未保存的修改
            </AlertDialogTitle>
            <AlertDialogDescription>
              以下文件有修改尚未导出保存，离开将丢失这些更改：
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {Array.from(dirtyFiles.entries()).map(([id, name]) => (
              <div key={id} className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/50">
                <span className="text-amber-500 font-bold">!</span>
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBackWarn(false)}>继续编辑</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceBack} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              放弃修改并返回
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
