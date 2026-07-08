import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"

interface HeaderProps {
  dark: boolean
  onToggleTheme: () => void
  onHome: () => void
}

export function Header({ dark, onToggleTheme, onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <button onClick={onHome} className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="size-8 text-primary">
            <Logo />
          </div>
          <span className="text-xl font-bold tracking-wide" style={{ fontFamily: "KaiTi, STKaiti, serif" }}>
            图元工坊
          </span>
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">
            本地处理
          </Badge>
          <Button variant="ghost" size="icon" onClick={onToggleTheme}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
