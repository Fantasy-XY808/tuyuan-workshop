import { Sun, Palette, Heart, Landmark, type LucideIcon } from "lucide-react"

interface DemoImage {
  id: string
  label: string
  icon: LucideIcon
  gradient: string
  aspect: "landscape" | "portrait"
}

const images: DemoImage[] = [
  { id: "blue-white", label: "青花", icon: Palette, gradient: "from-blue-400 via-cyan-400 to-teal-500", aspect: "landscape" },
  { id: "sunset", label: "夕阳", icon: Sun, gradient: "from-orange-400 via-rose-400 to-red-500", aspect: "portrait" },
  { id: "bridge", label: "古桥", icon: Landmark, gradient: "from-emerald-400 via-green-400 to-teal-500", aspect: "landscape" },
  { id: "girl", label: "少女", icon: Heart, gradient: "from-pink-300 via-rose-300 to-purple-400", aspect: "portrait" },
]

export function DemoGallery() {
  const cols: Record<string, DemoImage[]> = { landscape: [], portrait: [] }
  for (const img of images) cols[img.aspect].push(img)

  return (
    <section className="animate-fade-in">
      <div className="text-center mb-5">
        <span className="text-xs text-muted-foreground tracking-[0.2em] uppercase">Demo</span>
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        {(["landscape", "portrait"] as const).map((aspect) => (
          <div key={aspect} className="space-y-3">
            {cols[aspect].map((img) => (
              <div
                key={img.id}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${img.gradient} 
                  ${img.aspect === "landscape" ? "aspect-video" : "aspect-[3/5]"}
                  shadow-sm hover:shadow-md transition-all duration-300
                  group cursor-default`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-2">
                  <img.icon className="size-4 text-white/90" />
                  <span className="text-sm font-medium text-white/90" style={{ fontFamily: "KaiTi, STKaiti, serif" }}>
                    {img.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
