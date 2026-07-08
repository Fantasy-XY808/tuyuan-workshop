import { UploadZone } from "@/components/upload-zone"
import { Logo } from "@/components/logo"
import { TiltCard } from "@/components/tilt-card"
import { Shield, Image, Download, Zap } from "lucide-react"

interface HomePageProps {
  onFiles: (files: FileList | File[]) => void
}

const features = [
  { icon: Shield, title: "隐私优先", desc: "所有处理在浏览器本地完成，无一字节上传" },
  { icon: Image, title: "多格式支持", desc: "JPEG / PNG / WebP / HEIC / AVIF 全覆盖" },
  { icon: Download, title: "批量处理", desc: "多文件批量编辑，一键导出 ZIP" },
  { icon: Zap, title: "无需安装", desc: "浏览器即开即用，零依赖零配置" },
]

const titleChars = "图元工坊".split("")

export function HomePage({ onFiles }: HomePageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-10 px-4">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs text-muted-foreground bg-muted/50 relative overflow-hidden">
          <Shield className="h-3 w-3" />
          本地处理 · 不上传服务器
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        </div>
        <div>
          <div className="size-24 mx-auto mb-5 text-primary animate-scale-in">
            <Logo className="size-24" />
          </div>
          <h1
            className="text-4xl font-bold tracking-wide"
            style={{ fontFamily: "KaiTi, STKaiti, serif" }}
          >
            {titleChars.map((char, i) => (
              <span
                key={i}
                className="inline-block animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
              >
                {char}
              </span>
            ))}
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "400ms", opacity: 0, animationFillMode: "forwards" }}>
             在浏览器中查看、编辑、擦除图片的 EXIF 元数据
          </p>
        </div>
      </div>

      <UploadZone onFiles={onFiles} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <TiltCard key={f.title} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="text-center space-y-1.5 p-4">
              <f.icon className="h-5 w-5 mx-auto text-primary" />
              <p className="text-sm font-medium">{f.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}
