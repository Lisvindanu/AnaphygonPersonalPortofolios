import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PopsicleSplitProps {
  onComplete: () => void
}

export function PopsicleSplit({ onComplete }: PopsicleSplitProps) {
  const [split, setSplit] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setSplit(true), 1800)
    const t2 = setTimeout(() => {
      setDone(true)
      onComplete()
    }, 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onComplete])

  if (done) return null

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ border: '4px solid #111111' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left half */}
          <motion.div
            className="absolute inset-0 bg-white"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
            animate={split ? { x: '-102%' } : { x: 0 }}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
          >
            <img
              src="/images/dekstopremovebg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            {/* Gutter line */}
            <div className="absolute top-0 right-0 bottom-0 w-[4px] bg-manga-black z-10" />
          </motion.div>

          {/* Right half */}
          <motion.div
            className="absolute inset-0 bg-white"
            style={{ clipPath: 'inset(0 0 0 50%)' }}
            animate={split ? { x: '102%' } : { x: 0 }}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
          >
            <img
              src="/images/dekstopremovebg.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            {/* Gutter line */}
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-manga-black z-10" />
          </motion.div>

          {/* Flash on split */}
          <AnimatePresence>
            {split && (
              <motion.div
                className="absolute inset-0 bg-white pointer-events-none z-20"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
