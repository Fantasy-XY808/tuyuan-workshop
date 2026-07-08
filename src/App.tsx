/**
 * @file 根组件
 * 管理页面路由（首页 ↔ 编辑器），使用状态而非 URL 路由。
 * 提供全局 Header、Theme、Toast 基础设施。
 */

import { useState } from "react"
import { Header } from "@/components/header"
import { AnimatedGrid } from "@/components/animated-grid"
import { ParticleBg } from "@/components/particle-bg"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTheme } from "@/hooks/use-theme"
import { HomePage } from "@/pages/home"
import { EditorPage } from "@/pages/editor"

export default function App() {
  const { dark, toggle } = useTheme()
  const [page, setPage] = useState<"home" | "editor">("home")
  const [pendingFiles, setPendingFiles] = useState<FileList | File[] | undefined>()

  const handleFiles = (files: FileList | File[]) => {
    setPendingFiles(files)
    setPage("editor")
  }

  const handleHome = () => {
    setPage("home")
    setPendingFiles(undefined)
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col relative">
        <AnimatedGrid />
        <ParticleBg />
        <Header dark={dark} onToggleTheme={toggle} onHome={handleHome} />
        <main className="flex-1 flex flex-col min-h-0">
          {page === "home" ? (
            <HomePage onFiles={handleFiles} />
          ) : (
            <EditorPage onBack={handleHome} uploadFiles={pendingFiles} />
          )}
        </main>
        <footer className="border-t py-3 text-center text-xs text-muted-foreground">
           所有处理在浏览器本地完成，图片不上传服务器
        </footer>
      </div>
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  )
}
