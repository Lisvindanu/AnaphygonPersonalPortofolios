import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { HardSkill } from '~/db/schema'

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Mobile', 'Database', 'Caching', 'DevOps', 'Other']

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  Frontend: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4,5 1,8 4,11"/>
      <polyline points="12,5 15,8 12,11"/>
      <line x1="9" y1="3" x2="7" y2="13"/>
    </svg>
  ),
  Backend: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="4" rx="1"/>
      <rect x="1" y="9" width="14" height="4" rx="1"/>
      <circle cx="13" cy="5" r="0.75" fill="currentColor"/>
      <circle cx="13" cy="11" r="0.75" fill="currentColor"/>
    </svg>
  ),
  Mobile: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="1" width="8" height="14" rx="1.5"/>
      <line x1="7" y1="12.5" x2="9" y2="12.5"/>
    </svg>
  ),
  Database: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="8" cy="4" rx="6" ry="2"/>
      <path d="M2 4v4c0 1.1 2.7 2 6 2s6-.9 6-2V4"/>
      <path d="M2 8v4c0 1.1 2.7 2 6 2s6-.9 6-2V8"/>
    </svg>
  ),
  DevOps: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="2"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
    </svg>
  ),
  Other: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="8,2 10,6 14,6.5 11,9.5 11.8,14 8,12 4.2,14 5,9.5 2,6.5 6,6"/>
    </svg>
  ),
}

interface HardSkillsProps {
  skills: HardSkill[]
}

export function HardSkills({ skills }: HardSkillsProps) {
  const { ref, inView } = useInView()

  const grouped = CATEGORY_ORDER.reduce<Record<string, HardSkill[]>>((acc, cat) => {
    const items = skills.filter((s) => s.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <section ref={ref} id="skills" className="w-full">
      <div
        style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
      >
        {/* Header */}
        <MangaPanel inverted className="p-6 md:p-8"
          style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
        >
          <div className="flex items-baseline gap-4">
            <h2
              className="text-4xl md:text-5xl font-black text-manga-white"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              HARD SKILLS
            </h2>
            <span className="text-popsicle-300 text-sm uppercase tracking-widest">
              — Chapter 02: Technical Arsenal
            </span>
          </div>
        </MangaPanel>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {Object.entries(grouped).map(([category, items], i) => {
            const total = Object.keys(grouped).length
            const colSpan = total <= 2 ? 'md:col-span-6' : total === 4 ? 'md:col-span-3' : 'md:col-span-4'
            return (
            <div
              key={category}
              className={colSpan}
              style={{ animation: inView ? `manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms both` : 'none', opacity: inView ? undefined : 0 }}
            >
              <MangaPanel className="p-6 h-full border-2 border-manga-black">
                <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-4 flex items-center">
                  {CATEGORY_ICONS[category] && (
                    <span className="w-4 h-4 inline-block mr-2 flex-shrink-0">
                      {CATEGORY_ICONS[category]}
                    </span>
                  )}
                  [ {category} ]
                </p>
                <div className="space-y-3">
                  {items.map((skill) => (
                    <SkillBar key={skill.id} skill={skill} />
                  ))}
                </div>
              </MangaPanel>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SkillBar({ skill }: { skill: HardSkill }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold text-manga-black">{skill.name}</span>
      <span className="text-xs uppercase tracking-widest text-manga-gray-600 border border-manga-black px-2 py-0.5">
        {skill.level}
      </span>
    </div>
  )
}
