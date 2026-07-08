import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FORMAT_BADGES } from "@/lib/format"
import { AuroraUpload } from "@/components/aurora-upload"

interface UploadZoneProps {
  onFiles: (files: FileList | File[]) => void
}

export function UploadZone({ onFiles }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files)
    },
    [onFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  return (
    <AuroraUpload active={dragging}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={[
          "relative border-2 rounded-xl p-12 text-center cursor-pointer",
          "transition-all duration-300 outline-none group overflow-hidden",
          dragging
            ? "border-primary bg-primary/5 scale-[1.02] animate-pulse-glow"
            : "border-dashed border-input hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm",
        ].join(" ")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onFiles(e.target.files)}
        />
        <div className={[
          "flex flex-col items-center gap-1 transition-transform duration-200",
          dragging ? "scale-105" : "",
        ].join(" ")}>
          <div className={[
            "rounded-full p-3 mb-2 transition-colors duration-200",
            dragging ? "bg-primary/10" : "bg-muted",
          ].join(" ")}>
            <Upload className={[
              "h-8 w-8 transition-colors duration-200",
              dragging ? "text-primary" : "text-muted-foreground",
            ].join(" ")} />
          </div>
          <p className="text-base font-medium">
            {dragging ? "松开以导入" : "拖拽图片到此处"}
          </p>
          <p className="text-sm text-muted-foreground">或点击选择文件</p>
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {FORMAT_BADGES.map((f) => (
              <span key={f.label} className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground font-medium">
                {f.label} <span className="opacity-60">({f.caps})</span>
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4 pointer-events-none" asChild>
            <span>选择文件</span>
          </Button>
        </div>
      </div>
    </AuroraUpload>
  )
}
