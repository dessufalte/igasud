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
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  Tag,
} from "lucide-react"
import type { ArticleDetail, ArticleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ArticleDrawerProps {
  slug: string | null
  onClose: () => void
  articles: ArticleSummary[]
  onNavigate: (slug: string) => void
}

export function ArticleDrawer({
  slug,
  onClose,
  articles,
  onNavigate,
}: ArticleDrawerProps) {
  const [article, setArticle] = React.useState<ArticleDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [readingPct, setReadingPct] = React.useState(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!slug) {
      setArticle(null)
      return
    }
    setLoading(true)
    setArticle(null)
    fetch(`/api/articles/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setArticle(data.article))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false))
  }, [slug])

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setReadingPct(0)
  }, [slug])

  const onScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0
    setReadingPct(pct)
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

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative flex-1 min-h-0 overflow-y-auto thin-scroll px-5 sm:px-7 py-6 sm:py-8"
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
            </article>
          )}
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
