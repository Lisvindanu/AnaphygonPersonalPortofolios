import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { Project } from '~/db/schema'

function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('mailto:')) {
    return trimmed
  }
  return undefined
}

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} id="projects" className="w-full">
      <div
        style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
      >
        {/* Header */}
        <MangaPanel thick className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
            <h2
              className="text-4xl md:text-5xl font-black text-manga-black"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              PROJECTS
            </h2>
            <span className="text-xs uppercase tracking-widest text-manga-gray-600">
              — Chapter 05: Work & Experiments
            </span>
          </div>
        </MangaPanel>

        {projects.length === 0 ? (
          <MangaPanel className="p-12 text-center border-2 border-manga-black">
            <p
              className="text-3xl font-black text-manga-gray-400"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              COMING SOON
            </p>
            <p className="text-sm text-manga-gray-400 mt-2">Projects are loading...</p>
          </MangaPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} inView={inView} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ProjectCard({ project, index, inView }: { project: Project; index: number; inView: boolean }) {
  const isFeatured = project.isFeatured
  const colSpan = isFeatured ? 'md:col-span-12' : 'md:col-span-6'
  const techStack = Array.isArray(project.techStack) ? project.techStack : []
  // Pattern: L R R L (repeating every 4)
  const imageRight = index % 4 === 1 || index % 4 === 2

  return (
    <div
      className={colSpan}
      style={{ animation: inView ? `manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms both` : 'none', opacity: inView ? undefined : 0 }}
    >
      <MangaPanel className="border-2 border-manga-black group hover:bg-manga-black hover:text-manga-white transition-colors duration-200 cursor-pointer h-full">
        {isFeatured ? (
          /* Featured: horizontal layout, alternating image side */
          <div className={`flex flex-col h-full ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            {project.imageUrl && (
              <div className={`w-full md:w-1/2 border-b-2 md:border-b-0 ${imageRight ? 'md:border-l-2' : 'md:border-r-2'} border-manga-black group-hover:border-manga-gray-600 overflow-hidden flex-shrink-0`}>
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-56 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
            )}
            <div className="p-6 md:p-10 flex flex-col justify-between flex-1">
              <div>
                <p className="text-xs uppercase tracking-widest text-popsicle-500 mb-3">★ Featured</p>
                <h3 className="text-3xl md:text-4xl font-black mb-3" style={{ fontFamily: 'Bangers, cursive' }}>
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-manga-gray-600 group-hover:text-manga-gray-400 leading-relaxed mb-4">
                    {project.description}
                  </p>
                )}
                {project.images && project.images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {project.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-40 h-28 object-cover border border-manga-black flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300" />
                    ))}
                  </div>
                )}
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {techStack.map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 border border-current font-mono">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4 border-t border-current">
                {project.repoUrl && (
                  <a href={safeHref(project.repoUrl)} target="_blank" rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest border-b border-current hover:opacity-70"
                    onClick={(e) => e.stopPropagation()}>
                    GitHub →
                  </a>
                )}
                {project.liveUrl && (
                  <a href={safeHref(project.liveUrl)} target="_blank" rel="noopener noreferrer"
                    className="text-xs uppercase tracking-widest border-b border-current hover:opacity-70"
                    onClick={(e) => e.stopPropagation()}>
                    Live →
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Non-featured: vertical layout */
          <div className="p-6 md:p-8 flex flex-col h-full">
            {project.imageUrl && (
              <div className="w-full mb-4 border-2 border-manga-black group-hover:border-manga-gray-600 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full aspect-video object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
            )}
            {project.images && project.images.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {project.images.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-32 h-20 object-cover border border-manga-black flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300" />
                ))}
              </div>
            )}
            <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'Bangers, cursive' }}>
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-manga-gray-600 group-hover:text-manga-gray-400 leading-relaxed mb-4">
                {project.description}
              </p>
            )}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {techStack.map((tech) => (
                  <span key={tech} className="text-xs px-2 py-0.5 border border-current font-mono">{tech}</span>
                ))}
              </div>
            )}
            <div className="flex gap-4 mt-auto pt-4">
              {project.repoUrl && (
                <a href={safeHref(project.repoUrl)} target="_blank" rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest border-b border-current hover:opacity-70"
                  onClick={(e) => e.stopPropagation()}>
                  GitHub →
                </a>
              )}
              {project.liveUrl && (
                <a href={safeHref(project.liveUrl)} target="_blank" rel="noopener noreferrer"
                  className="text-xs uppercase tracking-widest border-b border-current hover:opacity-70"
                  onClick={(e) => e.stopPropagation()}>
                  Live →
                </a>
              )}
            </div>
          </div>
        )}
      </MangaPanel>
    </div>
  )
}
