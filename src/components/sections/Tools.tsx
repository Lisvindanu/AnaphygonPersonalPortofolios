import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { Tool } from '~/db/schema'
import { TOOL_CATEGORIES } from '~/db/schema'

interface ToolsProps {
  tools: Tool[]
}

export function Tools({ tools }: ToolsProps) {
  const { ref, inView } = useInView()

  const grouped = TOOL_CATEGORIES.reduce<Record<string, Tool[]>>((acc, cat) => {
    const items = tools.filter((t) => t.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  if (tools.length === 0) return null

  return (
    <section ref={ref} id="tools" className="w-full">
      {/* Header */}
      <MangaPanel
        inverted
        className="p-6 md:p-8"
        style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
      >
        <div className="flex items-baseline gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-manga-white" style={{ fontFamily: 'Bangers, cursive' }}>
            TOOLS
          </h2>
          <span className="text-popsicle-300 text-sm uppercase tracking-widest">— Chapter 04: Daily Arsenal</span>
        </div>
      </MangaPanel>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        {Object.entries(grouped).map(([category, items], i) => (
          <div
            key={category}
            className="md:col-span-4"
            style={{ animation: inView ? `manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms both` : 'none', opacity: inView ? undefined : 0 }}
          >
            <MangaPanel className="p-6 h-full border-2 border-manga-black">
              <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-4">[ {category} ]</p>
              <div className="flex flex-wrap gap-2">
                {items.map((tool) => (
                  <span
                    key={tool.id}
                    className="text-sm font-bold px-3 py-1 border-2 border-manga-black bg-manga-white hover:bg-manga-black hover:text-manga-white transition-colors duration-150 cursor-default"
                  >
                    {tool.name}
                  </span>
                ))}
              </div>
            </MangaPanel>
          </div>
        ))}
      </div>
    </section>
  )
}
