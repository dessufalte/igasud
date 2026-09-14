"use client"

import * as React from "react"
import { CheckCircle2, Sparkles, BookOpen, Trophy } from "lucide-react"

const MILESTONES = [
  { pct: 25, label: "Quarterway", icon: BookOpen },
  { pct: 50, label: "Halfway", icon: Sparkles },
  { pct: 75, label: "Almost there", icon: CheckCircle2 },
  { pct: 100, label: "Fully read", icon: Trophy },
]

const CONFETTI_COLORS = [
  "oklch(0.55 0.22 280)",
  "oklch(0.6 0.2 200)",
  "oklch(0.72 0.22 150)",
  "oklch(0.78 0.19 80)",
  "oklch(0.7 0.2 20)",
  "oklch(0.7 0.2 330)",
]

interface MilestoneCelebrationProps {
  /** Current reading percentage 0-100 */
  pct: number
  /** Reset key — when this changes, milestones reset (e.g. doc section change) */
  resetKey: string | null
}

export function ReadingMilestone({ pct, resetKey }: MilestoneCelebrationProps) {
  const [active, setActive] = React.useState<{
    label: string
    icon: typeof BookOpen
  } | null>(null)
  const firedRef = React.useRef<Set<number>>(new Set())
  const badgeRef = React.useRef<HTMLDivElement>(null)
  const confettiRef = React.useRef<HTMLDivElement>(null)

  // Reset fired milestones when resetKey changes (new section)
  React.useEffect(() => {
    firedRef.current = new Set()
  }, [resetKey])

  const fireConfetti = React.useCallback(() => {
    const container = confettiRef.current
    if (!container) return
    // Clear old pieces
    container.innerHTML = ""
    const count = 24
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("span")
      piece.className = "confetti-piece"
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const distance = 80 + Math.random() * 120
      const tx = Math.cos(angle) * distance
      const ty = Math.sin(angle) * distance - 40 // slight upward bias
      const rot = (Math.random() - 0.5) * 720
      piece.style.setProperty("--tx", `${tx}px`)
      piece.style.setProperty("--ty", `${ty}px`)
      piece.style.setProperty("--rot", `${rot}deg`)
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      piece.style.width = `${5 + Math.random() * 6}px`
      piece.style.height = `${5 + Math.random() * 6}px`
      container.appendChild(piece)
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        piece.classList.add("fire")
      })
    }
    // Cleanup after animation
    setTimeout(() => {
      if (container) container.innerHTML = ""
    }, 1500)
  }, [])

  // Check milestones when pct changes
  React.useEffect(() => {
    // Fire all pending milestones, but only show the highest one's badge
    let highest: { label: string; icon: typeof BookOpen } | null = null
    for (const m of MILESTONES) {
      if (pct >= m.pct && !firedRef.current.has(m.pct)) {
        firedRef.current.add(m.pct)
        highest = { label: m.label, icon: m.icon }
      }
    }
    if (highest) {
      setActive(highest)
      fireConfetti()
      setTimeout(() => setActive(null), 2000)
    }
  }, [pct, fireConfetti])

  return (
    <>
      {/* Confetti container */}
      <div ref={confettiRef} className="confetti" aria-hidden="true" />
      {/* Milestone badge */}
      <div
        ref={badgeRef}
        className={`milestone-badge ${active ? "show" : ""}`}
        aria-hidden={!active}
        role={active ? "status" : undefined}
      >
        {active && (
          <>
            <active.icon className="h-4 w-4" />
            {active.label} — nice progress
          </>
        )}
      </div>
    </>
  )
}
