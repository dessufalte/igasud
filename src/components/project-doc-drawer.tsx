"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Sparkles,
  Layers,
  ListChecks,
  Map,
  FileText,
  Code2,
  Rocket,
  Cpu,
  Wrench,
  BookOpen,
  Github,
  ExternalLink,
  Calendar,
  Tag,
  type LucideIcon,
} from "lucide-react"
import type { ProjectDetail, ProjectDoc } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Layers,
  ListChecks,
  Map,
  FileText,
  Code2,
  Rocket,
  Cpu,
  Wrench,
  BookOpen,
}

interface ProjectDocDrawerProps {
  slug: string | null
  onClose: () => void
}

export function ProjectDocDrawer({ slug, onClose }: ProjectDocDrawerProps) {
  const [project, setProject] = React.useState<ProjectDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [activeDoc, setActiveDoc] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!slug) {
      setProject(null)
      setActiveDoc(null)
      return
    }
    setLoading(true)
    setProject(null)
    fetch(`/api/projects/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setProject(data.project)
        setActiveDoc(data.project.docs[0]?.id ?? null)
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [slug])

  // Reset scroll on doc change
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeDoc])

  const activeDocObj = project?.docs.find((d) => d.id === activeDoc) ?? null

  return (
    <Sheet open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col glass-strong border-l border-t border-b-0 border-r-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 sm:px-7 pt-5 pb-4 border-b border-foreground/8 shrink-0">
          {loading || !project ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {project.category}
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.year}
                </span>
                <span className="opacity-40">·</span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {project.docs.length} sections
                </span>
              </div>
              <SheetTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                {project.title}
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {project.tagline}
              </SheetDescription>
              {/* Quick links */}
              <div className="flex items-center gap-2 pt-1">
                {project.links?.repo && (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    Repository
                  </a>
                )}
                {project.links?.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${project.accent}, ${project.accent}dd)`,
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live demo
                  </a>
                )}
              </div>
            </>
          )}
        </SheetHeader>

        {/* Body: section nav + content */}
        <div className="flex-1 min-h-0 flex">
          {/* Section nav */}
          <aside className="hidden sm:flex flex-col gap-1 w-52 lg:w-60 p-3 border-r border-foreground/8 shrink-0 overflow-y-auto thin-scroll">
            <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
              Documentation
            </p>
            {loading || !project
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-lg" />
                ))
              : project.docs.map((doc) => {
                  const Icon = ICONS[doc.icon] ?? FileText
                  const active = doc.id === activeDoc
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveDoc(doc.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-all",
                        active
                          ? "bg-foreground/8 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          active && "text-primary"
                        )}
                        style={active ? { color: project.accent } : undefined}
                      />
                      <span className="truncate">{doc.section}</span>
                    </button>
                  )
                })}
          </aside>

          {/* Mobile section dropdown */}
          <div className="sm:hidden w-full">
            <MobileSectionSelect
              docs={project?.docs ?? []}
              loading={loading}
              activeDoc={activeDoc}
              onSelect={setActiveDoc}
              accent={project?.accent}
            />
          </div>

          {/* Markdown content */}
          <div
            ref={scrollRef}
            className="flex-1 min-w-0 overflow-y-auto thin-scroll px-5 sm:px-7 py-6 sm:py-8"
          >
            {loading || !activeDocObj ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <article className="prose-doc max-w-none animate-fade-up">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      const isInline = !match && !String(children).includes("\n")
                      if (isInline) {
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                      return (
                        <SyntaxHighlighter
                          // @ts-expect-error - style prop typing
                          style={oneDark}
                          language={match?.[1] ?? "text"}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            background: "transparent",
                            fontSize: "0.85rem",
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      )
                    },
                  }}
                >
                  {activeDocObj.content}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileSectionSelect({
  docs,
  loading,
  activeDoc,
  onSelect,
  accent,
}: {
  docs: ProjectDoc[]
  loading: boolean
  activeDoc: string | null
  onSelect: (id: string) => void
  accent?: string
}) {
  const active = docs.find((d) => d.id === activeDoc)
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border-b border-foreground/8 px-5 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-2">
        Documentation
      </p>
      {loading ? (
        <Skeleton className="h-10 w-full rounded-lg" />
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-foreground/5 text-sm font-medium"
          >
            <span>{active?.section ?? "Select section"}</span>
            <span className="text-muted-foreground text-xs">
              {open ? "Close" : "Browse"}
            </span>
          </button>
          {open && (
            <div className="absolute z-10 mt-1 w-full glass-strong rounded-xl p-1.5 flex flex-col gap-0.5 animate-fade-up">
              {docs.map((doc) => {
                const Icon = ICONS[doc.icon] ?? FileText
                const isActive = doc.id === activeDoc
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onSelect(doc.id)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors",
                      isActive
                        ? "bg-foreground/10 font-medium"
                        : "text-muted-foreground hover:bg-foreground/5"
                    )}
                  >
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      style={isActive ? { color: accent } : undefined}
                    />
                    <span className="truncate">{doc.section}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
