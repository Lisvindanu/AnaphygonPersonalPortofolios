import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { SoftSkill } from '~/db/schema'

interface SoftSkillsProps {
  skills: SoftSkill[]
}

export function SoftSkills({ skills }: SoftSkillsProps) {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="w-full">
      <div
        className="grid grid-cols-1 md:grid-cols-12 gap-0"
      >
        {/* Label */}
        <div className="md:col-span-3" style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}>
          <MangaPanel className="p-6 md:p-8 h-full flex flex-col justify-between border-4 border-manga-black">
            <div>
              <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-3">
                — Chapter 03
              </p>
              <h2
                className="text-4xl font-black text-manga-black leading-tight"
                style={{ fontFamily: 'Bangers, cursive' }}
              >
                SOFT<br />SKILLS
              </h2>
            </div>
            <p className="text-xs text-manga-gray-600 mt-4 leading-relaxed">
              The skills you build not from tutorials, but from surviving.
            </p>
          </MangaPanel>
        </div>

        {/* Skill panels */}
        <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-0">
          {skills.map((skill, i) => (
            <div
              key={skill.id}
              style={{ animation: inView ? `manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms both` : 'none', opacity: inView ? undefined : 0 }}
            >
              <MangaPanel className="p-6 md:p-8 h-full border-2 border-manga-black group hover:bg-manga-black hover:text-manga-white transition-colors duration-200">
                <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-2 group-hover:text-manga-gray-400">
                  0{i + 1}
                </p>
                <h3 className="text-lg font-black mb-2">{skill.name}</h3>
                <p className="text-sm text-manga-gray-600 leading-relaxed group-hover:text-manga-gray-400">
                  {skill.description}
                </p>
              </MangaPanel>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
