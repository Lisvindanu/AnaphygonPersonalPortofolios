import { useState } from 'react'
import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { Tool } from '~/db/schema'
import { TOOL_CATEGORIES } from '~/db/schema'

interface ToolsProps {
  tools: Tool[]
}

// Map common names → devicon slug
const SLUG_MAP: Record<string, string> = {
  'node.js': 'nodejs',
  'nodejs': 'nodejs',
  'react native': 'react',
  'tailwind css': 'tailwindcss',
  'tailwind': 'tailwindcss',
  'next.js': 'nextjs',
  'nuxt.js': 'nuxtjs',
  'vue.js': 'vuejs',
  'vue': 'vuejs',
  'angular': 'angularjs',
  'c++': 'cplusplus',
  'c#': 'csharp',
  '.net': 'dotnetcore',
  'asp.net': 'dotnetcore',
  'postgresql': 'postgresql',
  'postgres': 'postgresql',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'express': 'express',
  'express.js': 'express',
  'vs code': 'vscode',
  'vscode': 'vscode',
  'visual studio code': 'vscode',
  'visual studio': 'visualstudio',
  'android studio': 'androidstudio',
  'github': 'github',
  'gitlab': 'gitlab',
  'figma': 'figma',
  'php': 'php',
  'laravel': 'laravel',
  'kotlin': 'kotlin',
  'swift': 'swift',
  'java': 'java',
  'python': 'python',
  'golang': 'go',
  'go': 'go',
  'rust': 'rust',
  'ruby': 'ruby',
  'rails': 'rails',
  'spring': 'spring',
  'django': 'django',
  'flask': 'flask',
  'redis': 'redis',
  'nginx': 'nginx',
  'linux': 'linux',
  'ubuntu': 'ubuntu',
  'debian': 'debian',
  'aws': 'amazonwebservices',
  'gcp': 'googlecloud',
  'google cloud': 'googlecloud',
  'azure': 'azure',
  'firebase': 'firebase',
  'supabase': 'supabase',
  'prisma': 'prisma',
  'graphql': 'graphql',
  'webpack': 'webpack',
  'babel': 'babel',
  'jest': 'jest',
  'vim': 'vim',
  'neovim': 'neovim',
}

// Tools known to not exist in devicons — skip immediately
const NO_ICON = new Set([
  'krita', 'canva', 'notion', 'obsidian', 'trello', 'jira', 'confluence',
  'tanstack', 'framer motion', 'shadcn', 'shadcn/ui', 'drizzle', 'drizzle orm',
  'bun', 'pm2', 'postman', 'insomnia',
])

// Variants to try in order
const VARIANTS = ['original', 'plain', 'line', 'original-wordmark', 'plain-wordmark']

function getDeviconUrl(name: string, variant = 'original') {
  const key = name.toLowerCase().trim()
  const slug = SLUG_MAP[key] ?? key.replace(/\s+/g, '').replace(/\./g, '')
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-${variant}.svg`
}

function ToolIcon({ name }: { name: string }) {
  const [variantIdx, setVariantIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed || NO_ICON.has(name.toLowerCase().trim())) return null

  return (
    <img
      src={getDeviconUrl(name, VARIANTS[variantIdx])}
      alt=""
      className="w-5 h-5 flex-shrink-0"
      onError={() => {
        if (variantIdx < VARIANTS.length - 1) {
          setVariantIdx((v) => v + 1)
        } else {
          setFailed(true)
        }
      }}
    />
  )
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
      <MangaPanel
        inverted
        className="p-6 md:p-8"
        style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
      >
        <div className="flex items-baseline gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-manga-white" style={{ fontFamily: 'Bangers, cursive' }}>
            LANGUAGES & TOOLS
          </h2>
          <span className="text-popsicle-300 text-sm uppercase tracking-widest">— Chapter 04: Daily Arsenal</span>
        </div>
      </MangaPanel>

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
                    className="flex items-center gap-1.5 text-sm font-bold px-3 py-1 border-2 border-manga-black bg-manga-white hover:bg-manga-black hover:text-manga-white transition-colors duration-150 cursor-default group/tool"
                  >
                    <span className="group-hover/tool:invert transition-all duration-150">
                      <ToolIcon name={tool.name} />
                    </span>
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
