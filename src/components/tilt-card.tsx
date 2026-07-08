import { useRef, useState, type ReactNode } from "react"

interface TiltCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function TiltCard({ children, className = "", style: customStyle }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setStyle({
      transform: `perspective(800px) rotateX(${(y - cy) / 10}deg) rotateY(${(cx - x) / 10}deg)`,
      background: `radial-gradient(300px circle at ${x}px ${y}px, rgba(59,130,246,0.06), transparent 40%)`,
    })
  }

  const handleMouseLeave = () => {
    setStyle({ transform: "perspective(800px) rotateX(0) rotateY(0)" })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...customStyle, ...style }}
      className={`relative overflow-hidden rounded-xl border bg-card transition-[transform,background] duration-200 ease-out ${className}`}
    >
      {children}
    </div>
  )
}
