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
import { SmartImage } from "@/components/smart-image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import {
  Sparkles,
  Layers,
  ListChecks,
  Map as MapIcon,
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
  Check,
  Copy,
  Clock,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react"
import type { ProjectDetail, ProjectDoc } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Layers,
  ListChecks,
  Map: MapIcon,
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
  /** Ordered list of all project slugs (for prev/next navigation). */
  allSlugs: string[]
  onNavigate: (slug: string) => void
  /** Related projects (same category) to show at the bottom. */
  relatedProjects: { slug: string; title: string; accent: string }[]
}

export function ProjectDocDrawer({
  slug,
  onClose,
  allSlugs,
  onNavigate,
  relatedProjects,
}: ProjectDocDrawerProps) {
  const [project, setProject] = React.useState<ProjectDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [activeDoc, setActiveDoc] = React.useState<string | null>(null)
  const [readingPct, setReadingPct] = React.useState(0)
  const [activeHeading, setActiveHeading] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const headingRefs = React.useRef<Map<string, HTMLHeadingElement>>(new Map())

  const activeDocObj = project?.docs.find((d) => d.id === activeDoc) ?? null

  // Compute prev/next project slugs (cyclic)
  const { prevSlug, nextSlug } = React.useMemo(() => {
    if (!slug) return { prevSlug: null, nextSlug: null }
    const idx = allSlugs.indexOf(slug)
    if (idx === -1 || allSlugs.length === 0)
      return { prevSlug: null, nextSlug: null }
    const prev = allSlugs[(idx - 1 + allSlugs.length) % allSlugs.length]
    const next = allSlugs[(idx + 1) % allSlugs.length]
    return { prevSlug: prev, nextSlug: next }
  }, [slug, allSlugs])

  // Reading time estimate (words / 220 wpm)
  const readingMinutes = activeDocObj
    ? Math.max(1, Math.round(activeDocObj.content.split(/\s+/).length / 220))
    : 0

  // Parse headings from active doc content for TOC
  const tocItems = React.useMemo<
    { id: string; text: string; level: number }[]
  >(() => {
    if (!activeDocObj) return []
    const lines = activeDocObj.content.split("\n")
    const items: { id: string; text: string; level: number }[] = []
    let inCodeBlock = false
    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (inCodeBlock) continue
      const m = /^(#{1,3})\s+(.+)$/.exec(line)
      if (!m) continue
      const level = m[1].length
      if (level === 1) continue // h1 is the title, skip in TOC
      const text = m[2].replace(/[*_`]/g, "").trim()
      const id = slugifyHeading(text)
      items.push({ id, text, level })
    }
    return items
  }, [activeDocObj])

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
        // Sync active doc from URL hash if present (deep-linking)
        const hash = parseDrawerHash()
        const fromHash = hash.section
          ? data.project.docs.find(
              (d: ProjectDoc) =>
                slugifyHeading(d.section) === hash.section
            )?.id
          : undefined
        setActiveDoc(fromHash ?? data.project.docs[0]?.id ?? null)
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [slug])

  // Deep-linking: update URL hash when project/section changes
  React.useEffect(() => {
    if (!slug || !project || !activeDoc) return
    const doc = project.docs.find((d) => d.id === activeDoc)
    if (!doc) return
    const sectionSlug = slugifyHeading(doc.section)
    const newHash = `#/project/${slug}/${sectionSlug}`
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash)
    }
  }, [slug, project, activeDoc])

  // Keyboard navigation: [ = prev project, ] = next project
  React.useEffect(() => {
    if (!slug || allSlugs.length === 0) return
    const onKey = (e: KeyboardEvent) => {
      // Don't interfere with inputs
      const t = e.target as HTMLElement
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable
      )
        return
      if (e.key === "[" && prevSlug) {
        e.preventDefault()
        onNavigate(prevSlug)
      } else if (e.key === "]" && nextSlug) {
        e.preventDefault()
        onNavigate(nextSlug)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [slug, allSlugs, prevSlug, nextSlug, onNavigate])

  // Reset scroll + reading progress on doc change. After render, mark the
  // first heading active so the TOC isn't blank at section top.
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setReadingPct(0)
    setActiveHeading(null)
    headingRefs.current.clear()
    // After DOM commits the new content, default to the first TOC heading
    const t = setTimeout(() => {
      const first = tocItems[0]?.id ?? null
      if (first) setActiveHeading(first)
    }, 60)
    return () => clearTimeout(t)
  }, [activeDoc, tocItems])

  // Track reading progress + active heading (scroll-spy inside drawer)
  const onContentScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0
    setReadingPct(pct)
    // Active heading: find the last heading whose top is above the trigger line
    let current: string | null = null
    const offset = 100
    for (const [id, node] of headingRefs.current) {
      if (node.offsetTop - el.offsetTop - el.scrollTop <= offset) {
        current = id
      } else {
        break
      }
    }
    // If we haven't scrolled past any heading yet, mark the first one active
    if (!current && tocItems.length > 0) {
      current = tocItems[0].id
    }
    setActiveHeading(current)
  }, [tocItems])

  // Smooth-scroll a heading into view inside the drawer content
  const jumpToHeading = React.useCallback((id: string) => {
    const el = scrollRef.current
    const node = headingRefs.current.get(id)
    if (!el || !node) return
    const top = node.offsetTop - el.offsetTop - 16
    el.scrollTo({ top, behavior: "smooth" })
  }, [])

  // Inject heading ids into rendered markdown
  const markdownComponents = React.useMemo(
    () => ({
      code({ className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "")
        const raw = String(children).replace(/\n$/, "")
        const isInline = !match && !raw.includes("\n")
        if (isInline) {
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }
        return (
          <div className="relative group/code">
            <CopyCodeButton code={raw} />
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
              {raw}
            </SyntaxHighlighter>
          </div>
        )
      },
      h2({ children }: any) {
        const text = String(children).replace(/[*_`]/g, "")
        const id = slugifyHeading(text)
        return (
          <h2
            id={id}
            ref={(n) => {
              if (n) headingRefs.current.set(id, n)
              else headingRefs.current.delete(id)
            }}
          >
            {children}
          </h2>
        )
      },
      h3({ children }: any) {
        const text = String(children).replace(/[*_`]/g, "")
        const id = slugifyHeading(text)
        return (
          <h3
            id={id}
            ref={(n) => {
              if (n) headingRefs.current.set(id, n)
              else headingRefs.current.delete(id)
            }}
          >
            {children}
          </h3>
        )
      },
    }),
    []
  )

  return (
    <Sheet open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col glass-strong border-l border-t border-b-0 border-r-0"
      >
        {/* Cover banner */}
        {!loading && project?.thumbnail && (
          <div className="drawer-cover-banner shrink-0">
            <SmartImage
              src={project.thumbnail}
              alt={`${project.title} cover`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              wrapperClassName="absolute inset-0"
            />
          </div>
        )}
        {(loading || (!project?.thumbnail && project)) && (
          <div className="drawer-cover-banner shrink-0">
            <div className="img-blur-placeholder" />
          </div>
        )}

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
                <span className="meta-chip">
                  <Tag className="h-3 w-3" />
                  {project.category}
                </span>
                <span className="meta-chip">
                  <Calendar className="h-3 w-3" />
                  {project.year}
                </span>
                <span className="meta-chip">
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
          {/* Section nav + TOC */}
          <aside className="hidden sm:flex flex-col gap-1 w-52 lg:w-64 p-3 border-r border-foreground/8 shrink-0 overflow-y-auto thin-scroll">
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

            {/* On this page (TOC) */}
            {!loading && tocItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-foreground/8">
                <div className="px-2 pb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                  <List className="h-3 w-3" />
                  On this page
                </div>
                <nav className="flex flex-col" data-toc>
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        jumpToHeading(item.id)
                      }}
                      data-active={activeHeading === item.id}
                      className={cn(
                        "toc-link",
                        item.level === 3 && "pl-5"
                      )}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
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
            onScroll={onContentScroll}
            className="relative flex-1 min-w-0 overflow-y-auto thin-scroll px-5 sm:px-7 py-6 sm:py-8"
          >
            {/* Reading progress bar */}
            <div
              className="reading-progress"
              style={{ width: `${readingPct}%` }}
              aria-hidden="true"
            />

            {/* Section meta (reading time + share) */}
            {!loading && activeDocObj && (
              <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{readingMinutes} min read</span>
                <span className="opacity-40">·</span>
                <span>{activeDocObj.section}</span>
                <ShareLinkButton />
              </div>
            )}

            {loading || !activeDocObj ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <article
                key={activeDoc}
                className="prose-doc max-w-none doc-enter"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {activeDocObj.content}
                </ReactMarkdown>

                {/* Section footer */}
                <div className="mt-10 pt-6 border-t border-foreground/8 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    Section {project.docs.findIndex((d) => d.id === activeDoc) + 1} of{" "}
                    {project.docs.length}
                  </span>
                  <button
                    onClick={() => {
                      const idx = project.docs.findIndex((d) => d.id === activeDoc)
                      const next = project.docs[(idx + 1) % project.docs.length]
                      if (next) setActiveDoc(next.id)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors font-medium text-foreground"
                  >
                    Next section
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                {/* Prev / next project navigation */}
                {allSlugs.length > 1 && (prevSlug || nextSlug) && (
                  <nav
                    aria-label="Project navigation"
                    className="mt-8 grid grid-cols-2 gap-3"
                  >
                    {prevSlug && (
                      <button
                        onClick={() => onNavigate(prevSlug)}
                        className="proj-nav-card group/nav rounded-xl glass p-3 text-left hover:bg-foreground/6"
                      >
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                          <ChevronLeft className="h-3 w-3" />
                          Previous
                        </div>
                        <p className="mt-1 text-sm font-medium truncate">
                          {formatSlug(prevSlug)}
                        </p>
                      </button>
                    )}
                    {nextSlug && (
                      <button
                        onClick={() => onNavigate(nextSlug)}
                        className="proj-nav-card group/nav rounded-xl glass p-3 text-right hover:bg-foreground/6"
                      >
                        <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                          Next
                          <ChevronRight className="h-3 w-3" />
                        </div>
                        <p className="mt-1 text-sm font-medium truncate">
                          {formatSlug(nextSlug)}
                        </p>
                      </button>
                    )}
                  </nav>
                )}

                {/* Related projects (same category) */}
                {relatedProjects.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-foreground/8" data-related-projects>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-3">
                      More in {project.category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {relatedProjects.map((rp) => (
                        <button
                          key={rp.slug}
                          onClick={() => onNavigate(rp.slug)}
                          className="related-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/4 hover:bg-foreground/8 border border-foreground/8"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: rp.accent }}
                          />
                          {rp.title}
                          <ArrowUpRight className="h-3 w-3 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "copy-code-btn group-hover/code:opacity-100",
        copied && "copied"
      )}
      type="button"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )
}

function ShareLinkButton() {
  const [copied, setCopied] = React.useState(false)
  const tRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (tRef.current) clearTimeout(tRef.current)
    },
    []
  )

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (tRef.current) clearTimeout(tRef.current)
      tRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      onClick={onCopy}
      aria-label="Copy link to this section"
      title="Copy shareable link"
      className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-foreground/5 transition-colors"
      type="button"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">Linked</span>
        </>
      ) : (
        <>
          <Tag className="h-3 w-3" />
          Copy link
        </>
      )}
    </button>
  )
}

// ---------- helpers ----------
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function parseDrawerHash(): {
  project: string | null
  section: string | null
} {
  if (typeof window === "undefined") return { project: null, section: null }
  const hash = window.location.hash
  // Expected: #/project/<slug>/<section-slug>
  const m = /^#\/project\/([^/]+)\/([^/]+)/.exec(hash)
  if (!m) return { project: null, section: null }
  return { project: decodeURIComponent(m[1]), section: decodeURIComponent(m[2]) }
}

// Turn a slug like "aurora-design-system" into "Aurora Design System"
function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
