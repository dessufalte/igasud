"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight, Calendar, FileText } from "lucide-react"
import type { ProjectSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProjectListCardProps {
  project: ProjectSummary
  index: number
  onOpen: (slug: string) => void
}

const statusStyles: Record<string, string> = {
  shipped: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "in-progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  concept: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
}

export function ProjectListCard({ project, index, onOpen }: ProjectListCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={() => onOpen(project.slug)}
      className="list-card group w-full text-left flex items-center gap-4 p-3 rounded-2xl glass glass-sheen hover:bg-foreground/4"
      aria-label={`Open documentation for ${project.title}`}
    >
      {/* Cover thumbnail */}
      {project.thumbnail && (
        <div className="list-card-cover">
          <Image
            src={project.thumbnail}
            alt={`${project.title} cover`}
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
              statusStyles[project.status]
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current" />
            {project.status === "in-progress"
              ? "In progress"
              : project.status === "shipped"
              ? "Shipped"
              : "Concept"}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
            <Calendar className="h-2.5 w-2.5" />
            {project.year}
          </span>
          <span className="text-[11px] text-muted-foreground/70 truncate">
            · {project.category}
          </span>
        </div>
        <h3 className="text-sm sm:text-base font-semibold tracking-tight truncate">
          {project.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
          {project.tagline}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-foreground/5 text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="text-[10px] text-muted-foreground/60">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Right meta */}
      <div className="flex flex-col items-end gap-2 shrink-0 pr-1">
        <span
          className="grid h-8 w-8 place-items-center rounded-full text-white shadow-sm transition-transform duration-500 group-hover:rotate-45"
          style={{
            background: `linear-gradient(135deg, ${project.accent}, ${project.accent}cc)`,
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <FileText className="h-2.5 w-2.5" />
          {project._count.docs}
        </span>
      </div>
    </motion.button>
  )
}
