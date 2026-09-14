"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"

export function ScrollUtilities() {
  const [progress, setProgress] = React.useState(0)
  const [showFab, setShowFab] = React.useState(false)

  React.useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
        setProgress(pct)
        setShowFab(scrollTop > 600)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" })

  // SVG circle progress ring
  const ringRadius = 22
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (progress / 100) * ringCircumference

  return (
    <>
      {/* Page scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
      {/* Back-to-top FAB with progress ring */}
      <AnimatePresence>
        {showFab && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={scrollTop}
            aria-label="Back to top"
            className="fab-back-to-top glass glass-sheen glass-hover text-foreground shadow-lg"
          >
            {/* Progress ring (SVG) */}
            <svg
              className="absolute inset-0 -rotate-90"
              width="100%"
              height="100%"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="2"
                className="text-foreground/10"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r={ringRadius}
                stroke="url(#fab-gradient)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 0.15s linear" }}
              />
              <defs>
                <linearGradient
                  id="fab-gradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="oklch(0.55 0.22 280)" />
                  <stop offset="100%" stopColor="oklch(0.6 0.2 200)" />
                </linearGradient>
              </defs>
            </svg>
            <ArrowUp className="relative h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
