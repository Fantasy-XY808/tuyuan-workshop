import { useState } from "react"
import { ShieldAlert, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { FileItem } from "@/hooks/use-files"
import { removeExifSelective } from "@/lib/exif"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface PrivacyPanelProps {
  files: FileItem[]
}

interface EraseOption {
  key: string
  label: string
  fields: string[]
}

const eraseOptions: EraseOption[] = [
  { key: "gps", label: "GPS 位置信息", fields: ["GPS:GPSLatitude", "GPS:GPSLongitude", "GPS:GPSAltitude", "GPS GPSLatitudeRef", "GPS GPSLongitudeRef", "GPS GPSAltitudeRef"] },
  { key: "camera", label: "相机信息（型号/序列号）", fields: ["EXIF:Make", "EXIF:Model", "EXIF:SerialNumber", "EXIF:LensSerialNumber"] },
  { key: "timestamp", label: "时间戳", fields: ["EXIF:DateTimeOriginal", "EXIF:CreateDate", "EXIF:ModifyDate", "GPS:GPSDateStamp"] },
  { key: "params", label: "拍摄参数", fields: ["EXIF:ISOSpeedRatings", "EXIF:FNumber", "EXIF:ExposureTime", "EXIF:FocalLength", "EXIF:Flash"] },
  { key: "software", label: "软件信息", fields: ["EXIF:Software"] },
  { key: "copyright", label: "版权信息", fields: ["EXIF:Copyright", "EXIF:Artist", "XMP-dc:Rights"] },
  { key: "all", label: "全部 EXIF", fields: ["EXIF:*", "GPS:*", "XMP:*"] },
]

export function PrivacyPanel({ files }: PrivacyPanelProps) {
  const [selected, setSelected] = useState<string[]>(["gps", "camera", "timestamp", "params"])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<{ name: string; status: "ok" | "skip" | "error"; msg: string }[]>([])

  const individualKeys = eraseOptions.slice(0, -1).map((o) => o.key)
  const allSelected = individualKeys.every((k) => selected.includes(k))

  const toggle = (key: string) => {
    if (key === "all") {
      if (allSelected) {
        setSelected(selected.filter((k) => !individualKeys.includes(k) && k !== "all"))
      } else {
        setSelected([...selected.filter((k) => k !== "all"), ...individualKeys])
      }
    } else {
      const next = selected.includes(key)
        ? selected.filter((k) => k !== key && k !== "all")
        : [...selected, key]
      setSelected(next)
    }
  }

  const handleErase = async () => {
    setProcessing(true)
    setResults([])

    const opts = selected.flatMap((k: string) => eraseOptions.find((o) => o.key === k)?.fields ?? [])
    const batchResults: { name: string; status: "ok" | "skip" | "error"; msg: string }[] = []

    const zip = new JSZip()
    const targets = files

    for (const item of targets) {
      try {
        const blob = await removeExifSelective(item.file, opts)
        zip.file(item.file.name, blob)
      batchResults.push({ name: item.file.name, status: "ok", msg: "已清除" })
    } catch (err: any) {
      batchResults.push({ name: item.file.name, status: "error", msg: err.message })
    }
  }

  setResults(batchResults)

    if (targets.length > 0) {
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "cleaned-files.zip")
      toast.success(`已处理 ${results.filter((r) => r.status === "ok").length} 个文件`)
    }

    setProcessing(false)
  }

  return (
    <div className="space-y-4">
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>隐私擦除</AlertTitle>
           <AlertDescription>
           此操作将永久删除所选元数据字段且不可逆。JPEG/PNG/WebP 支持原格式无损擦除，HEIC/AVIF 使用 ExifTool 处理。
         </AlertDescription>
      </Alert>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">擦除配置</p>
        <div className="space-y-2">
          {eraseOptions.slice(0, -1).map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selected.includes(opt.key)}
                onCheckedChange={() => toggle(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
          <Separator />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => toggle("all")}
            />
            <span>{eraseOptions.find((o) => o.key === "all")?.label}</span>
          </label>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          待处理：{files.length} 个文件
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={files.length === 0 || processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              一键擦除并下载
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认擦除？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不可逆！将删除 {files.length} 个文件中的选定元数据字段。
                处理后导出为 ZIP 文件。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleErase}>确认擦除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {results.length > 0 && (
        <Card className="p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">处理结果</p>
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Badge variant={r.status === "ok" ? "default" : r.status === "skip" ? "secondary" : "destructive"} className="h-5">
                {r.status === "ok" ? "OK" : r.status === "skip" ? "-" : "X"}
              </Badge>
              <span className="truncate">{r.name}</span>
              <span className="text-muted-foreground shrink-0">{r.msg}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
