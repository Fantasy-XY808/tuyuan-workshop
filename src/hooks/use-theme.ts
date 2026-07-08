/**
 * @file 主题管理
 * 使用 next-themes 实现暗色/亮色模式切换。
 * 每次切换时同步更新 <html> 的 className。
 */

import { useState, useEffect } from "react"

/** 主题管理 Hook */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  const toggle = () => setDark((prev) => !prev)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return { dark, toggle }
}
