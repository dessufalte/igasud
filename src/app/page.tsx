"use client"

import * as React from "react"
import Image from "next/image"
import {
  Mail,
  Github,
  Home as HomeIcon,
  FolderGit2,
  ArrowRight,
  Cpu,
  Brain,
  Box,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Globe,
  MessageSquare,
  BookOpen,
} from "lucide-react"
import { PortfolioCarousel } from "@/components/portfolio-carousel"
import { ProjectDocDrawer } from "@/components/project-doc-drawer"
import { CodexAdminModal } from "@/components/codex-admin-modal"
import type { Language, PortfolioData } from "@/lib/portfolio-types"
import { cn } from "@/lib/utils"

type View = "home" | "portfolio"

const UI_TEXT = {
  en: {
    labSubtitle: "Systems Lab for Game Engines & Deterministic AI",
    navOverview: "Monograph",
    navArchitecture: "Engine Core",
    navModules: "Active Projects",
    navVision: "Philosophy",
    navForum: "Forum MG2SO4",
    heroSectionTag: "VOL. II · ARCHIVAL TECHNICAL CODEX · IGASUD.TECH",
    heroHeadline: "Simulation Systems, Game Engines, and Deterministic AI",
    heroLead:
      "Igasud Studio builds game simulation engines and deterministic AI. We focus on active C++ development—spanning the zero-allocation world simulation of Nubian, the modular entity and ruleset runtime of Thema, and reproducible agent decision systems for deep RPGs and strategy games.",
    btnExploreModules: "Inspect Active Projects",
    btnArchitecture: "Read System Architecture",
    btnForum: "Community Forum (MG2SO4)",
    metric1Val: "0.00 ms",
    metric1Label: "Runtime Heap Allocations (Pre-Allocated World Memory)",
    metric2Val: "10,000+",
    metric2Label: "Autonomous Population Cohorts @ ~1ms Tick Time",
    metric3Val: "O(1)",
    metric3Label: "Typed Integer Handle Lookup for Entity Rulesets",
    metric4Val: "100%",
    metric4Label: "Deterministic Decision Replay & Lockstep Verification",
    archTag: "SECTION I · SYSTEMS ARCHITECTURE & MEMORY DESIGN",
    archTitle: "Engineered for Predictable, Cache-Friendly Performance",
    archDesc:
      "Conventional object-oriented game code often struggles with pointer chasing and fragmented heap allocations when handling thousands of detailed game entities. Igasud Studio designs systems with Data-Oriented Design (DOD) principles to keep memory access localized and predictable.",
    pillar1Title: "Nubian Core: Macro Simulation Engine",
    pillar1Body:
      "Pre-allocates the complete world state at startup—10,000+ population cohorts, 2,000+ buildings, trade networks, and ruling dynasties—computing full socio-economic ticks in roughly 1 ms without runtime heap allocations.",
    pillar2Title: "Thema: Entity Runtime & Multi-Registry",
    pillar2Body:
      "Separates static definitions from living entity runtimes (`pop_runtime`, `building_runtime`, `market_runtime`). Evaluates materials, climate modifiers, and regional market prices via fast integer handles with O(1) array indexing.",
    pillar3Title: "Deterministic AI: Decision Engineering",
    pillar3Body:
      "Provides frame-exact reproducible decision policies and utility scoring for tactical game NPCs and strategic factions, ensuring desync-free lockstep execution and reliable behaviors.",
    topologyTag: "INTEGRATION TOPOLOGY · SYSTEM DATA PIPELINE",
    topologyTitle: "From Modular Data Rulesets to Responsive Game Worlds",
    tier1Title: "1. Thema Binary Registry & Data Schema",
    tier1Body:
      "Loads material definitions, climate rules, and world parameters into flat Structure-of-Arrays (SoA) memory blocks without runtime allocation overhead.",
    tier2Title: "2. Nubian & Thema Entity Solvers",
    tier2Body:
      "Evaluates trade networks, building production cycles, and demographic shifts step-by-step using fixed timesteps for consistent frame execution.",
    tier3Title: "3. Deterministic AI Decision System",
    tier3Body:
      "Agents evaluate tactical threats and long-term utility scores deterministically, keeping character reactions instant and fully reproducible.",
    modulesTag: "SECTION II · ACTIVE PROJECTS & SPECIFICATIONS",
    modulesTitle: "Active Engineering Projects",
    btnSlideDeck: "Open Monograph Slide Deck",
    readSpecs: "Read Technical Specs",
    openInteractiveSlides: "Open Interactive Monograph Carousel",
    benchmarkTag: "SECTION III · PERFORMANCE NOTES & SYSTEM BENCHMARKS",
    benchmarkTitle: "Measured System Telemetry",
    benchmarkColMetric: "Simulation Subsystem / Metric",
    benchmarkColTraditional: "Conventional OOP Game Setup",
    benchmarkColIgasud: "Igasud Systems (Nubian / Thema / Det. AI)",
    benchmarkColGain: "Observed Difference",
    visionTag: "SECTION IV · ENGINEERING PHILOSOPHY & FOCUS",
    visionTitle: "Building Solid Foundations for Games & AI",
    visionHeader1: "The Core Focus",
    visionBody1:
      "Modern RPGs and strategy simulations benefit when game logic is fast, predictable, and decoupled from heavy frameworks. Igasud Studio focuses on building lean, deterministic foundations where detailed entity data and autonomous agents run smoothly together.",
    visionBody2:
      "Whether managing populations across settlement networks, solving market supply and demand, or executing tactical agent utility curves, our systems emphasize memory locality, determinism, and clear separation of concerns.",
    visionHeader2: "Guiding Principles",
    tenet1: "Data-Oriented Design (SoA buffers, pre-allocated memory, cache-line efficiency).",
    tenet2: "Deterministic decision logic ensuring identical state transitions for given inputs.",
    tenet3: "Clean systems architecture in C++ with modular separation of data and runtime logic.",
    contactTag: "SECTION V · COLLABORATION & COMMUNITY",
    contactTitle: "Connect with Igasud Studio",
    contactDesc:
      "For discussions on engine architecture, entity simulation systems, deterministic AI, or conversations on the MG2SO4 community forum, feel free to reach out.",
    copyrightRights: "All Rights Reserved.",
    statusActive: "Deterministic Engine Active",
  },
  id: {
    labSubtitle: "Laboratorium Sistem untuk Engine Game & AI Deterministik",
    navOverview: "Monograf",
    navArchitecture: "Inti Engine",
    navModules: "Proyek Aktif",
    navVision: "Filosofi",
    navForum: "Forum MG2SO4",
    heroSectionTag: "VOL. II · KODEKS TEKNIS ARSIP · IGASUD.TECH",
    heroHeadline: "Sistem Simulasi, Engine Game, dan AI Deterministik",
    heroLead:
      "Igasud Studio membangun engine simulasi game dan AI deterministik. Kami berfokus pada pengembangan aktif C++—mencakup simulasi dunia tanpa alokasi dinamis pada Nubian, runtime entitas dan registry modular pada Thema, serta sistem keputusan agen yang dapat direproduksi untuk RPG mendalam dan game strategi.",
    btnExploreModules: "Inspeksi Proyek Aktif",
    btnArchitecture: "Baca Arsitektur Sistem",
    btnForum: "Forum Komunitas (MG2SO4)",
    metric1Val: "0.00 ms",
    metric1Label: "Alokasi Memori Runtime (Arena Memori Pra-Alokasi)",
    metric2Val: "10.000+",
    metric2Label: "Kohor Populasi Otonom @ Waktu Tick ~1ms",
    metric3Val: "O(1)",
    metric3Label: "Pencarian Handle Integer untuk Aturan Entitas",
    metric4Val: "100%",
    metric4Label: "Replay Keputusan Deterministik & Verifikasi Lockstep",
    archTag: "BAB I · ARSITEKTUR SISTEM & DESAIN MEMORI",
    archTitle: "Dirancang untuk Kinerja Terprediksi & Ramah Cache",
    archDesc:
      "Kode game berorientasi objek (OOP) konvensional kerap mengalami masalah pointer chasing dan alokasi heap yang terfragmentasi saat mengelola ribuan entitas game. Igasud Studio merancang sistem berbasis prinsip Data-Oriented Design (DOD) agar akses memori tetap teratur dan terprediksi.",
    pillar1Title: "Nubian Core: Engine Simulasi Makro",
    pillar1Body:
      "Melakukan pra-alokasi seluruh status dunia saat startup—10.000+ kohor populasi, 2.000+ bangunan, jaringan dagang, dan dinasti penguasa—menjalankan kalkulasi dunia dalam ~1 ms tanpa alokasi memori runtime.",
    pillar2Title: "Thema: Runtime Entitas & Multi-Registry",
    pillar2Body:
      "Memisahkan definisi statis dari runtime entitas aktif (`pop_runtime`, `building_runtime`, `market_runtime`). Mengevaluasi material, modifier iklim, dan harga pasar regional melalui handle integer cepat dengan indeks array O(1).",
    pillar3Title: "AI Deterministik: Rekayasa Keputusan",
    pillar3Body:
      "Menyediakan policy keputusan yang dapat direproduksi persis per-frame dan penilaian utilitas untuk NPC game taktis serta faksi strategis, menjamin eksekusi lockstep bebas desync dan perilaku yang andal.",
    topologyTag: "TOPOLOGI INTEGRASI · ALIRAN DATA SISTEM",
    topologyTitle: "Dari Aturan Data Terstruktur menuju Dunia Game yang Responsif",
    tier1Title: "1. Registry & Skema Data Biner Thema",
    tier1Body:
      "Memuat definisi material, aturan iklim, dan parameter dunia ke dalam blok memori Structure-of-Arrays (SoA) tanpa beban alokasi runtime.",
    tier2Title: "2. Solver Entitas Nubian & Thema",
    tier2Body:
      "Mengeksekusi jaringan perdagangan, siklus produksi bangunan, dan dinamika populasi secara bertahap pada langkah waktu tetap untuk kestabilan frame.",
    tier3Title: "3. Sistem Keputusan AI Deterministik",
    tier3Body:
      "Agen mengevaluasi ancaman taktis dan skor utilitas jangka panjang secara deterministik, menjaga reaksi karakter tetap instan dan dapat direproduksi penuh.",
    modulesTag: "BAB II · PROYEK AKTIF & SPESIFIKASI",
    modulesTitle: "Proyek Rekayasa yang Sedang Berlangsung",
    btnSlideDeck: "Buka Slide Monograf",
    readSpecs: "Baca Spesifikasi",
    openInteractiveSlides: "Buka Karusel Monograf Interaktif",
    benchmarkTag: "BAB III · CATATAN PERFORMA & PENGUKURAN SISTEM",
    benchmarkTitle: "Telemetri Pengukuran Sistem",
    benchmarkColMetric: "Subsistem Simulasi / Metrik",
    benchmarkColTraditional: "Setup Game OOP Konvensional",
    benchmarkColIgasud: "Sistem Igasud (Nubian / Thema / Det. AI)",
    benchmarkColGain: "Perbedaan Terukur",
    visionTag: "BAB IV · FILOSOFI REKAYASA & FOKUS",
    visionTitle: "Membangun Fondasi yang Solid untuk Game & AI",
    visionHeader1: "Fokus Utama",
    visionBody1:
      "Game RPG dan simulasi strategi bekerja jauh lebih baik ketika logika intinya cepat, terprediksi, dan terbebas dari overhead framework yang berat. Igasud Studio berfokus membangun fondasi yang ramping dan deterministik tempat data entitas mendalam dan agen otonom dapat berjalan berdampingan.",
    visionBody2:
      "Baik mengelola populasi di seluruh jaringan pemukiman, menghitung permintaan pasar, maupun mengeksekusi kurva utilitas agen taktis, sistem kami menekankan efisiensi memori, determinisme, dan pemisahan logika yang bersih.",
    visionHeader2: "Prinsip Panduan",
    tenet1: "Data-Oriented Design (buffer SoA, memori pra-alokasi, efisiensi cache CPU).",
    tenet2: "Logika keputusan deterministik yang menjamin transisi status identik untuk input yang sama.",
    tenet3: "Arsitektur sistem yang bersih dalam C++ dengan pemisahan modular antara data dan logika runtime.",
    contactTag: "BAB V · KOLABORASI & KOMUNITAS",
    contactTitle: "Terhubung dengan Igasud Studio",
    contactDesc:
      "Untuk diskusi seputar arsitektur engine, sistem simulasi entitas, AI deterministik, atau obrolan di forum komunitas MG2SO4, silakan hubungi kami.",
    copyrightRights: "Hak Cipta Dilindungi Undang-Undang.",
    statusActive: "Engine Deterministik Aktif",
  },
}

export default function Home() {
  const [data, setData] = React.useState<PortfolioData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [view, setView] = React.useState<View>("home")
  const [lang, setLang] = React.useState<Language>("en")
  const [activeProjectSlug, setActiveProjectSlug] = React.useState<string | null>(null)
  const [adminOpen, setAdminOpen] = React.useState(false)
  const logoClickCountRef = React.useRef<{ count: number; lastTime: number }>({
    count: 0,
    lastTime: 0,
  })

  const fetchPortfolioData = React.useCallback(async () => {
    try {
      const r = await fetch("/api/data", { cache: "no-store" })
      const d = await r.json()
      setData(d)
    } catch {
      // ignore error
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPortfolioData()
    const savedLang = window.localStorage.getItem("igasud-lang")
    if (savedLang === "id" || savedLang === "en") {
      setLang(savedLang)
    }
  }, [fetchPortfolioData])

  const toggleLang = (nextLang: Language) => {
    setLang(nextLang)
    window.localStorage.setItem("igasud-lang", nextLang)
  }

  // Deep-linking & Hidden Admin triggers (Ctrl+Shift+A / Alt+Shift+A or #codex-admin)
  React.useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      if (hash === "#codex-admin") {
        setAdminOpen(true)
        window.history.replaceState(null, "", window.location.pathname)
        return
      }
      const m = /^#\/project\/([^/]+)/.exec(hash)
      if (m) {
        setActiveProjectSlug(decodeURIComponent(m[1]))
      }
    }
    checkHash()
    window.addEventListener("popstate", checkHash)

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.altKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault()
        setAdminOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("popstate", checkHash)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  // Secret 5x click on Octagon Logo to open hidden admin panel
  const handleLogoSecretClick = () => {
    setView("home")
    const now = Date.now()
    if (now - logoClickCountRef.current.lastTime > 1800) {
      logoClickCountRef.current.count = 1
    } else {
      logoClickCountRef.current.count += 1
    }
    logoClickCountRef.current.lastTime = now

    if (logoClickCountRef.current.count >= 5) {
      logoClickCountRef.current.count = 0
      setAdminOpen(true)
    }
  }

  const t = UI_TEXT[lang]
  const forumUrl = data?.profile?.contact?.forumUrl || "https://forum.igasud.tech"

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f4eedb] text-[#1e1815]">
      {/* ===== Top Institutional Masthead Bar (MG2SO4 Style) ===== */}
      <header className="sticky top-0 inset-x-0 z-50 bg-[#f4eedb] border-b-2 border-[#5c0707]">
        {/* Subtle Top Archival Strip */}
        <div className="bg-[#5c0707] text-[#f4eedb] px-4 py-1 text-[11px] font-mono">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="inline-block h-2 w-2 rounded-full bg-[#EF7F1A]" />
              <span className="truncate">
                {lang === "id"
                  ? data?.profile?.statusTextId || data?.profile?.statusText || "Engine Core v2.0 Aktif"
                  : data?.profile?.statusText || "Engine Core v2.0 · Deterministic Runtime Active"}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={forumUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#f4eedb] hover:text-[#EF7F1A] underline underline-offset-2 font-bold hidden sm:inline-flex items-center gap-1"
              >
                forum.igasud.tech
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              <span className="text-[#bfb69e]/50 hidden sm:inline">|</span>
              <div className="inline-flex items-center gap-1 bg-[#400404] px-1.5 py-0.5 border border-[#801010]">
                <Globe className="h-3 w-3 text-[#EF7F1A] mr-0.5" />
                <button
                  type="button"
                  onClick={() => toggleLang("en")}
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-bold uppercase cursor-pointer transition-colors",
                    lang === "en"
                      ? "bg-[#f4eedb] text-[#5c0707]"
                      : "text-[#f4eedb]/70 hover:text-white"
                  )}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => toggleLang("id")}
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-bold uppercase cursor-pointer transition-colors",
                    lang === "id"
                      ? "bg-[#f4eedb] text-[#5c0707]"
                      : "text-[#f4eedb]/70 hover:text-white"
                  )}
                >
                  ID
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleLogoSecretClick}
            title="Igasud Studio"
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="relative h-10 w-10 shrink-0 bg-[#efe7ce] border border-[#bfb69e] p-1 flex items-center justify-center group-hover:border-[#5c0707] transition-colors">
              <Image
                src="/logo.svg"
                alt="Igasud Studio Octagon Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#5c0707] mg-header-font uppercase leading-none">
                {data?.profile?.name || "IGASUD STUDIO"}
              </span>
              <span className="text-[11px] text-[#655f53] font-serif mt-0.5 hidden sm:block">
                {lang === "id"
                  ? data?.profile?.roleId || t.labSubtitle
                  : data?.profile?.role || t.labSubtitle}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
            <NavTabButton
              active={view === "home"}
              onClick={() => {
                setView("home")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              icon={HomeIcon}
              label={t.navOverview}
            />
            <NavTabButton
              active={false}
              onClick={() => {
                setView("home")
                setTimeout(() => {
                  document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" })
                }, 80)
              }}
              icon={Cpu}
              label={t.navArchitecture}
            />
            <NavTabButton
              active={view === "portfolio"}
              onClick={() => setView("portfolio")}
              icon={FolderGit2}
              label={t.navModules}
            />
            <NavTabButton
              active={false}
              onClick={() => {
                setView("home")
                setTimeout(() => {
                  document.getElementById("vision")?.scrollIntoView({ behavior: "smooth" })
                }, 80)
              }}
              icon={BookOpen}
              label={t.navVision}
            />
            <a
              href={forumUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#5c0707] text-[#f4eedb] border border-[#400404] hover:bg-[#801010] transition-colors mg-header-font"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#EF7F1A]" />
              <span className="hidden md:inline">{t.navForum}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </nav>
      </header>

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex flex-col min-h-0">
        {loading || !data ? (
          <div className="flex-1 grid place-items-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-2 border-[#5c0707]/30 border-t-[#5c0707] animate-spin" />
              <span className="text-xs font-mono text-[#655f53] uppercase tracking-wider">
                Loading Technical Monograph...
              </span>
            </div>
          </div>
        ) : view === "portfolio" ? (
          <PortfolioCarousel
            projects={data.projects}
            lang={lang}
            onReadDocs={(p) => setActiveProjectSlug(p.slug)}
          />
        ) : (
          <HomeMonographView
            data={data}
            lang={lang}
            t={t}
            forumUrl={forumUrl}
            onPortfolio={() => setView("portfolio")}
            onOpenProject={(slug) => setActiveProjectSlug(slug)}
          />
        )}
      </main>

      {/* ===== Archival Colophon Footer ===== */}
      <footer className="mt-auto border-t-2 border-[#5c0707] bg-[#efe7ce] px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-[#422624]">
            <Image
              src="/logo.svg"
              alt="Igasud Octagon"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
            <span className="font-bold text-[#5c0707] mg-header-font uppercase">
              © {new Date().getFullYear()} Igasud Studio.
            </span>
            <span>{t.copyrightRights}</span>
            <span className="text-[#bfb69e]">|</span>
            <span className="font-mono text-[11px] text-[#655f53]">
              {data?.profile?.university || "Nubian · Thema · Deterministic AI"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-[#5c0707] mg-header-font uppercase">
            <a
              href={forumUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              Forum MG2SO4
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={`mailto:${data?.profile?.contact?.email || "hello@igasud.tech"}`}
              className="hover:underline"
            >
              {data?.profile?.contact?.email || "hello@igasud.tech"}
            </a>
            <a
              href={data?.profile?.contact?.github || "https://github.com/dessulfate"}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* ===== Project Documentation Drawer ===== */}
      {data && (
        <ProjectDocDrawer
          project={data.projects.find((p) => p.slug === activeProjectSlug) ?? null}
          onClose={() => setActiveProjectSlug(null)}
          allSlugs={data.projects.map((p) => p.slug)}
          onNavigate={(slug) => setActiveProjectSlug(slug)}
          relatedProjects={
            data.projects.find((p) => p.slug === activeProjectSlug)
              ? data.projects.filter((p) => p.slug !== activeProjectSlug).slice(0, 3)
              : []
          }
        />
      )}

      {/* ===== Hidden PostgreSQL Admin Console ===== */}
      <CodexAdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        data={data}
        onRefreshData={fetchPortfolioData}
      />
    </div>
  )
}

function NavTabButton({
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
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer mg-header-font",
        active
          ? "bg-[#5c0707] text-[#f4eedb] border-[#400404]"
          : "bg-[#efe7ce] text-[#422624] border-[#bfb69e] hover:border-[#5c0707] hover:text-[#5c0707]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function HomeMonographView({
  data,
  lang,
  t,
  forumUrl,
  onPortfolio,
  onOpenProject,
}: {
  data: PortfolioData
  lang: Language
  t: (typeof UI_TEXT)["en"]
  forumUrl: string
  onPortfolio: () => void
  onOpenProject: (slug: string) => void
}) {
  const { profile, projects } = data

  return (
    <div className="flex-1 pb-14">
      {/* 1. Hero Monograph Section */}
      <section className="px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="bg-[#f8f3e3] border-2 border-[#5c0707] p-6 sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#bfb69e] text-xs font-mono text-[#655f53]">
              <span>{t.heroSectionTag}</span>
              <span className="text-[#5c0707] font-bold">
                [ NUBIAN CORE · THEMA RUNTIME · DETERMINISTIC AI ]
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-9 space-y-5">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#5c0707] leading-[1.1] mg-header-font">
                  {t.heroHeadline}
                </h1>

                <p className="text-base sm:text-lg text-[#2b231d] leading-relaxed font-serif">
                  {lang === "id" && profile?.aboutId
                    ? profile.aboutId
                    : profile?.about || t.heroLead}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onPortfolio}
                    className="inline-flex items-center gap-2 px-5 py-2.5 mg-btn-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {t.btnExploreModules}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 mg-btn-outline text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Cpu className="h-4 w-4 text-[#5c0707]" />
                    {t.btnArchitecture}
                  </button>
                  <a
                    href={forumUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 mg-btn-outline text-xs font-bold uppercase tracking-wider"
                  >
                    <MessageSquare className="h-4 w-4 text-[#5c0707]" />
                    {t.btnForum}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-3 flex flex-col items-center justify-center p-6 bg-[#efe7ce] border border-[#bfb69e]">
                <Image
                  src="/logo.svg"
                  alt="Igasud Clean Octagon Emblem"
                  width={140}
                  height={140}
                  className="h-32 w-32 sm:h-36 sm:w-36 object-contain"
                  priority
                />
                <div className="mt-4 text-center border-t border-[#bfb69e] pt-3 w-full">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#5c0707] mg-header-font">
                    OCTAGON CORE
                  </div>
                  <div className="text-[10px] font-mono text-[#655f53] mt-0.5">
                    DOD · DETERMINISTIC · AI
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Telemetry Metrics */}
            <div className="mt-8 pt-6 border-t-2 border-[#5c0707] grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#efe7ce] border border-[#bfb69e]">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#5c0707]">
                  {t.metric1Val}
                </div>
                <div className="text-xs text-[#422624] mt-1 font-medium">
                  {t.metric1Label}
                </div>
              </div>
              <div className="p-4 bg-[#efe7ce] border border-[#bfb69e]">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#5c0707]">
                  {t.metric2Val}
                </div>
                <div className="text-xs text-[#422624] mt-1 font-medium">
                  {t.metric2Label}
                </div>
              </div>
              <div className="p-4 bg-[#efe7ce] border border-[#bfb69e]">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#5c0707]">
                  {t.metric3Val}
                </div>
                <div className="text-xs text-[#422624] mt-1 font-medium">
                  {t.metric3Label}
                </div>
              </div>
              <div className="p-4 bg-[#efe7ce] border border-[#bfb69e]">
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#5c0707]">
                  {t.metric4Val}
                </div>
                <div className="text-xs text-[#422624] mt-1 font-medium">
                  {t.metric4Label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Engine Architecture Section */}
      <section id="architecture" className="px-4 sm:px-6 pt-12 sm:pt-14 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="border-b-2 border-[#5c0707] pb-2 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#655f53] block">
                {t.archTag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#5c0707] mg-header-font mt-1">
                {t.archTitle}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#422624] bg-[#efe7ce] px-2.5 py-1 border border-[#bfb69e] self-start sm:self-auto">
              C++20 · Data-Oriented Design · Fixed Steps
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#2b231d] max-w-4xl mb-8 leading-relaxed">
            {t.archDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#f8f3e3] border border-[#bfb69e] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#bfb69e] pb-3 mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#5c0707]">
                    PILLAR 01 // NUBIAN
                  </span>
                  <Database className="h-4 w-4 text-[#5c0707]" />
                </div>
                <h3 className="text-lg font-bold text-[#1e1815] mb-2 mg-header-font">
                  {t.pillar1Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#2b231d] leading-relaxed mb-4">
                  {t.pillar1Body}
                </p>
              </div>
              <div className="pt-3 border-t border-[#bfb69e] flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Zero Runtime Alloc
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Flat Entity Buffers
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  C++ DOD
                </span>
              </div>
            </div>

            <div className="bg-[#f8f3e3] border border-[#bfb69e] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#bfb69e] pb-3 mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#5c0707]">
                    PILLAR 02 // THEMA
                  </span>
                  <Box className="h-4 w-4 text-[#5c0707]" />
                </div>
                <h3 className="text-lg font-bold text-[#1e1815] mb-2 mg-header-font">
                  {t.pillar2Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#2b231d] leading-relaxed mb-4">
                  {t.pillar2Body}
                </p>
              </div>
              <div className="pt-3 border-t border-[#bfb69e] flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Entity Runtimes
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  O(1) Handle Indexing
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Market Cycles
                </span>
              </div>
            </div>

            <div className="bg-[#f8f3e3] border border-[#bfb69e] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#bfb69e] pb-3 mb-4">
                  <span className="text-xs font-mono font-bold uppercase text-[#5c0707]">
                    PILLAR 03 // DET. AI
                  </span>
                  <Brain className="h-4 w-4 text-[#5c0707]" />
                </div>
                <h3 className="text-lg font-bold text-[#1e1815] mb-2 mg-header-font">
                  {t.pillar3Title}
                </h3>
                <p className="text-xs sm:text-sm text-[#2b231d] leading-relaxed mb-4">
                  {t.pillar3Body}
                </p>
              </div>
              <div className="pt-3 border-t border-[#bfb69e] flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Reproducible Replay
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Utility Scoring
                </span>
                <span className="px-2 py-0.5 bg-[#efe7ce] border border-[#bfb69e] text-[#422624]">
                  Tactical Decisions
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#efe7ce] border border-[#bfb69e] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#bfb69e]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#655f53]">
                  {t.topologyTag}
                </span>
                <h3 className="text-lg font-bold text-[#5c0707] mg-header-font">
                  {t.topologyTitle}
                </h3>
              </div>
              <span className="text-xs font-mono bg-[#f8f3e3] text-[#5c0707] px-3 py-1 border border-[#bfb69e] self-start md:self-auto">
                Thema Registry ➔ Nubian & Thema Arena ➔ Deterministic AI
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-[#f8f3e3] border border-[#bfb69e]">
                <div className="flex items-center gap-2 mb-2 text-[#5c0707] font-bold text-xs uppercase mg-header-font">
                  <Layers className="h-3.5 w-3.5" />
                  {t.tier1Title}
                </div>
                <p className="text-xs text-[#2b231d] leading-relaxed">{t.tier1Body}</p>
              </div>

              <div className="p-4 bg-[#f8f3e3] border border-[#bfb69e]">
                <div className="flex items-center gap-2 mb-2 text-[#5c0707] font-bold text-xs uppercase mg-header-font">
                  <Activity className="h-3.5 w-3.5" />
                  {t.tier2Title}
                </div>
                <p className="text-xs text-[#2b231d] leading-relaxed">{t.tier2Body}</p>
              </div>

              <div className="p-4 bg-[#f8f3e3] border border-[#bfb69e]">
                <div className="flex items-center gap-2 mb-2 text-[#5c0707] font-bold text-xs uppercase mg-header-font">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.tier3Title}
                </div>
                <p className="text-xs text-[#2b231d] leading-relaxed">{t.tier3Body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Active Projects Grid */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between border-b-2 border-[#5c0707] pb-2 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#655f53] block">
                {t.modulesTag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#5c0707] mg-header-font mt-1">
                {t.modulesTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onPortfolio}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#5c0707] hover:underline cursor-pointer mg-header-font"
            >
              {t.btnSlideDeck}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projects.map((proj, idx) => {
              const projTitle = lang === "id" && proj.titleId ? proj.titleId : proj.title
              const projTagline = lang === "id" && proj.taglineId ? proj.taglineId : proj.tagline
              const projDesc =
                lang === "id" && proj.descriptionId ? proj.descriptionId : proj.description

              return (
                <div
                  key={proj.slug}
                  onClick={() => onOpenProject(proj.slug)}
                  className="group cursor-pointer bg-[#f8f3e3] border border-[#bfb69e] hover:border-[#5c0707] p-6 flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#bfb69e]">
                      <span className="text-[11px] font-mono font-bold text-[#5c0707] uppercase">
                        0{idx + 1} // ACTIVE
                      </span>
                      <span className="text-[10px] font-mono bg-[#efe7ce] px-2 py-0.5 border border-[#bfb69e] text-[#422624]">
                        {proj.year} · IN-PROGRESS
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#1e1815] group-hover:text-[#5c0707] transition-colors mg-header-font">
                      {projTitle}
                    </h3>

                    <p className="mt-1.5 text-xs font-bold text-[#422624] italic">
                      {projTagline}
                    </p>

                    <p className="mt-2.5 text-xs sm:text-sm text-[#2b231d] line-clamp-3 leading-relaxed">
                      {projDesc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#bfb69e] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(proj.tech || []).slice(0, 2).map((techItem) => (
                        <span
                          key={techItem}
                          className="px-2 py-0.5 text-[10px] font-mono bg-[#efe7ce] text-[#422624] border border-[#bfb69e]"
                        >
                          {techItem}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#5c0707] group-hover:translate-x-0.5 transition-transform mg-header-font shrink-0">
                      {t.readSpecs}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onPortfolio}
              className="inline-flex items-center gap-2 px-6 py-2.5 mg-btn-outline text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <FolderGit2 className="h-3.5 w-3.5 text-[#5c0707]" />
              {t.openInteractiveSlides}
            </button>
          </div>
        </div>
      </section>

      {/* 4. Performance Notes & Benchmarks */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="border-b-2 border-[#5c0707] pb-2 mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#655f53] block">
              {t.benchmarkTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c0707] mg-header-font mt-1">
              {t.benchmarkTitle}
            </h2>
          </div>

          <div className="overflow-x-auto border border-[#bfb69e] bg-[#f8f3e3]">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#efe7ce] border-b-2 border-[#5c0707] text-[#5c0707] mg-header-font uppercase text-xs">
                  <th className="py-3 px-4 border-r border-[#bfb69e]">{t.benchmarkColMetric}</th>
                  <th className="py-3 px-4 border-r border-[#bfb69e]">{t.benchmarkColTraditional}</th>
                  <th className="py-3 px-4 border-r border-[#bfb69e]">{t.benchmarkColIgasud}</th>
                  <th className="py-3 px-4">{t.benchmarkColGain}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bfb69e] font-serif">
                <tr>
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-bold">
                    Nubian World Tick (10,000 Pops + 2,000 Buildings)
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] text-[#655f53] font-mono">
                    18.40 ms (Heap OOP)
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-mono font-bold text-[#5c0707]">
                    1.03 ms (Nubian SoA)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    Steady Frame Pacing · 0 Bytes Alloc
                  </td>
                </tr>
                <tr className="bg-[#efe7ce]/40">
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-bold">
                    Thema Entity & Climate Modifier Lookups
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] text-[#655f53] font-mono">
                    String Map Searches
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-mono font-bold text-[#5c0707]">
                    O(1) Typed Handle (Thema)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    Direct Array Indexing
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-bold">
                    Deterministic Agent Decision Latency
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] text-[#655f53] font-mono">
                    Variable / Non-Deterministic
                  </td>
                  <td className="py-3 px-4 border-r border-[#bfb69e] font-mono font-bold text-[#5c0707]">
                    Sub-millisecond Utility Passes
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    100% Lockstep & Replay Verified
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Philosophy & Focus */}
      <section id="vision" className="px-4 sm:px-6 pt-12 sm:pt-14 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="border-b-2 border-[#5c0707] pb-2 mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#655f53] block">
              {t.visionTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c0707] mg-header-font mt-1">
              {t.visionTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#f8f3e3] border border-[#bfb69e] p-6 sm:p-8">
              <span className="text-xs uppercase tracking-wider font-bold text-[#5c0707] block mb-2 mg-header-font">
                {t.visionHeader1}
              </span>
              <p className="text-sm sm:text-base text-[#1e1815] font-medium leading-relaxed mb-4">
                {t.visionBody1}
              </p>
              <p className="text-xs sm:text-sm text-[#422624] leading-relaxed">
                {t.visionBody2}
              </p>
            </div>

            <div className="bg-[#f8f3e3] border border-[#bfb69e] p-6 sm:p-8">
              <span className="text-xs uppercase tracking-wider font-bold text-[#5c0707] block mb-2 mg-header-font">
                {t.visionHeader2}
              </span>
              <div className="space-y-3 pt-2 text-xs sm:text-sm text-[#2b231d]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#5c0707] shrink-0 mt-0.5" />
                  <span>{t.tenet1}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#5c0707] shrink-0 mt-0.5" />
                  <span>{t.tenet2}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#5c0707] shrink-0 mt-0.5" />
                  <span>{t.tenet3}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Collaboration & Forum MG2SO4 */}
      <section id="contact" className="px-4 sm:px-6 pt-12 sm:pt-14 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="bg-[#efe7ce] border-2 border-[#5c0707] p-6 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#5c0707] uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" />
                {t.contactTag}
              </span>
              <h3 className="text-2xl font-bold text-[#1e1815] mb-2 mg-header-font">
                {t.contactTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#2b231d] leading-relaxed">
                {t.contactDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${profile?.contact?.email || "hello@igasud.tech"}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mg-btn-primary text-xs font-bold uppercase tracking-wider"
              >
                <Mail className="h-3.5 w-3.5" />
                {profile?.contact?.email || "hello@igasud.tech"}
              </a>
              <a
                href={forumUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mg-btn-outline text-xs font-bold uppercase tracking-wider"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#5c0707]" />
                Forum MG2SO4
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={profile?.contact?.github || "https://github.com/dessulfate"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 mg-btn-outline text-xs font-bold uppercase tracking-wider"
              >
                <Github className="h-3.5 w-3.5 text-[#5c0707]" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
