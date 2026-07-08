import { useState } from "react"
import { Save, RotateCcw, Loader2, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { FileItem } from "@/hooks/use-files"
import type { ExifValues } from "@/lib/exif"
import { tagCategories, getTagDef } from "@/lib/tags"

interface ExifEditorProps {
  fileItem: FileItem | null
  exif: ExifValues
  loading: boolean
  dirty: boolean
  onUpdate: (key: string, value: string) => void
  onSave: () => Promise<Blob | null>
  onRemove: () => Promise<Blob | null>
  onSaved?: () => void
}

function ExifField({ fieldKey, value, onChange, label }: { fieldKey: string; value: string; onChange: (v: string) => void; label: string }) {
  const def = getTagDef(fieldKey)

  const rowClass = "flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 sm:items-center text-sm"

  if (def?.type === "select" && def.options) {
    return (
      <div className={rowClass}>
        <label className="text-muted-foreground truncate" title={label}>{label}</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">-</SelectItem>
            {def.options.map((opt) => {
              const [val, l] = opt.split("-")
              return <SelectItem key={opt} value={val}>{l}</SelectItem>
            })}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (def?.type === "date") {
    return (
      <div className={rowClass}>
        <label className="text-muted-foreground truncate" title={label}>{label}</label>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
        />
      </div>
    )
  }

  return (
    <div className={rowClass}>
      <label className="text-muted-foreground truncate" title={label}>{label}</label>
      <input
        type={def?.type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
      />
    </div>
  )
}

export function ExifEditor({ fileItem, exif, loading, dirty, onUpdate, onSave, onRemove, onSaved }: ExifEditorProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveFilename, setSaveFilename] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSaveClick = () => {
    if (!fileItem) return
    setSaveFilename(fileItem.file.name.replace(/\.[^/.]+$/, ""))
    setShowSaveDialog(true)
  }

  const handleSaveConfirm = async () => {
    if (!fileItem) return
    setSaving(true)
    const ext = fileItem.file.name.match(/\.[^/.]+$/)?.[0] ?? ".jpg"
    const blob = await onSave()
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = saveFilename + ext
      a.click()
      URL.revokeObjectURL(url)
      toast.success("保存成功")
      setShowSaveDialog(false)
      onSaved?.()
    } else {
      toast.error("保存失败")
    }
    setSaving(false)
  }

  const handleRemove = async () => {
    const blob = await onRemove()
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cleaned_${fileItem?.file.name ?? "image.jpg"}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("EXIF 已清除")
    } else {
      toast.error("清除失败")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!fileItem) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground flex-col gap-2">
        <FileImage className="h-6 w-6" />
        <span>选择文件查看元数据</span>
      </div>
    )
  }

  const knownKeys = new Set(tagCategories.flatMap((c) => c.fields.map((f) => f.key)))
  const otherFields = Object.keys(exif)
    .filter((k) => !knownKeys.has(k))
    .map((k) => ({ key: k, label: k, type: "text" as const }))

  const allCats = otherFields.length > 0
    ? [...tagCategories, { key: "other", label: "其他", fields: otherFields }]
    : tagCategories

  const totalFields = allCats.reduce((s, c) => s + c.fields.length, 0)
  const filledCount = allCats.reduce(
    (s, c) => s + c.fields.filter((f) => f.key in exif && exif[f.key] !== "").length, 0
  )

  return (
    <>
      <div>
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">EXIF 数据</p>
            <Badge variant="secondary" className="text-xs font-normal">
              {filledCount}/{totalFields} 个字段
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {dirty && <Badge variant="outline" className="text-xs">已修改</Badge>}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRemove}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  清除
                </Button>
              </TooltipTrigger>
              <TooltipContent>清除所有 EXIF 元数据</TooltipContent>
            </Tooltip>
            <Button size="sm" onClick={handleSaveClick} disabled={!dirty}>
              <Save className="h-3 w-3 mr-1" />
              保存
            </Button>
          </div>
        </div>

        <Separator className="my-3 shrink-0" />

        <Tabs defaultValue={allCats[0].key}>
          <TabsList className="shrink-0 w-full overflow-x-auto justify-start">
            {allCats.map((cat) => {
              const count = cat.fields.filter((f) => f.key in exif && exif[f.key] !== "").length
              return (
                <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                  {cat.label}
                  <span className="ml-1 text-[10px] opacity-60">({count}/{cat.fields.length})</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {allCats.map((cat) => (
            <TabsContent key={cat.key} value={cat.key} className="mt-2">
              <div className="space-y-3">
                {cat.fields.map((field) => {
                  const value = exif[field.key] ?? ""
                  return (
                    <ExifField
                      key={field.key}
                      fieldKey={field.key}
                      label={field.label}
                      value={value}
                      onChange={(v: string) => onUpdate(field.key, v)}
                    />
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保存文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">文件名称</label>
            <div className="flex items-center gap-1">
              <Input
                value={saveFilename}
                onChange={(e) => setSaveFilename(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground shrink-0">
                {fileItem?.file.name.match(/\.[^/.]+$/)?.[0] ?? ".jpg"}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">取消</Button>
            </DialogClose>
            <Button onClick={handleSaveConfirm} disabled={!saveFilename.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              确认保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
