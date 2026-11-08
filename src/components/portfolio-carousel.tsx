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
  BookOpen,
} from "lucide-react"
import type { Language, Project } from "@/lib/portfolio-types"
import { cn } from "@/lib/utils"

interface PortfolioCarouselProps {
  projects: Project[]
  lang?: Language
  onReadDocs?: (project: Project) => void
}

export function PortfolioCarousel({
  projects,
  lang = "en",
  onReadDocs,
}: PortfolioCarouselProps) {
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
      <div className="flex-1 grid place-items-center text-[#655f53]">
        {lang === "id" ? "Belum ada modul yang ditampilkan." : "No engine modules to display."}
      </div>
    )
  }

  const project = projects[current]
  const displayTitle = lang === "id" && project.titleId ? project.titleId : project.title
  const displayDesc =
    lang === "id" && project.descriptionId ? project.descriptionId : project.description

  return (
    <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 min-h-0 overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto my-auto flex flex-col">
        {/* Counter + Navigation header */}
        <div className="mb-3 flex items-center justify-between border-b-2 border-[#5c0707] pb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-wider text-[#5c0707] mg-header-font">
              {lang === "id" ? "Arsip Modul & Engine" : "Engine & Module Monograph"}
            </span>
            <span className="text-xs text-[#655f53] font-mono">
              [{current + 1} / {projects.length}]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={projects.length <= 1}
              aria-label="Previous project"
              className="grid h-8 w-8 place-items-center bg-[#efe7ce] border border-[#bfb69e] hover:border-[#5c0707] text-[#5c0707] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              disabled={projects.length <= 1}
              aria-label="Next project"
              className="grid h-8 w-8 place-items-center bg-[#efe7ce] border border-[#bfb69e] hover:border-[#5c0707] text-[#5c0707] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide content */}
        <div className="w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={project.slug}
              custom={direction}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -30 }}
              transition={{ duration: 0.25 }}
              className="bg-[#f8f3e3] border border-[#bfb69e] overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Left: Project image */}
              <div className="relative w-full lg:w-5/12 h-56 sm:h-64 lg:h-auto min-h-[240px] lg:min-h-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#bfb69e] bg-[#241615]">
                {project.image && (
                  <Image
                    src={project.image}
                    alt={`${displayTitle} cover`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover opacity-90 sepia-[0.15]"
                    priority
                  />
                )}
                <div className="absolute top-3 left-3 bg-[#5c0707] text-[#f4eedb] px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-[#400404]">
                  {project.category}
                </div>
              </div>

              {/* Right: Project details */}
              <div className="flex-1 min-w-0 flex flex-col p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#5c0707] leading-tight mg-header-font">
                  {displayTitle}
                </h2>

                {project.tech && project.tech.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[11px] font-mono bg-[#efe7ce] text-[#422624] border border-[#bfb69e]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-sm sm:text-base text-[#2b231d] leading-relaxed">
                  {displayDesc}
                </p>

                {/* Meta info grid */}
                <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#bfb69e]">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#655f53] font-bold mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#5c0707]" />
                      {lang === "id" ? "Tahun Rilis" : "Release Year"}
                    </p>
                    <p className="text-sm font-mono font-bold text-[#1e1815]">{project.year}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#655f53] font-bold mb-1 flex items-center gap-1">
                      <User className="h-3 w-3 text-[#5c0707]" />
                      {lang === "id" ? "Divisi / Peran" : "Division / Role"}
                    </p>
                    <p className="text-sm font-medium text-[#1e1815]">{project.role}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#655f53] font-bold mb-1 flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-[#5c0707]" />
                      {lang === "id" ? "Tautan Repositori" : "Repository"}
                    </p>
                    <a
                      href={project.links?.repo || project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-[#5c0707] hover:underline inline-flex items-center gap-1"
                    >
                      {lang === "id" ? "Buka Kode" : "Inspect Source"}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* Read Docs and Demo Status */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {onReadDocs && project.docs && project.docs.length > 0 && (
                    <button
                      onClick={() => onReadDocs(project)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 mg-btn-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {lang === "id"
                        ? "Baca Spesifikasi Teknis"
                        : "Read Technical Monograph"}
                    </button>
                  )}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#efe7ce] border border-[#bfb69e] text-[11px] font-mono text-[#655f53] cursor-not-allowed select-none"
                    title={lang === "id" ? "Live demo publik saat ini belum dibuka (masih dalam pengujian lokal C++)." : "Public interactive demo is currently in local development and not yet available online."}
                  >
                    <ExternalLink className="h-3 w-3 opacity-50" />
                    {lang === "id"
                      ? "Demo: Belum Tersedia (Build Lokal)"
                      : "Live Demo: Not Available (Local Build)"}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
              aria-label={`Go to project ${i + 1}`}
              className={cn(
                "h-2 transition-all border border-[#5c0707] cursor-pointer",
                i === current ? "w-8 bg-[#5c0707]" : "w-2 bg-[#efe7ce] hover:bg-[#bfb69e]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
