"use client"

import * as React from "react"

export function AmbientBackground() {
  const blob1 = React.useRef<HTMLDivElement>(null)
  const blob2 = React.useRef<HTMLDivElement>(null)
  const blob3 = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        // Different parallax rates per blob for depth
        if (blob1.current)
          blob1.current.style.transform = `translateY(${y * 0.15}px)`
        if (blob2.current)
          blob2.current.style.transform = `translateY(${y * -0.1}px)`
        if (blob3.current)
          blob3.current.style.transform = `translateY(${y * 0.08}px)`
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="ambient-bg" aria-hidden="true">
      {/* Top-left violet */}
      <div
        ref={blob1}
        className="ambient-blob animate-float-slow parallax-blob"
        style={{
          top: "-15%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(circle at center, oklch(0.65 0.25 290 / 0.55), transparent 65%)",
        }}
      />
      {/* Top-right cyan */}
      <div
        ref={blob2}
        className="ambient-blob animate-float-slower parallax-blob"
        style={{
          top: "-5%",
          right: "-15%",
          width: "50vw",
          height: "50vw",
          background:
            "radial-gradient(circle at center, oklch(0.7 0.2 200 / 0.5), transparent 65%)",
        }}
      />
      {/* Bottom warm */}
      <div
        ref={blob3}
        className="ambient-blob animate-float-slow parallax-blob"
        style={{
          bottom: "-20%",
          left: "30%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle at center, oklch(0.75 0.22 60 / 0.4), transparent 65%)",
          animationDelay: "-6s",
        }}
      />
      {/* Subtle grain overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  )
}
