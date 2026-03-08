import { useState } from 'react'
import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'

export function About() {
  const { ref, inView } = useInView()
  const [clickCount, setClickCount] = useState(0)
  const easterEggActive = clickCount >= 5

  function handleChapterClick() {
    setClickCount((c) => c + 1)
  }

  return (
    <section ref={ref} id="about" className="w-full">
      <style>{`
        @keyframes about-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .easter-egg-text {
          animation: about-fade-in 0.5s ease-out both;
        }
      `}</style>
      <div
        className="grid grid-cols-1 md:grid-cols-12 gap-0"
      >
        {/* Label panel */}
        <div className="md:col-span-2" style={{ animation: inView ? 'manga-slam-left 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}>
          <MangaPanel inverted className="p-4 md:p-6 h-full flex items-center justify-center md:justify-start">
            <p
              className="text-popsicle-300 text-xl md:text-2xl font-black tracking-widest md:[writing-mode:vertical-lr] md:rotate-180"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              ABOUT
            </p>
          </MangaPanel>
        </div>

        {/* Main content */}
        <div className="md:col-span-7" style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) 80ms both' : 'none', opacity: inView ? undefined : 0 }}>
          <MangaPanel thick className="p-8 md:p-10 h-full">
            <p
              className="text-xs uppercase tracking-widest text-manga-gray-400 mb-6 cursor-pointer select-none"
              onClick={handleChapterClick}
              title="..."
            >
              — Chapter 01: Who Am I{easterEggActive ? ' ✦' : ''}
            </p>
            <div className="space-y-4 text-sm md:text-base leading-relaxed text-manga-gray-800">
              {easterEggActive ? (
                <div className="easter-egg-text space-y-4">
                  <p>
                    I'm <strong>Lisvindanu</strong>, born August 15, 2004. For years I ran from everything—
                    problems, family, and even myself. Anxiety, past trauma, and a long string of failures
                    made me feel worthless.
                  </p>
                  <p>
                    But at 21, I decided to stop running and start moving. Step by step. Like Naruto
                    mastering one technique before the next. Like Shinji finally choosing to stand up.
                    Like Shoya learning that change is always possible.
                  </p>
                  <p>
                    I failed to save someone I cared about—just like Jiraiya. But like him, I choose
                    to keep moving, to keep learning, to pass it forward.
                  </p>
                </div>
              ) : (
                <>
                  <p>
                    I'm <strong>Lisvindanu</strong>, a fullstack &amp; mobile developer based in Indonesia.
                  </p>
                  <p>
                    I build web and mobile applications — from architecture to deployment.
                  </p>
                  <p>
                    Focused on clean code, practical solutions, and continuously improving.
                  </p>
                </>
              )}
            </div>
          </MangaPanel>
        </div>

        {/* Quote panel */}
        <div className="md:col-span-3" style={{ animation: inView ? 'manga-slam-right 0.42s cubic-bezier(0.22, 1, 0.36, 1) 160ms both' : 'none', opacity: inView ? undefined : 0 }}>
          <MangaPanel className="p-6 md:p-8 h-full flex flex-col justify-center border-4 border-manga-black">
            <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-4">
              — Jiraiya
            </p>
            <blockquote
              className="text-2xl md:text-3xl font-black leading-tight text-manga-black"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              "WHEN PEOPLE GET HURT, THEY LEARN TO HATE."
            </blockquote>
            <p className="text-xs text-manga-gray-400 mt-4">
              And sometimes, through that pain, they learn to grow.
            </p>
          </MangaPanel>
        </div>
      </div>
    </section>
  )
}
