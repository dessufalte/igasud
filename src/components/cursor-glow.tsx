"use client"

import * as React from "react"

export function CursorGlow() {
  const ref = React.useRef<HTMLDivElement>(null)
  const raf = React.useRef<number>(0)
  const [enabled, setEnabled] = React.useState(false)

  React.useEffect(() => {
    // Only enable on devices with hover (skip touch)
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setEnabled(mq.matches)
    const onChange = () => setEnabled(mq.matches)
    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [])

  React.useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    let visible = false
    const onMove = (e: MouseEvent) => {
      if (!visible) {
        el.style.opacity = "1"
        visible = true
      }
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
      })
    }
    const onLeave = () => {
      el.style.opacity = "0"
      visible = false
    }
    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [enabled])

  if (!enabled) return null
  return <div ref={ref} className="cursor-glow" aria-hidden="true" style={{ opacity: 0 }} />
}
