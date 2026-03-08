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
        className="max-w-[90vw] max-h-[90vh] object-contain border-2 border-white"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  )
}

// ─── Image Slider ─────────────────────────────────────────────────────────────
function ImageSlider({ images, aspectClass }: { images: string[]; aspectClass?: string }) {
  const [current, setCurrent] = useState(0)
  const [dragOffset, setDragOffset] = useState(0) // fraction: -1 to 1
  const [snapping, setSnapping] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const pointerStart = useRef<{ x: number; moved: boolean } | null>(null)

  if (images.length === 0) return null

  const total = images.length
  const prevIdx = (current - 1 + total) % total
  const nextIdx = (current + 1) % total

  function go(dir: 1 | -1) {
    const target = dir === 1 ? nextIdx : prevIdx
    setSnapping(true)
    setDragOffset(dir === 1 ? -1 : 1)
    setTimeout(() => {
      setCurrent(target)
      setDragOffset(0)
      setSnapping(false)
    }, 280)
  }

  function onPointerDown(e: React.PointerEvent) {
    if (snapping) return
    pointerStart.current = { x: e.clientX, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointerStart.current || snapping) return
    const delta = e.clientX - pointerStart.current.x
    if (Math.abs(delta) > 6) pointerStart.current.moved = true
    if (pointerStart.current.moved) {
      const w = containerRef.current?.offsetWidth || 1
      // clamp drag — less resistance if single image
      const max = total > 1 ? 1 : 0.1
      setDragOffset(Math.max(-max, Math.min(max, delta / w)))
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return
    const wasMoved = pointerStart.current.moved
    pointerStart.current = null

    if (!wasMoved) {
      setDragOffset(0)
      setLightbox(images[current])
      return
    }

    if (total > 1 && dragOffset < -0.25) {
      go(1)
    } else if (total > 1 && dragOffset > 0.25) {
      go(-1)
    } else {
      // snap back
      setSnapping(true)
      setDragOffset(0)
      setTimeout(() => setSnapping(false), 280)
    }
  }

  const transition = snapping ? 'transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'

  // adjacent image that peeks in while dragging
  const adjacentIdx = dragOffset <= 0 ? nextIdx : prevIdx
  const adjacentBase = dragOffset <= 0 ? 1 : -1

  return (
    <>
      <div
        ref={containerRef}
        className={`relative overflow-hidden select-none border-2 border-manga-black group-hover:border-manga-gray-600 ${aspectClass ?? 'aspect-video'} cursor-grab active:cursor-grabbing`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Adjacent image — slides in from side */}
        {total > 1 && (
          <img
            src={images[adjacentIdx]}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0"
            style={{ transform: `translateX(${(adjacentBase + dragOffset) * 100}%)`, transition }}
          />
        )}

        {/* Current image */}
        <img
          src={images[current]}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0"
          style={{ transform: `translateX(${dragOffset * 100}%)`, transition }}
        />

        {/* Thin panel divider line visible during drag */}
        {Math.abs(dragOffset) > 0.01 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-manga-black pointer-events-none z-10"
            style={{
              left: `calc(${dragOffset * 100}% - 1px)`,
              opacity: Math.min(1, Math.abs(dragOffset) * 4),
            }}
          />
        )}

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              className="absolute left-0 top-0 bottom-0 px-3 flex items-center bg-gradient-to-r from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onClick={(e) => { e.stopPropagation(); go(-1) }}
              aria-label="Previous"
            >
              <span className="text-white font-black text-xl leading-none">‹</span>
            </button>
            <button
              className="absolute right-0 top-0 bottom-0 px-3 flex items-center bg-gradient-to-l from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onClick={(e) => { e.stopPropagation(); go(1) }}
              aria-label="Next"
            >
              <span className="text-white font-black text-xl leading-none">›</span>
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === current ? 'bg-white' : 'bg-white/35'}`}
              />
            ))}
          </div>
        )}

        {/* Counter / zoom hint */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 pointer-events-none z-20">
          {total > 1 ? `${current + 1} / ${total}` : '⤢'}
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
            <p className="text-3xl font-black text-manga-gray-400" style={{ fontFamily: 'Bangers, cursive' }}>
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
