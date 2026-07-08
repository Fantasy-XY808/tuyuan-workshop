import { useState } from "react"
import { Download, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { FileItem } from "@/hooks/use-files"
import type { ExifValues } from "@/lib/exif"
import { readExif, writeExif } from "@/lib/exif"
import { detectFormat, formatLabel } from "@/lib/format"
import { tagCategories } from "@/lib/tags"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface BatchPanelProps {
  files: FileItem[]
}

interface FieldEntry {
  id: string
  key: string
  value: string
}

const allTags = tagCategories.flatMap((c) => c.fields)

export function BatchPanel({ files }: BatchPanelProps) {
  const [selected, setSelected] = useState<string[]>(files.map((f) => f.id))
  const [fields, setFields] = useState<FieldEntry[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const addField = () => {
    const next = allTags.find((t) => !fields.find((f) => f.key === t.key))
    setFields([...fields, { id: crypto.randomUUID(), key: next?.key ?? allTags[0]?.key ?? "", value: "" }])
  }

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, key: string, value: string) => {
    setFields(fields.map((f) => f.id === id ? { ...f, key, value } : f))
  }

  const toggleAll = () => {
    if (selected.length === files.length) {
      setSelected([])
    } else {
      setSelected(files.map((f) => f.id))
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const handleBatch = async () => {
    const toProcess = files.filter((f) => selected.includes(f.id))
    if (toProcess.length === 0) return

    setProcessing(true)
    setProgress(0)

    const zip = new JSZip()

    for (let i = 0; i < toProcess.length; i++) {
      const item = toProcess[i]
      try {
        const current = await readExif(item.file)
        const values: ExifValues = {}
        for (const f of fields) {
          if (f.key && f.value) values[f.key] = f.value
        }
        const merged = { ...current.exif, ...values }
        const written = await writeExif(item.file, merged)
        zip.file(item.file.name, written)
      } catch (err: any) {
        toast.error(`${item.file.name}: ${err.message}`)
      }
      setProgress(((i + 1) / toProcess.length) * 100)
    }

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "batch-processed.zip")
    toast.success(`已处理 ${toProcess.length} 个文件`)
    setProcessing(false)
  }

  const hasChanges = fields.some((f) => f.key && f.value)

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">批量修改字段</p>
          <Button variant="outline" size="sm" onClick={addField} disabled={fields.length >= allTags.length}>
            <Plus className="h-3 w-3 mr-1" />
            添加字段
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">点击「添加字段」选择要修改的 EXIF 标签</p>
        ) : (
          <div className="space-y-2">
            {fields.map((entry) => {
              const def = allTags.find((t) => t.key === entry.key)
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  <Select value={entry.key} onValueChange={(v: string) => updateField(entry.id, v, entry.value)}>
                    <SelectTrigger className="w-44 h-9">
                      <SelectValue placeholder="选择字段" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTags.map((t) => (
                        <SelectItem key={t.key} value={t.key} disabled={!!fields.find((f) => f.key === t.key && f.id !== entry.id)}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={def ? `输入${def.label}` : "输入新值"}
                    value={entry.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField(entry.id, entry.key, e.target.value)}
                    className="flex-1 h-9"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeField(entry.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">文件列表 ({files.length})</p>
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <Checkbox
              checked={selected.length === files.length && files.length > 0}
              onCheckedChange={toggleAll}
            />
            全选
          </label>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {files.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-muted"
            >
              <Checkbox
                checked={selected.includes(item.id)}
                onCheckedChange={() => toggle(item.id)}
              />
              <Badge variant="outline" className="text-xs">{formatLabel(detectFormat(item.file))}</Badge>
              <span className="truncate">{item.file.name}</span>
            </label>
          ))}
        </div>
      </Card>

      {processing && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            处理中... {Math.round(progress)}%
          </p>
        </div>
      )}

      <Button
        className="w-full"
        disabled={!hasChanges || selected.length === 0 || processing}
        onClick={handleBatch}
      >
        {processing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        处理 {selected.length} 个文件并下载 ZIP
      </Button>
    </div>
  )
}
