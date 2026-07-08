import { useEffect, useState } from "react"

export function AnimatedGrid() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: [
            "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute inset-0 transition-[background] duration-75"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(59,130,246,0.08), transparent 50%)`,
        }}
      />
    </div>
  )
}
