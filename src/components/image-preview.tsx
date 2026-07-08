import { AspectRatio } from "@/components/ui/aspect-ratio"
import type { FileItem } from "@/hooks/use-files"
import { detectFormat, formatLabel } from "@/lib/format"

interface ImagePreviewProps {
  fileItem: FileItem | null
}

export function ImagePreview({ fileItem }: ImagePreviewProps) {
  if (!fileItem) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted rounded-md text-sm text-muted-foreground">
        选择文件以预览
      </div>
    )
  }

  const fmt = detectFormat(fileItem.file)
  const size = (fileItem.file.size / 1024).toFixed(1)

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border">
        <AspectRatio ratio={4 / 3}>
          <img
            src={fileItem.thumbUrl}
            alt={fileItem.file.name}
            className="object-contain w-full h-full"
          />
        </AspectRatio>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="truncate">{fileItem.file.name}</span>
        <span className="shrink-0">{formatLabel(fmt)} &middot; {size} KB</span>
      </div>
    </div>
  )
}
