import { X, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FileItem } from "@/hooks/use-files"
import { detectFormat, formatLabel } from "@/lib/format"

interface FileListProps {
  files: FileItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  dirtyIds?: Set<string>
}

export function FileList({ files, selectedId, onSelect, onRemove, dirtyIds }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div>
      <p className="text-sm text-muted-foreground font-medium px-1 pb-2">
        已选文件 ({files.length})
      </p>
      <div className="space-y-1">
        {files.map((item) => {
          const fmt = detectFormat(item.file)
          return (
            <div
              key={item.id}
              className={cn(
                "grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-1.5 p-2 rounded-md cursor-pointer text-sm transition-all hover:bg-muted/70 active:scale-[0.98]",
                selectedId === item.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => onSelect(item.id)}
            >
              <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
              {dirtyIds?.has(item.id) && <span className="text-[10px] text-amber-500 font-bold shrink-0">!</span>}
              <span className="truncate text-xs">{item.file.name}</span>
              <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">{formatLabel(fmt)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0"
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove(item.id) }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
