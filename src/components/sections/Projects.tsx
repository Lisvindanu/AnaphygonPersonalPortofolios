import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
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

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-6 text-white text-3xl font-black leading-none hover:opacity-60"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <img
        src={src}
        alt=""
        className="max-w-[90vw] max-h-[90vh] object-contain border-2 border-manga-white"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  )
}

// ─── Image Slider ─────────────────────────────────────────────────────────────
function ImageSlider({
  images,
  aspectClass,
}: {
  images: string[]
  aspectClass?: string
}) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const dragStart = useRef<number | null>(null)

  if (images.length === 0) return null

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const delta = e.clientX - dragStart.current
    dragStart.current = null
    if (Math.abs(delta) < 8) {
      // tap → lightbox
      setLightbox(images[current])
    } else if (delta < -40) {
      next()
    } else if (delta > 40) {
      prev()
    }
  }

  return (
    <>
      <div className="relative overflow-hidden border-2 border-manga-black group-hover:border-manga-gray-600 select-none">
        {/* Image */}
        <div
          className={`w-full ${aspectClass ?? 'aspect-video'} overflow-hidden cursor-zoom-in`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <img
            src={images[current]}
            alt=""
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Arrows — only if multiple */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-0 top-0 bottom-0 px-3 flex items-center bg-gradient-to-r from-black/40 to-transparent hover:from-black/70 transition-all"
              aria-label="Previous"
            >
              <span className="text-white font-black text-lg leading-none">‹</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center bg-gradient-to-l from-black/40 to-transparent hover:from-black/70 transition-all"
              aria-label="Next"
            >
              <span className="text-white font-black text-lg leading-none">›</span>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* View hint */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 pointer-events-none">
          {images.length > 1 ? `${current + 1}/${images.length}` : '⤢'}
        </div>
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}

// ─── Projects Section ─────────────────────────────────────────────────────────
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

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, inView }: { project: Project; index: number; inView: boolean }) {
  const isFeatured = project.isFeatured
  const colSpan = isFeatured ? 'md:col-span-12' : 'md:col-span-6'
  const techStack = Array.isArray(project.techStack) ? project.techStack : []
  const imageRight = index % 4 === 1 || index % 4 === 2

  // Combine imageUrl + gallery images into one slider array
  const allImages = [
    ...(project.imageUrl ? [project.imageUrl] : []),
    ...(Array.isArray(project.images) ? project.images : []),
  ]

  return (
    <div
      className={colSpan}
      style={{ animation: inView ? `manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms both` : 'none', opacity: inView ? undefined : 0 }}
    >
      <MangaPanel className="border-2 border-manga-black group hover:bg-manga-black hover:text-manga-white transition-colors duration-200 h-full">
        {isFeatured ? (
          /* Featured: horizontal layout */
          <div className={`flex flex-col h-full ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            {allImages.length > 0 && (
              <div className={`w-full md:w-1/2 flex-shrink-0 ${imageRight ? 'md:border-l-2' : 'md:border-r-2'} border-manga-black`}>
                <ImageSlider images={allImages} aspectClass="h-56 md:h-full" />
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
            {allImages.length > 0 && (
              <div className="w-full mb-4">
                <ImageSlider images={allImages} aspectClass="aspect-video" />
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
