import type { ReactNode } from "react"

interface AuroraUploadProps {
  children: ReactNode
  active: boolean
}

export function AuroraUpload({ children, active }: AuroraUploadProps) {
  return (
    <div className="relative">
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none rounded-xl transition-opacity duration-500 ${active ? "opacity-100" : "opacity-30"}`}
        aria-hidden="true"
      >
        <div className="absolute -top-1/3 -left-1/3 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-purple-400/15 via-pink-400/10 to-transparent blur-[80px] animate-aurora" />
        <div className="absolute -bottom-1/3 -right-1/3 w-1/2 h-1/2 rounded-full bg-gradient-to-tl from-blue-400/15 via-cyan-400/10 to-transparent blur-[80px] animate-aurora" style={{ animationDelay: "-7s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-gradient-to-tr from-primary/10 via-transparent to-transparent blur-[60px] animate-aurora" style={{ animationDelay: "-14s" }} />
      </div>
      {children}
    </div>
  )
}
