import { MangaPanel } from '~/components/ui/MangaPanel'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center p-4 md:p-0 overflow-hidden manga-dots">
      {/* Background grid lines — manga page feel */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">

          {/* Main name panel */}
          <div className="md:col-span-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <MangaPanel thick className="p-8 md:p-14 relative overflow-hidden">
              {/* Character — absolute, right side, bottom aligned to divider */}
              <img
                src="/images/danucapeknobg.png"
                alt="Lisvindanu"
                className="hidden md:block absolute bottom-[120px] w-full pointer-events-none"
                style={{ left: '37%' }}
              />

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-manga-gray-600 mb-4 relative">
                — Portfolio {new Date().getFullYear()}
              </p>
              <h1
                className="text-7xl md:text-9xl font-black leading-none mb-6 text-manga-black relative"
                style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.03em' }}
              >
                ANA<br />PHY<br />GON
              </h1>
              <div className="border-t-2 border-manga-black pt-4 relative">
                <p className="text-sm md:text-base font-medium text-manga-gray-600 max-w-sm">
                  Lisvindanu — Fullstack & Mobile Developer.<br />
                  Still learning, still moving forward.
                </p>
              </div>
            </MangaPanel>
          </div>

          {/* Side panel — identity */}
          <div className="md:col-span-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <MangaPanel inverted className="p-6 md:p-8 h-full flex flex-col justify-between min-h-48 md:min-h-0">
              <div>
                <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-3">
                  [ anaphygon ]
                </p>
                <p className="text-popsicle-300 text-sm leading-relaxed">
                  Ancient Greek.<br />
                  <em>"To run away."</em>
                </p>
              </div>
              <div className="mt-6 border-t border-manga-gray-800 pt-4">
                <p className="text-xs text-manga-gray-400 leading-relaxed">
                  This portfolio is not an escape.<br />
                  It is a step forward.
                </p>
              </div>

            </MangaPanel>
          </div>

        </div>

        {/* Scroll hint — CSS animation, no JS on frame */}
        <div className="mt-8 flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 border-2 border-manga-black flex items-center justify-center">
            <div className="w-1 h-2 bg-manga-black animate-scroll-hint" />
          </div>
          <span className="text-xs uppercase tracking-widest text-manga-gray-600">Scroll to read</span>
        </div>
      </div>
    </section>
  )
}
