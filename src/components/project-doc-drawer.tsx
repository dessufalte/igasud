"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
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
  Twitter,
  Linkedin,
  Link2,
  type LucideIcon,
} from "lucide-react"
import type { Project } from "@/lib/portfolio-types"
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
  project: Project | null
  onClose: () => void
  allSlugs: string[]
  onNavigate: (slug: string) => void
  relatedProjects: Project[]
}

export function ProjectDocDrawer({
  project,
  onClose,
  allSlugs,
  onNavigate,
  relatedProjects,
}: ProjectDocDrawerProps) {
  const [activeDocIdx, setActiveDocIdx] = React.useState(0)
  const [readingPct, setReadingPct] = React.useState(0)
  const [activeHeading, setActiveHeading] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const headingRefs = React.useRef<Map<string, HTMLHeadingElement>>(new Map())
  const coverRef = React.useRef<HTMLDivElement>(null)
  const prevSlugRef = React.useRef<string | null>(null)

  const slug = project?.slug ?? null
  const activeDocObj = project?.docs[activeDocIdx] ?? null
  const readingMinutes = activeDocObj
    ? Math.max(1, Math.round(activeDocObj.content.split(/\s+/).length / 220))
    : 0

  // Parse headings for TOC
  const tocItems = React.useMemo(() => {
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
      if (level === 1) continue
      const text = m[2].replace(/[*_`]/g, "").trim()
      const id = slugifyHeading(text)
      items.push({ id, text, level })
    }
    return items
  }, [activeDocObj])

  // Deep-linking: restore section from hash ONLY when project slug changes
  React.useEffect(() => {
    const prevSlug = prevSlugRef.current
    prevSlugRef.current = slug
    if (!slug) {
      if (prevSlug && typeof window !== "undefined" && window.location.hash.startsWith("#/project/")) {
        window.history.replaceState(null, "", window.location.pathname)
      }
      setActiveDocIdx(0)
      return
    }
    // Restore section from hash only when project changes (not on every section switch)
    if (prevSlug !== slug && typeof window !== "undefined" && project) {
      const hash = window.location.hash
      const m = /^#\/project\/[^/]+\/([^/]+)/.exec(hash)
      if (m) {
        const idx = project.docs.findIndex(
          (d) => slugifyHeading(d.section) === decodeURIComponent(m[1])
        )
        if (idx >= 0) setActiveDocIdx(idx)
      }
    }
  }, [slug, project])

  // Update hash when section changes
  React.useEffect(() => {
    if (!slug || !project) return
    const doc = project.docs[activeDocIdx]
    if (!doc) return
    const sectionSlug = slugifyHeading(doc.section)
    const newHash = `#/project/${slug}/${sectionSlug}`
    if (typeof window !== "undefined" && window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash)
    }
  }, [slug, project, activeDocIdx])

  // Reset on project/doc change
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setReadingPct(0)
    setActiveHeading(null)
    headingRefs.current.clear()
    const t = setTimeout(() => {
      if (tocItems[0]) setActiveHeading(tocItems[0].id)
    }, 60)
    return () => clearTimeout(t)
  }, [slug, activeDocIdx, tocItems])

  const onContentScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0
    setReadingPct(pct)
    let current: string | null = null
    for (const [id, node] of headingRefs.current) {
      if (node.offsetTop - el.offsetTop - el.scrollTop <= 100) {
        current = id
      } else break
    }
    if (!current && tocItems.length > 0) current = tocItems[0].id
    setActiveHeading(current)
    // Cover parallax
    const coverImg = coverRef.current?.querySelector("img")
    if (coverImg) {
      coverImg.style.transform = `translateY(${el.scrollTop * 0.12}px) scale(1.05)`
    }
  }, [tocItems])

  const jumpToHeading = React.useCallback((id: string) => {
    const el = scrollRef.current
    const node = headingRefs.current.get(id)
    if (!el || !node) return
    el.scrollTo({ top: node.offsetTop - el.offsetTop - 16, behavior: "smooth" })
  }, [])

  // Prev/next project
  const { prevSlug, nextSlug } = React.useMemo(() => {
    if (!slug) return { prevSlug: null, nextSlug: null }
    const idx = allSlugs.indexOf(slug)
    if (idx === -1) return { prevSlug: null, nextSlug: null }
    return {
      prevSlug: allSlugs[(idx - 1 + allSlugs.length) % allSlugs.length],
      nextSlug: allSlugs[(idx + 1) % allSlugs.length],
    }
  }, [slug, allSlugs])

  // Keyboard nav
  React.useEffect(() => {
    if (!slug) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
        return
      if (e.key === "[" && prevSlug) { e.preventDefault(); onNavigate(prevSlug) }
      else if (e.key === "]" && nextSlug) { e.preventDefault(); onNavigate(nextSlug) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [slug, prevSlug, nextSlug, onNavigate])

  const markdownComponents = React.useMemo(
    () => ({
      code({ className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "")
        const raw = String(children).replace(/\n$/, "")
        const isInline = !match && !raw.includes("\n")
        if (isInline) return <code className={className} {...props}>{children}</code>
        return (
          <div className="relative group/code">
            <CopyCodeButton code={raw} />
            <SyntaxHighlighter
              // @ts-expect-error
              style={oneDark}
              language={match?.[1] ?? "text"}
              PreTag="div"
              customStyle={{ margin: 0, background: "transparent", fontSize: "0.85rem" }}
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
          <h2 id={id} ref={(n) => { if (n) headingRefs.current.set(id, n); else headingRefs.current.delete(id) }}>
            {children}
          </h2>
        )
      },
      h3({ children }: any) {
        const text = String(children).replace(/[*_`]/g, "")
        const id = slugifyHeading(text)
        return (
          <h3 id={id} ref={(n) => { if (n) headingRefs.current.set(id, n); else headingRefs.current.delete(id) }}>
            {children}
          </h3>
        )
      },
    }),
    []
  )

  if (!project) return null

  return (
    <Sheet open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col glass-strong border-l border-t border-b-0 border-r-0"
      >
        {/* Cover banner */}
        {project.image && (
          <div ref={coverRef} className="drawer-cover-banner shrink-0">
            <SmartImage
              src={project.image}
              alt={`${project.title} cover`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              wrapperClassName="absolute inset-0"
            />
          </div>
        )}

        {/* Header */}
        <SheetHeader className="px-5 sm:px-7 pt-5 pb-4 border-b border-foreground/8 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span className="meta-chip"><Tag className="h-3 w-3" />{project.category}</span>
            <span className="meta-chip"><Calendar className="h-3 w-3" />{project.year}</span>
            <span className="meta-chip"><FileText className="h-3 w-3" />{project.docs.length} sections</span>
            {/* Share buttons */}
            <div className="flex items-center gap-1 ml-auto">
              <ShareButtons title={project.title} />
            </div>
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
              <a href={project.links.repo} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors">
                <Github className="h-3.5 w-3.5" />Repository
              </a>
            )}
            {project.links?.demo && (
              <a href={project.links.demo} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${project.accent}, ${project.accent}dd)` }}>
                <ExternalLink className="h-3.5 w-3.5" />Live demo
              </a>
            )}
          </div>
        </SheetHeader>

        {/* Body: sidebar + content */}
        <div className="flex-1 min-h-0 flex">
          {/* Sidebar */}
          <aside className="hidden sm:flex flex-col gap-1 w-52 lg:w-64 p-3 border-r border-foreground/8 shrink-0 overflow-y-auto thin-scroll">
            {/* Reading overview */}
            <div className="px-2 pt-1 pb-3 mb-1 border-b border-foreground/8">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Reading progress</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{Math.round(readingPct)}%</span>
              </div>
              <div className="reading-overview-bar">
                <div className="reading-overview-fill" style={{ width: `${readingPct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5">{readingMinutes} min · {project.docs.length} sections</p>
            </div>
            <p className="px-2 pt-1 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">Documentation</p>
            {project.docs.map((doc, i) => {
              const Icon = ICONS[doc.icon] ?? FileText
              const active = i === activeDocIdx
              return (
                <button key={i} onClick={() => setActiveDocIdx(i)}
                  className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-all",
                    active ? "bg-foreground/8 font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/4 hover:text-foreground")}>
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-primary")}
                    style={active ? { color: project.accent } : undefined} />
                  <span className="truncate">{doc.section}</span>
                </button>
              )
            })}
            {/* TOC */}
            {tocItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-foreground/8">
                <div className="px-2 pb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                  <List className="h-3 w-3" />On this page
                </div>
                <nav className="flex flex-col" data-toc>
                  {tocItems.map((item) => (
                    <a key={item.id} href={`#${item.id}`}
                      onClick={(e) => { e.preventDefault(); jumpToHeading(item.id) }}
                      data-active={activeHeading === item.id}
                      className={cn("toc-link", item.level === 3 && "pl-5")}>
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </aside>

          {/* Content */}
          <div ref={scrollRef} onScroll={onContentScroll}
            className="relative flex-1 min-w-0 overflow-y-auto thin-scroll px-5 sm:px-7 py-6 sm:py-8">
            <div className="reading-progress" style={{ width: `${readingPct}%` }} aria-hidden="true" />
            {/* Section meta */}
            {activeDocObj && (
              <div className="mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" /><span>{readingMinutes} min read</span>
                <span className="opacity-40">·</span><span>{activeDocObj.section}</span>
              </div>
            )}
            {activeDocObj ? (
              <article key={`${slug}-${activeDocIdx}`} className="prose-doc max-w-none doc-enter">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {activeDocObj.content}
                </ReactMarkdown>
                {/* Section footer */}
                <div className="mt-10 pt-6 border-t border-foreground/8 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>Section {activeDocIdx + 1} of {project.docs.length}</span>
                  <button onClick={() => setActiveDocIdx((activeDocIdx + 1) % project.docs.length)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors font-medium text-foreground">
                    Next section<ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                {/* Prev/next project */}
                {allSlugs.length > 1 && (prevSlug || nextSlug) && (
                  <nav aria-label="Project navigation" className="mt-8 grid grid-cols-2 gap-3">
                    {prevSlug && (
                      <button onClick={() => onNavigate(prevSlug)}
                        className="proj-nav-card rounded-xl glass p-3 text-left hover:bg-foreground/6">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                          <ChevronLeft className="h-3 w-3" />Previous
                        </div>
                        <p className="mt-1 text-sm font-medium truncate">{formatSlug(prevSlug)}</p>
                      </button>
                    )}
                    {nextSlug && (
                      <button onClick={() => onNavigate(nextSlug)}
                        className="proj-nav-card rounded-xl glass p-3 text-right hover:bg-foreground/6">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                          Next<ChevronRight className="h-3 w-3" />
                        </div>
                        <p className="mt-1 text-sm font-medium truncate">{formatSlug(nextSlug)}</p>
                      </button>
                    )}
                  </nav>
                )}
                {/* Related projects */}
                {relatedProjects.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-foreground/8" data-related-projects>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-3">More in {project.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {relatedProjects.map((rp) => (
                        <button key={rp.id} onClick={() => onNavigate(rp.slug)}
                          className="related-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/4 hover:bg-foreground/8 border border-foreground/8">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: rp.accent }} />
                          {rp.title}<ArrowUpRight className="h-3 w-3 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ) : (
              <div className="text-center py-16 text-muted-foreground">No documentation available.</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------- helpers ----------
function slugifyHeading(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
}
function formatSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

// ---------- Copy code button ----------
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const tRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => { if (tRef.current) clearTimeout(tRef.current) }, [])
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      if (tRef.current) clearTimeout(tRef.current)
      tRef.current = setTimeout(() => setCopied(false), 1800)
    } catch { /* */ }
  }
  return (
    <button onClick={onCopy} aria-label={copied ? "Copied" : "Copy code"}
      className={cn("copy-code-btn group-hover/code:opacity-100", copied && "copied")} type="button">
      {copied ? <><Check className="h-3 w-3" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
    </button>
  )
}

// ---------- Share buttons ----------
function ShareButtons({ title }: { title: string; accent?: string }) {
  const [copied, setCopied] = React.useState(false)
  const tRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => { if (tRef.current) clearTimeout(tRef.current) }, [])
  const url = typeof window !== "undefined" ? window.location.href : ""
  const text = `Check out ${title} — a project on my portfolio.`
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      if (tRef.current) clearTimeout(tRef.current)
      tRef.current = setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }
  return (
    <div className="flex items-center gap-1">
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer" aria-label="Share on Twitter" title="Share on Twitter" className="share-btn">
        <Twitter className="h-3.5 w-3.5" />
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn" className="share-btn">
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <button onClick={onCopy} aria-label="Copy link" title="Copy link"
        className="share-btn" style={copied ? { color: "oklch(0.7 0.18 150)" } : undefined} type="button">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
