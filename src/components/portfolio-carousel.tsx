"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  User,
  Link2,
  Github,
  BookOpen,
} from "lucide-react"
import type { Project } from "@/lib/portfolio-types"
import { cn } from "@/lib/utils"

interface PortfolioCarouselProps {
  projects: Project[]
  onReadDocs?: (project: Project) => void
}

export function PortfolioCarousel({ projects, onReadDocs }: PortfolioCarouselProps) {
  const [current, setCurrent] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  const goNext = React.useCallback(() => {
    setDirection(1)
    setCurrent((c) => (c + 1) % projects.length)
  }, [projects.length])

  const goPrev = React.useCallback(() => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + projects.length) % projects.length)
  }, [projects.length])

  // Keyboard navigation
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return
      if (e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev])

  if (projects.length === 0) {
    return (
      <div className="flex-1 grid place-items-center text-muted-foreground">
        No projects to display.
      </div>
    )
  }

  const project = projects[current]

  return (
    <div className="flex-1 flex flex-col min-h-0 pt-20 sm:pt-24 pb-4">
      {/* Counter + Navigation header */}
      <div className="px-4 sm:px-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">
            Portfolio
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            Project {current + 1} of {projects.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={projects.length <= 1}
            aria-label="Previous project"
            className="grid h-9 w-9 place-items-center rounded-full glass glass-sheen hover:bg-foreground/8 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            disabled={projects.length <= 1}
            aria-label="Next project"
            className="grid h-9 w-9 place-items-center rounded-full glass glass-sheen hover:bg-foreground/8 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={project.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full glass glass-sheen rounded-3xl overflow-hidden flex flex-col lg:flex-row"
          >
            {/* Left: Project image */}
            <div className="relative w-full lg:w-1/2 h-48 sm:h-64 lg:h-auto shrink-0">
              {project.image && (
                <Image
                  src={project.image}
                  alt={`${project.title} cover`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
            </div>

            {/* Right: Project details */}
            <div className="flex-1 min-w-0 flex flex-col p-5 sm:p-7 lg:p-8 overflow-y-auto thin-scroll">
              {/* Title */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                {project.title}
              </h2>

              {/* Tech tags */}
              {project.tech && project.tech.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-foreground/5 text-muted-foreground border border-foreground/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              {/* Meta info grid */}
              <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Year */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Year Accomplished
                  </p>
                  <p className="text-sm font-medium">{project.year}</p>
                </div>
                {/* Role */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Role / Position
                  </p>
                  <p className="text-sm font-medium">{project.role}</p>
                </div>
                {/* Link */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold mb-1 flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    Publication Link
                  </p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-foreground hover:text-foreground/80 inline-flex items-center gap-1 transition-colors"
                  >
                    View Project
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Read Docs button */}
              {onReadDocs && project.docs && project.docs.length > 0 && (
                <button
                  onClick={() => onReadDocs(project)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${project.accent}, ${project.accent}dd)`,
                  }}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Documentation
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="px-4 sm:px-6 pb-4 flex items-center justify-center gap-1.5">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1)
              setCurrent(i)
            }}
            aria-label={`Go to project ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current
                ? "w-6 bg-foreground"
                : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
            )}
          />
        ))}
      </div>
    </div>
  )
}
