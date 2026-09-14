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
  Clock,
  Calendar,
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Tag,
  List,
} from "lucide-react"
import type { ArticleDetail, ArticleSummary, ProjectSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ArticleDrawerProps {
  slug: string | null
  onClose: () => void
  articles: ArticleSummary[]
  onNavigate: (slug: string) => void
  onOpenProject?: (slug: string) => void
  relatedProjects?: ProjectSummary[]
}

export function ArticleDrawer({
  slug,
  onClose,
  articles,
  onNavigate,
  onOpenProject,
  relatedProjects,
}: ArticleDrawerProps) {
  const [article, setArticle] = React.useState<ArticleDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [readingPct, setReadingPct] = React.useState(0)
  const [activeHeading, setActiveHeading] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const headingRefs = React.useRef<Map<string, HTMLHeadingElement>>(new Map())

  const prevSlugRef = React.useRef<string | null>(null)

  // Parse headings from article body for TOC
  const tocItems = React.useMemo<
    { id: string; text: string; level: number }[]
  >(() => {
    if (!article) return []
    const lines = article.body.split("\n")
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
  }, [article])

  React.useEffect(() => {
    const prevSlug = prevSlugRef.current
    prevSlugRef.current = slug

    if (!slug) {
      setArticle(null)
      // Only clear hash if we're transitioning from an open article to closed
      // (not on initial mount — the page's restore effect handles that)
      if (prevSlug && window.location.hash.startsWith("#/article/")) {
        window.history.replaceState(null, "", window.location.pathname)
      }
      return
    }
    setLoading(true)
    setArticle(null)
    fetch(`/api/articles/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setArticle(data.article))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
    // Update URL hash for deep-linking
    const newHash = `#/article/${slug}`
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash)
    }
  }, [slug])

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setReadingPct(0)
    setActiveHeading(null)
    headingRefs.current.clear()
    // Default to first TOC heading after render
    const t = setTimeout(() => {
      const first = tocItems[0]?.id ?? null
      if (first) setActiveHeading(first)
    }, 60)
    return () => clearTimeout(t)
  }, [slug, tocItems])

  const onScroll = React.useCallback(() => {
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
    if (!current && tocItems.length > 0) {
      current = tocItems[0].id
    }
    setActiveHeading(current)
  }, [tocItems])

  // Smooth-scroll a heading into view
  const jumpToHeading = React.useCallback((id: string) => {
    const el = scrollRef.current
    const node = headingRefs.current.get(id)
    if (!el || !node) return
    const top = node.offsetTop - el.offsetTop - 16
    el.scrollTo({ top, behavior: "smooth" })
  }, [])

  // Prev/next article (cyclic)
  const { prevSlug, nextSlug } = React.useMemo(() => {
    if (!slug) return { prevSlug: null, nextSlug: null }
    const idx = articles.findIndex((a) => a.slug === slug)
    if (idx === -1) return { prevSlug: null, nextSlug: null }
    return {
      prevSlug: articles[(idx - 1 + articles.length) % articles.length]?.slug ?? null,
      nextSlug: articles[(idx + 1) % articles.length]?.slug ?? null,
    }
  }, [slug, articles])

  // Keyboard nav: [ / ]
  React.useEffect(() => {
    if (!slug) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
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
  }, [slug, prevSlug, nextSlug, onNavigate])

  return (
    <Sheet open={!!slug} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 gap-0 flex flex-col glass-strong border-l border-t border-b-0 border-r-0"
      >
        {/* Header */}
        <SheetHeader className="px-5 sm:px-7 pt-5 pb-4 border-b border-foreground/8 shrink-0">
          {loading || !article ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <span className="meta-chip">
                  <Tag className="h-3 w-3" />
                  {article.tag}
                </span>
                <span className="meta-chip">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="meta-chip">
                  <Clock className="h-3 w-3" />
                  {article.readingMins} min read
                </span>
              </div>
              <SheetTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                {article.title}
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {article.excerpt}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {/* Body: TOC sidebar + content */}
        <div className="flex-1 min-h-0 flex">
          {/* TOC sidebar */}
          {tocItems.length > 0 && (
            <aside className="hidden sm:flex flex-col gap-1 w-52 lg:w-64 p-3 border-r border-foreground/8 shrink-0 overflow-y-auto thin-scroll">
              {/* Reading overview */}
              <div className="px-2 pt-1 pb-3 mb-1 border-b border-foreground/8">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                    Reading progress
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {Math.round(readingPct)}%
                  </span>
                </div>
                <div className="reading-overview-bar">
                  <div
                    className="reading-overview-fill"
                    style={{ width: `${readingPct}%` }}
                  />
                </div>
                {article && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                    {article.readingMins} min read
                  </p>
                )}
              </div>
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
            </aside>
          )}

          {/* Content */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="relative flex-1 min-w-0 overflow-y-auto thin-scroll px-5 sm:px-7 py-6 sm:py-8"
          >
            {/* Reading progress bar */}
            <div
              className="reading-progress"
              style={{ width: `${readingPct}%` }}
              aria-hidden="true"
            />

            {loading || !article ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : (
              <article
                key={article.slug}
                className="prose-doc max-w-none doc-enter"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
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
                  }}
                >
                  {article.body}
                </ReactMarkdown>

                {/* Prev / next article navigation */}
                {articles.length > 1 && (prevSlug || nextSlug) && (
                  <nav
                    aria-label="Article navigation"
                    className="mt-10 pt-6 border-t border-foreground/8 grid grid-cols-2 gap-3"
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
                          {articles.find((a) => a.slug === prevSlug)?.title}
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
                          {articles.find((a) => a.slug === nextSlug)?.title}
                        </p>
                      </button>
                    )}
                  </nav>
                )}

                {/* Related projects */}
                {onOpenProject && relatedProjects && relatedProjects.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-foreground/8">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold mb-3">
                      Related projects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {relatedProjects.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onOpenProject(p.slug)
                            // Close article drawer
                            onClose()
                          }}
                          className="related-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/4 hover:bg-foreground/8 border border-foreground/8"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: p.accent }}
                          />
                          {p.title}
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

// ---------- helpers ----------
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
