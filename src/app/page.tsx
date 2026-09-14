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
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { AmbientBackground } from "@/components/ambient-background"
import { ProjectCard } from "@/components/project-card"
import { ProjectDocDrawer } from "@/components/project-doc-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { ProjectSummary } from "@/lib/types"
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
  { value: "6+", label: "Projects shipped" },
  { value: "4", label: "Years building" },
  { value: "30k+", label: "Lines of clean code" },
  { value: "∞", label: "Curiosity" },
]

export default function Home() {
  const [projects, setProjects] = React.useState<ProjectSummary[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeCategory, setActiveCategory] =
    React.useState<(typeof CATEGORIES)[number]>("All")
  const [activeSlug, setActiveSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false))
  }, [])

  const filtered = React.useMemo(() => {
    if (activeCategory === "All") return projects
    return projects.filter((p) => p.category === activeCategory)
  }, [projects, activeCategory])

  const featured = React.useMemo(
    () => projects.filter((p) => p.featured).slice(0, 3),
    [projects]
  )

  return (
    <div id="top" className="relative min-h-screen flex flex-col">
      <AmbientBackground />
      <Navbar />

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
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Available for select projects
                </span>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                  Building calm,
                  <br />
                  <span className="text-gradient">considered software.</span>
                </h1>

                <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                  I&apos;m a product engineer focused on design systems, edge
                  performance, and developer tools. This is a living archive of
                  the work I&apos;ve shipped — each project comes with full
                  documentation, architecture notes, and lessons learned.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#work"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg shadow-foreground/10 transition-transform hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                    }}
                  >
                    Explore the work
                    <ArrowDown className="h-4 w-4" />
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/8 transition-colors"
                  >
                    Get in touch
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 mt-2 border-t border-foreground/8">
                  {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col">
                      <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {s.value}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
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
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ============== WORK / ALL PROJECTS ============== */}
        <section id="work" className="px-4 sm:px-6 pt-20 sm:pt-28 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="The archive"
              title="All projects"
              description="Filter by domain. Every card opens a documentation panel with architecture, features, and roadmap."
            />

            {/* Filter pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all",
                    activeCategory === c
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground border border-foreground/8"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
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

            {!loading && filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                No projects in this category yet.
              </div>
            )}
          </div>
        </section>

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
          </div>
        </section>

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
                  className="rounded-2xl glass glass-sheen glass-hover p-4 sm:p-5 flex items-center gap-3"
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

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    // Simulated send (no backend needed for portfolio)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      toast.success("Message captured! I'll get back to you soon.")
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setSent(false), 3000)
    }, 900)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          name="name"
          placeholder="Your name"
          className="h-11 px-4 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="you@email.com"
          className="h-11 px-4 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
        />
      </div>
      <textarea
        required
        name="message"
        rows={4}
        placeholder="What are you building?"
        className="px-4 py-3 rounded-xl bg-foreground/4 border border-foreground/8 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all resize-none"
      />
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
          "Sending…"
        ) : sent ? (
          "Sent — thank you!"
        ) : (
          <>
            Send message
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
