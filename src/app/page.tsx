"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  Mail,
  Linkedin,
  Github,
  Home as HomeIcon,
  FolderGit2,
  Info,
  ArrowRight,
  Cpu,
  Brain,
  Box,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
} from "lucide-react"
import { AmbientBackground } from "@/components/ambient-background"
import { PortfolioCarousel } from "@/components/portfolio-carousel"
import { ProjectDocDrawer } from "@/components/project-doc-drawer"
import type { PortfolioData, Project } from "@/lib/portfolio-types"
import { cn } from "@/lib/utils"

type View = "home" | "portfolio"

export default function Home() {
  const [data, setData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<View>("home")
  const [activeProjectSlug, setActiveProjectSlug] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Deep-linking: restore project drawer from URL hash
  React.useEffect(() => {
    const restore = () => {
      const hash = window.location.hash
      const m = /^#\/project\/([^/]+)/.exec(hash)
      if (m) {
        setActiveProjectSlug(decodeURIComponent(m[1]))
      }
    }
    restore()
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <AmbientBackground />

      {/* ===== Navbar / Main Menu ===== */}
      <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4">
        <nav className="mx-auto max-w-6xl rounded-2xl glass glass-sheen py-2.5 px-3 sm:px-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2.5 text-left"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-xl text-white text-sm font-bold shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.6 0.2 200))",
              }}
            >
              {(data?.profile?.name || "I")[0]}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">
                {data?.profile?.name || "Igasud Studio"}
              </span>
              <span className="hidden md:block text-[10px] text-muted-foreground -mt-0.5">
                Simulation Engineering Lab
              </span>
            </div>
          </button>

          {/* Menu */}
          <div className="flex items-center gap-1">
            <MenuButton
              active={view === "home"}
              onClick={() => {
                setView("home")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              icon={HomeIcon}
              label="Overview"
            />
            <MenuButton
              active={false}
              onClick={() => {
                setView("home")
                setTimeout(() => {
                  document
                    .getElementById("architecture")
                    ?.scrollIntoView({ behavior: "smooth" })
                }, 100)
              }}
              icon={Cpu}
              label="Architecture"
            />
            <MenuButton
              active={view === "portfolio"}
              onClick={() => setView("portfolio")}
              icon={FolderGit2}
              label="Modules & Docs"
            />
            <MenuButton
              active={false}
              onClick={() => {
                setView("home")
                setTimeout(() => {
                  document
                    .getElementById("vision")
                    ?.scrollIntoView({ behavior: "smooth" })
                }, 100)
              }}
              icon={Sparkles}
              label="Vision & R&D"
            />
          </div>
        </nav>
      </header>

      {/* ===== Main content ===== */}
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 min-h-0">
        {loading || !data ? (
          <div className="flex-1 grid place-items-center">
            <div className="h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          </div>
        ) : view === "portfolio" ? (
          <PortfolioCarousel
            projects={data.projects}
            onReadDocs={(p) => setActiveProjectSlug(p.slug)}
          />
        ) : (
          <HomeView
            data={data}
            onPortfolio={() => setView("portfolio")}
            onOpenProject={(slug) => setActiveProjectSlug(slug)}
          />
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="mt-auto px-4 sm:px-6 pb-4 pt-6">
        <div className="mx-auto max-w-6xl rounded-2xl glass glass-sheen px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} {data?.profile?.name || "Igasud Studio"}</span>
            <span>·</span>
            <span className="text-foreground/80 font-medium">igasud.tech</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Autonomous Engine Active
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
            <a href="mailto:contact@igasud.tech" className="hover:text-foreground transition-colors">
              contact@igasud.tech
            </a>
            <a
              href="https://github.com/dessulfate"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Core
            </a>
          </div>
        </div>
      </footer>

      {/* ===== Project Documentation Drawer ===== */}
      {data && (
        <ProjectDocDrawer
          project={
            data.projects.find((p) => p.slug === activeProjectSlug) ?? null
          }
          onClose={() => setActiveProjectSlug(null)}
          allSlugs={data.projects.map((p) => p.slug)}
          onNavigate={(slug) => setActiveProjectSlug(slug)}
          relatedProjects={
            data.projects.find((p) => p.slug === activeProjectSlug)
              ? data.projects
                  .filter(
                    (p) =>
                      p.slug !== activeProjectSlug &&
                      p.category ===
                        data.projects.find(
                          (pp) => pp.slug === activeProjectSlug
                        )?.category
                  )
                  .slice(0, 4)
              : []
          }
        />
      )}
    </div>
  )
}

/* ---------- Menu button ---------- */
function MenuButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof HomeIcon
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        active
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

/* ---------- Home view (hero + architecture + modules + vision + contact) ---------- */
function HomeView({
  data,
  onPortfolio,
  onOpenProject,
}: {
  data: PortfolioData
  onPortfolio: () => void
  onOpenProject: (slug: string) => void
}) {
  const { profile, projects } = data

  return (
    <div className="flex-1 overflow-y-auto thin-scroll pb-10">
      {/* 1. Hero section */}
      <section className="px-4 sm:px-6 pt-2">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl glass glass-sheen p-7 sm:p-10 lg:p-14"
          >
            {/* Decorative ambient glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.6 0.25 290 / 0.5), transparent 70%)",
              }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-35 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.65 0.2 200 / 0.5), transparent 70%)",
              }}
            />

            <div className="relative flex flex-col gap-6">
              {/* Status Badge */}
              <span className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Aetheris Engine v0.4 Alpha · Web-Native Simulation Pipeline
              </span>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06]">
                Deterministic Game Simulation & Spatial Intelligence
              </h1>

              {/* Subtitle */}
              <p className="max-w-3xl text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                Igasud Studio engineers high-performance browser-native simulation engines. We combine{" "}
                <span className="text-foreground font-medium">Component-Material Data Abstractions</span> with{" "}
                <span className="text-foreground font-medium">Dual-Loop Reinforcement Learning</span> and Anthropic Claude cognitive orchestration—delivering deterministic, zero-install virtual ecosystems.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onPortfolio}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg shadow-foreground/10 transition-transform hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                  }}
                >
                  Explore Simulation Modules
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    document
                      .getElementById("architecture")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium glass hover:bg-foreground/5 transition-colors border border-foreground/10"
                >
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  Engine Architecture
                </button>
              </div>

              {/* Key Telemetry Metrics */}
              <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-t border-foreground/8">
                <div className="p-3.5 rounded-2xl bg-foreground/4 border border-foreground/6">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    110k+
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Active Material Particles @ 60 FPS
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/4 border border-foreground/6">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    &lt; 1.18ms
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Physics Tick Latency on WebGPU
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/4 border border-foreground/6">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    Zero GC
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Contiguous TypedArray Arena
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-foreground/4 border border-foreground/6">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    Dual-Loop
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    WASM PPO + Claude Cognitive Core
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Core Engine Architecture Section */}
      <section id="architecture" className="px-4 sm:px-6 pt-12 sm:pt-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/80">
              Technical Architecture
            </span>
            <span className="h-px flex-1 bg-foreground/8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Engineered for Browser-Native Determinism
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Eliminating traditional JavaScript OOP latency through memory-aligned contiguous data arrays and asynchronous cognitive integration.
          </p>

          {/* 3 Technical Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Pillar 1 */}
            <div className="rounded-3xl glass glass-sheen p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center mb-4">
                  <Box className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  Component-Material Data Abstraction
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Entities decoupled from logic via Structure-of-Arrays (SoA) TypedArrays. Material tensors model real-world density (ρ), friction (μ), conductivity (κ), and yield stress (σy).
                </p>
              </div>
              <div className="pt-4 border-t border-foreground/6 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Structure-of-Arrays
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  SharedArrayBuffer
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Zero Heap Allocation
                </span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-3xl glass glass-sheen p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 grid place-items-center mb-4">
                  <Brain className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  Dual-Loop Neuro-Symbolic Agents
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Sub-millisecond WASM/WebGPU policies execute micro-level joint torque motor controls at 120Hz, while Anthropic Claude models direct macro-level goals and dynamic reward shaping.
                </p>
              </div>
              <div className="pt-4 border-t border-foreground/6 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  WASM Continuous PPO
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Claude 3.5 Goal Synthesizer
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Dynamic Reward Shaping
                </span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-3xl glass glass-sheen p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mb-4">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  Deterministic WebGPU Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  Fixed-step simulation loop guaranteeing identical frame evolution across clients. Parallel SPH fluids and granular continuum mechanics execute in WebGPU compute shaders.
                </p>
              </div>
              <div className="pt-4 border-t border-foreground/6 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  WebGPU Compute
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Fixed 60Hz Timestep
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/5 text-muted-foreground">
                  Binary Telemetry Bus
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Dual-Loop Dataflow Pipeline Box */}
          <div className="mt-8 rounded-3xl glass glass-sheen p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-foreground/8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Integration Topology
                </span>
                <h3 className="text-lg font-bold tracking-tight">
                  Hybrid Neuro-Symbolic Simulation Pipeline
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono bg-foreground/5 px-3 py-1 rounded-full border border-foreground/8 self-start md:self-auto">
                Claude API ⇄ SharedArrayBuffer ⇄ WebGPU
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-foreground/4 border border-foreground/6">
                <div className="flex items-center gap-2 mb-2 text-cyan-600 dark:text-cyan-400 font-semibold text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  1. Macro-Cognitive Tier (Claude)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Asynchronously consumes environment summaries to synthesize intent, modify reward loss functions, and dynamically compile natural language scenarios into initial material tensor seeds.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/4 border border-foreground/6">
                <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400 font-semibold text-xs">
                  <Activity className="h-3.5 w-3.5" />
                  2. Micro-Motor Policy (WASM)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Executes high-frequency continuous vector observations (proprioception & material rays) into normalized motor action torques at 120Hz with zero garbage collection overhead.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-foreground/4 border border-foreground/6">
                <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <Cpu className="h-3.5 w-3.5" />
                  3. Physical Tensor Solver (WebGPU)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Solves continuous Navier-Stokes and Mohr-Coulomb stress tensors across hundreds of thousands of active material particles using parallel compute passes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Simulation Modules Showcase */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/80 block">
                Research Modules
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Active Simulation Modules
              </h2>
            </div>
            <button
              onClick={onPortfolio}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-foreground/80 transition-colors"
            >
              Launch Slide Deck
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj.slug)}
                className="group cursor-pointer rounded-3xl glass glass-sheen p-6 flex flex-col justify-between hover:bg-foreground/4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {proj.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight group-hover:text-foreground/90 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {proj.tagline}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-foreground/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {proj.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-foreground/5 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:translate-x-0.5 transition-transform">
                    Read Specs
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onPortfolio}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold glass hover:bg-foreground/5 transition-colors border border-foreground/10"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              Open Interactive Simulation Slides & Docs
            </button>
          </div>
        </div>
      </section>

      {/* 4. Vision & Institutional Statement */}
      <section id="vision" className="px-4 sm:px-6 pt-12 sm:pt-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/80">
              Company Mission
            </span>
            <span className="h-px flex-1 bg-foreground/8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
            Independent Software & Simulation Lab
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-3xl glass glass-sheen p-6 sm:p-8">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 block mb-2">
                Vision Statement
              </span>
              <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed mb-4">
                To pioneer the next frontier of web-native spatial intelligence and emergent simulation, democratizing high-performance physics-material modeling and autonomous neuro-symbolic agent behaviors directly within the browser runtime.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We believe the future of interactive computing lies in frictionless, zero-install environments where game ecosystems, spatial robotics research, and autonomous agent simulations run on universal open web standards.
              </p>
            </div>

            <div className="rounded-3xl glass glass-sheen p-6 sm:p-8">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 block mb-2">
                Mission Statement
              </span>
              <p className="text-sm sm:text-base text-foreground font-medium leading-relaxed mb-4">
                Delivering high-throughput deterministic JavaScript engines that decouple physics from entity overhead, bridging micro-level physical reinforcement learning with frontier AI cognitive planning.
              </p>
              <div className="space-y-2 pt-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Eliminate browser garbage collection stutters with memory arena pooling.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Empower agents with continuous physics groundings and Claude semantic reasoning.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Provide open, verifiable developer tooling for spatial intelligence engineering.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Institutional Verification & Contact */}
      <section id="contact" className="px-4 sm:px-6 pt-12 sm:pt-16 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl glass glass-sheen p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified DeepTech Inquiries
              </span>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                Collaborate with Igasud Studio
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Whether you are an incubation partner, investor, simulation researcher, or developer interested in SDK early access, connect directly with our engineering team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:contact@igasud.tech"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                contact@igasud.tech
              </a>
              <a
                href="mailto:founders@igasud.tech"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold glass hover:bg-foreground/5 transition-colors border border-foreground/10"
              >
                Founder Inquiries
              </a>
              <a
                href="https://github.com/dessulfate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold glass hover:bg-foreground/5 transition-colors border border-foreground/10"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
