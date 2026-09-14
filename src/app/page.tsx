"use client"

import * as React from "react"
import { motion } from "framer-motion"
import {
  ArrowDown,
  ArrowUpRight,
  Mail,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Layers,
  Code2,
  Cloud,
  Database,
  Palette,
  Zap,
  Shield,
  GitBranch,
  Send,
  Heart,
  Search as SearchIcon,
  X,
  Check,
  Keyboard,
  Quote,
  LayoutGrid,
  List as ListIcon,
  PenLine,
  Clock,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { AmbientBackground } from "@/components/ambient-background"
import { ProjectCard } from "@/components/project-card"
import { ProjectListCard } from "@/components/project-list-card"
import { ProjectDocDrawer } from "@/components/project-doc-drawer"
import { ArticleDrawer } from "@/components/article-drawer"
import { CommandPalette } from "@/components/command-palette"
import { ScrollUtilities } from "@/components/scroll-utilities"
import { ShortcutsHelp } from "@/components/shortcuts-help"
import { CursorGlow } from "@/components/cursor-glow"
import { TechMarquee } from "@/components/tech-marquee"
import { AdminPanel } from "@/components/admin-panel"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { ProjectSummary, ArticleSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "All",
  "Design Systems",
  "Data & Analytics",
  "Developer Tools",
  "Open Source",
] as const

const SKILLS = [
  { icon: Code2, label: "TypeScript", level: "Expert" },
  { icon: Layers, label: "React / Next.js", level: "Expert" },
  { icon: Palette, label: "Design Systems", level: "Expert" },
  { icon: Database, label: "Prisma / SQL", level: "Advanced" },
  { icon: Cloud, label: "Edge & Serverless", level: "Advanced" },
  { icon: Zap, label: "Real-time (WebSocket)", level: "Advanced" },
  { icon: Shield, label: "Accessibility (a11y)", level: "Advanced" },
  { icon: GitBranch, label: "DX & Tooling", level: "Expert" },
]

const STATS = [
  { value: 6, suffix: "+", label: "Projects shipped" },
  { value: 4, suffix: "", label: "Years building" },
  { value: 30, suffix: "k+", label: "Lines of clean code" },
  { value: Infinity, suffix: "", label: "Curiosity" },
]

const SECTION_IDS = ["work", "about", "skills", "writing", "contact"] as const

export default function Home() {
  const [projects, setProjects] = React.useState<ProjectSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeCategory, setActiveCategory] =
    React.useState<(typeof CATEGORIES)[number]>("All")
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null)
  const [articles, setArticles] = React.useState<ArticleSummary[]>([])
  const [activeArticle, setActiveArticle] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [cmdOpen, setCmdOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [adminOpen, setAdminOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState<string>("")
  const [view, setView] = useLocalStorage<"grid" | "list">(
    "portfolio.view",
    "grid"
  )
  const [sortBy, setSortBy] = useLocalStorage<
    "featured" | "year-desc" | "year-asc" | "name" | "status"
  >("portfolio.sort", "featured")

  React.useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false))
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => setArticles(data.articles ?? []))
      .catch(() => {
        /* articles are non-critical */
      })
  }, [])

  // Global keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K toggles command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCmdOpen((v) => !v)
        return
      }
      const t = e.target as HTMLElement
      const tag = t.tagName
      const inField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        t.isContentEditable
      // `/` opens command palette
      if (e.key === "/" && !inField && !cmdOpen) {
        e.preventDefault()
        setCmdOpen(true)
        return
      }
      // `?` opens shortcuts help (Shift+/)
      if (e.key === "?" && !inField) {
        e.preventDefault()
        setHelpOpen((v) => !v)
        return
      }
      // `Shift+A` opens admin panel
      if (e.shiftKey && (e.key === "A" || e.key === "a") && !inField) {
        e.preventDefault()
        setAdminOpen((v) => !v)
        return
      }
      // `Escape` closes the doc drawer if open (and no other dialog)
      if (
        e.key === "Escape" &&
        activeSlug &&
        !cmdOpen &&
        !helpOpen
      ) {
        // Sheet handles Escape internally; we just clear the hash
        const hash = window.location.hash
        if (hash.startsWith("#/project/")) {
          window.history.replaceState(null, "", window.location.pathname)
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [cmdOpen, helpOpen, adminOpen, activeSlug])

  // Deep-linking: restore drawer from URL hash on mount + on popstate
  React.useEffect(() => {
    const restore = () => {
      const hash = window.location.hash
      // Admin panel hash
      if (hash === "#/admin") {
        setAdminOpen(true)
        return
      }
      // Project drawer hash
      const m = /^#\/project\/([^/]+)/.exec(hash)
      if (m) {
        const slug = decodeURIComponent(m[1])
        setActiveSlug(slug)
      }
    }
    restore()
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  // Scroll-spy: highlight active nav section (scroll-based, reliable)
  React.useEffect(() => {
    const ids = ["top", ...SECTION_IDS]
    let raf = 0
    const compute = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = window.innerHeight * 0.35
        let best = ""
        let bestDist = Infinity
        for (const id of ids) {
          const el = document.getElementById(id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          // distance from section top to the trigger line (35% from viewport top)
          const dist = Math.abs(rect.top - mid)
          // prefer the section whose top is at or just above the line
          if (rect.top <= mid + 10 && dist < bestDist) {
            bestDist = dist
            best = id
          }
        }
        if (!best) {
          // above all sections → top
          const top = document.getElementById("top")
          if (top && top.getBoundingClientRect().bottom > 0) best = "top"
        }
        if (best) setActiveSection(best)
      })
    }
    compute()
    window.addEventListener("scroll", compute, { passive: true })
    window.addEventListener("resize", compute)
    return () => {
      window.removeEventListener("scroll", compute)
      window.removeEventListener("resize", compute)
      cancelAnimationFrame(raf)
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const byCategory =
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory)
    const bySearch = !q
      ? byCategory
      : byCategory.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.techStack.some((t) => t.toLowerCase().includes(q))
        )
    // Sort
    const statusOrder: Record<string, number> = {
      "in-progress": 0,
      shipped: 1,
      concept: 2,
    }
    const sorted = [...bySearch]
    switch (sortBy) {
      case "year-desc":
        sorted.sort((a, b) => b.year - a.year)
        break
      case "year-asc":
        sorted.sort((a, b) => a.year - b.year)
        break
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "status":
        sorted.sort(
          (a, b) =>
            (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
        )
        break
      case "featured":
      default:
        sorted.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) || b.year - a.year
        )
        break
    }
    return sorted
  }, [projects, activeCategory, search, sortBy])

  const featured = React.useMemo(
    () => projects.filter((p) => p.featured).slice(0, 3),
    [projects]
  )

  // All slugs in display order (featured first, then by year) for prev/next nav
  const allSlugs = React.useMemo(
    () =>
      [...projects]
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year)
        .map((p) => p.slug),
    [projects]
  )

  // Related projects: same category as the active project, excluding it
  const relatedProjects = React.useMemo(() => {
    if (!activeSlug) return []
    const active = projects.find((p) => p.slug === activeSlug)
    if (!active) return []
    return projects
      .filter((p) => p.category === active.category && p.slug !== activeSlug)
      .slice(0, 4)
      .map((p) => ({ slug: p.slug, title: p.title, accent: p.accent }))
  }, [activeSlug, projects])

  return (
    <div id="top" className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <CursorGlow />
      <ScrollUtilities />
      <Navbar
        onOpenCommand={() => setCmdOpen(true)}
        activeSection={activeSection}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        projects={projects}
        onOpenProject={(slug) => setActiveSlug(slug)}
      />
      <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
      <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* ============== HERO ============== */}
        <section className="px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl glass glass-sheen p-7 sm:p-12 lg:p-16"
            >
              {/* Decorative glow */}
              <div
                className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.6 0.25 290 / 0.4), transparent 70%)",
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.7 0.22 200 / 0.4), transparent 70%)",
                }}
              />

              <div className="relative flex flex-col gap-6">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8 text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 glow-dot" />
                  </span>
                  Available for select projects
                </span>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                  Building calm,
                  <br />
                  <span className="text-gradient gradient-reveal">
                    considered software.
                  </span>
                </h1>

                <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  I&apos;m a product engineer focused on design systems, edge
                  performance, and developer tools. This is a living archive of
                  the work I&apos;ve shipped — each project comes with full
                  documentation, architecture notes, and lessons learned.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <MagneticButton
                    href="#work"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg shadow-foreground/10"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                    }}
                  >
                    Explore the work
                    <ArrowDown className="h-4 w-4" />
                  </MagneticButton>
                  <MagneticButton
                    href="#contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/8 transition-colors"
                  >
                    Get in touch
                    <ArrowUpRight className="h-4 w-4" />
                  </MagneticButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 mt-2 border-t border-foreground/8">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col">
                      <span className="stat-value text-2xl sm:text-3xl font-bold tracking-tight">
                        <CountUp
                          value={s.value}
                          suffix={s.suffix}
                        />
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Currently building widget — wired to in-progress projects */}
                {(() => {
                  const inProgress = projects.find(
                    (p) => p.status === "in-progress"
                  )
                  if (!inProgress) return null
                  return (
                    <button
                      onClick={() => setActiveSlug(inProgress.slug)}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-6 mt-2 border-t border-foreground/8 w-full text-left group/now"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="now-playing-dot"
                          aria-hidden="true"
                          style={{ background: inProgress.accent }}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          Currently building
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold tracking-tight truncate">
                          {inProgress.title} — {inProgress.tagline}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {inProgress.techStack.slice(0, 3).join(" · ")}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 group-hover/now:text-foreground transition-colors shrink-0">
                        See progress
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </button>
                  )
                })()}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============== TECH MARQUEE ============== */}
        <section className="px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="mx-auto max-w-6xl rounded-2xl glass glass-sheen py-2">
            <TechMarquee />
          </div>
        </section>

        {/* ============== FEATURED ============== */}
        {featured.length > 0 && (
          <section className="px-4 sm:px-6 pt-20 sm:pt-28">
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Featured"
                title="A closer look"
                description="Three projects I'm proudest of — tap any to read the full documentation."
              />
              <div className="grid gap-4 sm:gap-5 md:grid-cols-3 mt-8 sm:mt-10">
                {featured.map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    index={i}
                    onOpen={setActiveSlug}
                    featured
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="section-divider rounded-full" />
        </div>

        {/* ============== WORK / ALL PROJECTS ============== */}
        <section id="work" className="px-4 sm:px-6 pt-20 sm:pt-28 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="The archive"
              title="All projects"
              description="Filter by domain or search by name, tech, or keyword. Every card opens a documentation panel."
            />

            {/* Filter + search bar */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all animate-pop-in",
                      activeCategory === c
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground border border-foreground/8"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-72">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filtered.length > 0) {
                      e.preventDefault()
                      setActiveSlug(filtered[0].slug)
                    }
                  }}
                  placeholder="Search projects…  (press Enter to open first match)"
                  aria-label="Search projects"
                  className="w-full h-9 pl-9 pr-9 rounded-full bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full hover:bg-foreground/10 text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Controls row: sort + view toggle + result count */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort projects"
                  className="sort-select h-8 px-3 rounded-lg bg-foreground/4 border border-foreground/8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/15 transition-all"
                >
                  <option value="featured">Featured first</option>
                  <option value="year-desc">Newest</option>
                  <option value="year-asc">Oldest</option>
                  <option value="name">A–Z</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                {!loading && (
                  <p className="text-xs text-muted-foreground">
                    {filtered.length} {filtered.length === 1 ? "project" : "projects"}
                    {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
                    {search ? ` matching “${search}”` : ""}
                  </p>
                )}
                <div className="view-toggle" role="group" aria-label="View mode">
                  <button
                    onClick={() => setView("grid")}
                    data-active={view === "grid"}
                    aria-label="Grid view"
                    className="view-toggle-btn"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    data-active={view === "list"}
                    aria-label="List view"
                    className="view-toggle-btn"
                  >
                    <ListIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid or List */}
            {view === "grid" ? (
              <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))
                  : filtered.map((p, i) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        index={i}
                        onOpen={setActiveSlug}
                      />
                    ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mt-6" data-view="list">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-2xl" />
                    ))
                  : filtered.map((p, i) => (
                      <ProjectListCard
                        key={p.id}
                        project={p}
                        index={i}
                        onOpen={setActiveSlug}
                      />
                    ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-foreground/5 text-muted-foreground">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No projects match your filters.
                </p>
                <button
                  onClick={() => {
                    setSearch("")
                    setActiveCategory("All")
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="section-divider rounded-full" />
        </div>

        {/* ============== ABOUT ============== */}
        <section id="about" className="px-4 sm:px-6 pt-20 sm:pt-28 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-5 gap-5">
              {/* Bio card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-3 rounded-3xl glass glass-sheen p-6 sm:p-8 lg:p-10"
              >
                <SectionHeader
                  eyebrow="About"
                  title="The human behind the code"
                  align="left"
                />
                <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  <p>
                    I build software the way I&apos;d build a quiet, well-lit
                    room: every surface should feel intentional, nothing should
                    squeak, and the things you reach for most often should be
                    closest to hand.
                  </p>
                  <p>
                    Over the past four years I&apos;ve shipped design systems,
                    privacy-first analytics, a headless CMS, and a handful of
                    open-source tools. I care about <strong className="text-foreground">edge
                    performance</strong>, <strong className="text-foreground">accessibility</strong>,
                    and the kind of <strong className="text-foreground">developer
                    experience</strong> that makes teammates want to ship.
                  </p>
                  <p>
                    When I&apos;m not coding, I&apos;m usually sketching UI in a
                    paper notebook, reading about distributed systems, or
                    hunting for the perfect espresso.
                  </p>
                </div>
              </motion.div>

              {/* Principles card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-2 rounded-3xl glass glass-sheen p-6 sm:p-8 flex flex-col"
              >
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
                  Operating principles
                </span>
                <ul className="mt-4 flex flex-col gap-4">
                  {[
                    {
                      icon: Sparkles,
                      title: "Calm by default",
                      body: "Interfaces should reduce cognitive load, never add to it.",
                    },
                    {
                      icon: Layers,
                      title: "Composable",
                      body: "Small, well-named primitives beat clever monoliths.",
                    },
                    {
                      icon: Shield,
                      title: "Accessible",
                      body: "If it isn't usable by everyone, it isn't done.",
                    },
                    {
                      icon: Zap,
                      title: "Fast everywhere",
                      body: "Performance is a feature — measured, not assumed.",
                    },
                  ].map((p) => (
                    <li key={p.title} className="flex gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground/5 text-foreground">
                        <p.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{p.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {p.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Testimonial / quote card */}
            <motion.figure
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="quote-card mt-5 rounded-3xl glass glass-sheen p-6 sm:p-8 lg:p-10 relative overflow-hidden"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-foreground/8" />
              <blockquote className="relative text-lg sm:text-xl lg:text-2xl font-medium tracking-tight leading-snug max-w-3xl">
                The best engineers I&apos;ve worked with treat the interface
                like a <span className="text-gradient">conversation</span> — every
                pixel earning its place, every interaction keeping a promise.
              </blockquote>
              <figcaption className="relative mt-6 flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full text-white text-sm font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.6 0.2 200))",
                  }}
                >
                  M
                </span>
                <div>
                  <p className="text-sm font-semibold">Maya R.</p>
                  <p className="text-xs text-muted-foreground">
                    Staff Engineer, Fintech
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="section-divider rounded-full" />
        </div>

        {/* ============== SKILLS ============== */}
        <section id="skills" className="px-4 sm:px-6 pt-20 sm:pt-28 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Toolkit"
              title="What I work with"
              description="The stack I reach for most often. I'm pragmatic — the right tool depends on the problem."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
              {SKILLS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl glass glass-sheen glass-hover skill-card-shimmer p-4 sm:p-5 flex items-center gap-3"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground/5">
                    <s.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.level}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="section-divider rounded-full" />
        </div>

        {/* ============== WRITING / BLOG ============== */}
        {articles.length > 0 && (
          <section
            id="writing"
            className="px-4 sm:px-6 pt-20 sm:pt-28 scroll-mt-24"
          >
            <div className="mx-auto max-w-6xl">
              <SectionHeader
                eyebrow="Writing"
                title="Notes on craft"
                description="Essays and field notes on design systems, edge architecture, and shipping software. Tap any to read the full piece."
              />
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2 mt-8 sm:mt-10">
                {articles.map((a, i) => (
                  <motion.button
                    key={a.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(i * 0.06, 0.3),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() => setActiveArticle(a.slug)}
                    className="group relative text-left w-full overflow-hidden rounded-2xl glass glass-sheen glass-hover tilt-card p-5 sm:p-6 flex flex-col gap-3"
                    aria-label={`Read article: ${a.title}`}
                  >
                    {/* Accent glow */}
                    <div
                      className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60 z-0"
                      style={{
                        background:
                          "radial-gradient(circle, oklch(0.6 0.25 290), transparent 70%)",
                      }}
                    />
                    <div className="relative flex items-center gap-2 flex-wrap z-10">
                      <span className="meta-chip">
                        <PenLine className="h-3 w-3" />
                        {a.tag}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {a.readingMins} min
                      </span>
                    </div>
                    <h3 className="relative text-lg sm:text-xl font-semibold tracking-tight leading-tight z-10">
                      {a.title}
                    </h3>
                    <p className="relative text-sm text-muted-foreground leading-relaxed line-clamp-3 z-10">
                      {a.excerpt}
                    </p>
                    <div className="relative mt-auto pt-3 border-t border-foreground/5 flex items-center justify-between z-10">
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors">
                        Read
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 sm:pt-28">
          <div className="section-divider rounded-full" />
        </div>

        {/* ============== CONTACT ============== */}
        <section
          id="contact"
          className="px-4 sm:px-6 pt-20 sm:pt-28 pb-16 scroll-mt-24"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl glass glass-sheen p-7 sm:p-12"
            >
              <div
                className="pointer-events-none absolute -top-20 right-0 h-60 w-60 rounded-full opacity-50 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.7 0.22 60 / 0.45), transparent 70%)",
                }}
              />
              <div className="relative grid lg:grid-cols-2 gap-8 items-start">
                <div>
                  <SectionHeader
                    eyebrow="Contact"
                    title="Let's build something quiet and durable."
                    align="left"
                  />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="mailto:hello@studio.dev"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/10 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      hello@studio.dev
                    </a>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/10 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                    <SocialLink href="https://twitter.com" label="Twitter">
                      <Twitter className="h-4 w-4" />
                    </SocialLink>
                    <SocialLink href="https://linkedin.com" label="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </SocialLink>
                    <SocialLink href="https://github.com" label="GitHub">
                      <Github className="h-4 w-4" />
                    </SocialLink>
                  </div>
                </div>

                {/* Quick message form */}
                <ContactForm />
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ============== FOOTER (sticky bottom) ============== */}
      <footer className="mt-auto px-4 sm:px-6 pb-6 pt-2">
        <div className="mx-auto max-w-6xl rounded-2xl glass glass-sheen px-5 sm:px-7 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 place-items-center rounded-lg text-white text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.6 0.2 200))",
              }}
            >
              S
            </span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Studio. Built with care.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Crafted with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>using Next.js, TypeScript &amp; Tailwind</span>
          </div>
        </div>
      </footer>

      {/* ============== DOC DRAWER ============== */}
      <ProjectDocDrawer
        slug={activeSlug}
        onClose={() => setActiveSlug(null)}
        allSlugs={allSlugs}
        onNavigate={(slug) => setActiveSlug(slug)}
        relatedProjects={relatedProjects}
      />

      {/* ============== ARTICLE DRAWER ============== */}
      <ArticleDrawer
        slug={activeArticle}
        onClose={() => setActiveArticle(null)}
        articles={articles}
        onNavigate={(slug) => setActiveArticle(slug)}
      />
    </div>
  )
}

/* ---------- Small section header ---------- */
function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70">
        <span className="h-px w-6 bg-current opacity-40" />
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight max-w-2xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
    >
      {children}
    </a>
  )
}

function ContactForm() {
  const [sending, setSending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.target as HTMLFormElement
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong.")
      }
      setSent(true)
      toast.success("Message received! I'll reply within a day or two.")
      form.reset()
      setTimeout(() => setSent(false), 3500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.")
      toast.error(err instanceof Error ? err.message : "Failed to send.")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full" noValidate>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          name="name"
          minLength={2}
          maxLength={80}
          placeholder="Your name"
          autoComplete="name"
          className="h-11 px-4 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="you@email.com"
          autoComplete="email"
          className="h-11 px-4 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
        />
      </div>
      <textarea
        required
        name="message"
        rows={4}
        minLength={10}
        maxLength={2000}
        placeholder="What are you building?"
        className="px-4 py-3 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all resize-none"
      />
      {error && (
        <p className="text-xs text-destructive -mt-1" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={sending || sent}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-medium text-white shadow-lg shadow-foreground/10 transition-transform hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
        }}
      >
        {sending ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Sending…
          </>
        ) : sent ? (
          <>
            Sent — thank you!
            <Check className="h-4 w-4" />
          </>
        ) : (
          <>
            Send message
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="text-[11px] text-muted-foreground/70">
        Saved to my inbox. I typically reply within 1–2 business days.
      </p>
    </form>
  )
}

/* ---------- Magnetic CTA button ----------
   Subtly translates toward the cursor on hover for a tactile feel. */
function MagneticButton({
  href,
  children,
  className,
  style,
}: {
  href: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = React.useRef<HTMLAnchorElement>(null)
  const raf = React.useRef<number>(0)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      const pull = 0.25
      el.style.transform = `translate(${x * pull}px, ${y * pull}px)`
    })
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.transform = "translate(0, 0)"
  }

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn("magnetic-btn transition-transform", className)}
      style={style}
    >
      {children}
    </a>
  )
}

/* ---------- CountUp stat ----------
   Animates a number from 0 to target when scrolled into view.
   Handles Infinity as a special case (renders ∞). */
function CountUp({
  value,
  suffix = "",
  duration = 1400,
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const [display, setDisplay] = React.useState(value === Infinity ? "∞" : "0")
  const ref = React.useRef<HTMLSpanElement>(null)
  const started = React.useRef(false)

  React.useEffect(() => {
    if (value === Infinity) {
      setDisplay("∞")
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setDisplay(String(value))
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - t, 3)
              const current = Math.round(value * eased)
              setDisplay(String(current))
              if (t < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
            obs.disconnect()
          }
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} suppressHydrationWarning>
      {display}
      {value !== Infinity && suffix}
    </span>
  )
}
