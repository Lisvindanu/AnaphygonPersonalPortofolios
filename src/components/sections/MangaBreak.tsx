export function MangaBreak() {
  return (
    <div className="relative w-full overflow-hidden border-y-4 border-manga-black bg-manga-black manga-dots-dark">
      <div className="relative z-10 flex flex-col md:flex-row items-stretch">

        {/* Left accent block */}
        <div className="hidden md:flex flex-col justify-between w-16 border-r-2 border-manga-gray-800 p-4">
          <span className="text-manga-gray-800 text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>
            manga break
          </span>
          <span className="text-manga-gray-800 text-xs font-mono">✦</span>
        </div>

        {/* Main text */}
        <div className="flex-1 px-8 md:px-14 py-10 md:py-14">
          <p className="text-manga-gray-600 text-xs uppercase tracking-[0.4em] mb-4">— Manga Break</p>
          <h2
            className="text-manga-white font-black leading-none"
            style={{ fontFamily: 'Bangers, cursive', fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '0.04em' }}
          >
            STAY ALIVE<br />
            <span className="text-manga-gray-600">WHILE</span> U CAN.
          </h2>
          <div className="mt-6 border-t border-manga-gray-800 pt-4 max-w-sm">
            <p className="text-manga-gray-600 text-xs leading-relaxed">
              The page keeps turning. Keep reading.
            </p>
          </div>
        </div>

        {/* Right number block */}
        <div className="hidden md:flex flex-col justify-end border-l-2 border-manga-gray-800 p-6">
          <span
            className="text-manga-gray-800 font-black leading-none select-none"
            style={{ fontFamily: 'Bangers, cursive', fontSize: '6rem', letterSpacing: '0.03em' }}
          >
            ✦
          </span>
        </div>

      </div>
    </div>
  )
}
