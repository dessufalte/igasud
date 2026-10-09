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
            className="flex items-center gap-2.5"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-xl text-white text-sm font-bold shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.6 0.2 200))",
              }}
            >
              {(data?.profile?.name || "P")[0]}
            </span>
            <span className="hidden sm:block text-sm font-semibold tracking-tight">
              {data?.profile?.name || "Portfolio"}
            </span>
          </button>

          {/* Menu */}
          <div className="flex items-center gap-1">
            <MenuButton
              active={view === "home"}
              onClick={() => setView("home")}
              icon={HomeIcon}
              label="Home"
            />
            <MenuButton
              active={view === "portfolio"}
              onClick={() => setView("portfolio")}
              icon={FolderGit2}
              label="Portfolio"
            />
            <MenuButton
              active={view === "home"}
              onClick={() => {
                setView("home")
                setTimeout(() => {
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }, 100)
              }}
              icon={Info}
              label="About"
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
          <HomeView data={data} onPortfolio={() => setView("portfolio")} />
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="mt-auto px-4 sm:px-6 pb-4 pt-2">
        <div className="mx-auto max-w-6xl rounded-2xl glass glass-sheen px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {data?.profile?.name || "Portfolio"}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {data?.profile?.university || ""}
          </span>
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

/* ---------- Home view (hero + photo gallery + about) ---------- */
function HomeView({
  data,
  onPortfolio,
}: {
  data: PortfolioData
  onPortfolio: () => void
}) {
  const { profile } = data
  return (
    <div className="flex-1 overflow-y-auto thin-scroll pb-6">
      {/* Hero section */}
      <section className="px-4 sm:px-6 pt-2">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl glass glass-sheen p-7 sm:p-10 lg:p-14"
          >
            {/* Decorative glow */}
            <div
              className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.6 0.25 290 / 0.4), transparent 70%)",
              }}
            />

            <div className="relative flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8 text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Portfolio Submission
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                {profile.name}
              </h1>

              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                {profile.role} · {profile.university}
              </p>

              {/* Contact info */}
              <div className="flex flex-wrap gap-3">
                {profile.contact.phone && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8">
                    <Phone className="h-3 w-3" />
                    {profile.contact.phone}
                  </span>
                )}
                {profile.contact.email && (
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/8 transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    {profile.contact.email}
                  </a>
                )}
                {profile.contact.linkedin && (
                  <a
                    href={profile.contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/8 transition-colors"
                  >
                    <Linkedin className="h-3 w-3" />
                    LinkedIn
                  </a>
                )}
                {profile.contact.github && (
                  <a
                    href={profile.contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-foreground/5 border border-foreground/8 hover:bg-foreground/8 transition-colors"
                  >
                    <Github className="h-3 w-3" />
                    GitHub
                  </a>
                )}
              </div>

              {/* CTA to portfolio */}
              <button
                onClick={onPortfolio}
                className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-lg shadow-foreground/10 transition-transform hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                }}
              >
                View Portfolio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Photo gallery */}
      {profile.photos && profile.photos.length > 0 && (
        <section className="px-4 sm:px-6 pt-8 sm:pt-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70">
                Gallery
              </span>
              <span className="h-px flex-1 bg-foreground/8" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {profile.photos.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative aspect-square rounded-2xl overflow-hidden glass glass-sheen group"
                >
                  <Image
                    src={photo}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About section (only on home page) */}
      <section id="about" className="px-4 sm:px-6 pt-8 sm:pt-10 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl glass glass-sheen p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70">
                About
              </span>
              <span className="h-px flex-1 bg-foreground/8" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {profile.about}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
