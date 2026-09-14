"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Calendar, FileText, Github } from "lucide-react"
import type { ProjectSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: ProjectSummary
  index: number
  onOpen: (slug: string) => void
}

const statusStyles: Record<string, string> = {
  shipped: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "in-progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  concept: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.06, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => onOpen(project.slug)}
      className={cn(
        "group relative text-left w-full overflow-hidden",
        "rounded-2xl glass glass-sheen glass-hover",
        "p-5 sm:p-6 flex flex-col gap-4"
      )}
      style={{ minHeight: "16rem" }}
    >
      {/* Accent glow */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
        style={{
          background: `radial-gradient(circle, ${project.accent}, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium",
                statusStyles[project.status]
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {project.status === "in-progress"
                ? "In progress"
                : project.status === "shipped"
                ? "Shipped"
                : "Concept"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {project.year}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight leading-tight">
            {project.title}
          </h3>
        </div>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-md transition-transform duration-500 group-hover:rotate-45"
          style={{
            background: `linear-gradient(135deg, ${project.accent}, ${project.accent}cc)`,
          }}
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Body */}
      <p className="relative text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {project.description}
      </p>

      {/* Tech stack */}
      <div className="relative mt-auto flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-foreground/5 text-muted-foreground border border-foreground/5"
          >
            {tech}
          </span>
        ))}
        {project.techStack.length > 4 && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-muted-foreground/70">
            +{project.techStack.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-3 border-t border-foreground/5">
        <span className="text-xs text-muted-foreground">{project.category}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {project._count.docs} docs
          </span>
          {project.links?.repo && (
            <Github className="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </motion.button>
  )
}
