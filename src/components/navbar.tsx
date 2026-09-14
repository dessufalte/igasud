"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Github, Menu, X, Command, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Work", href: "#work", id: "work" },
  { label: "About", href: "#about", id: "about" },
  { label: "Skills", href: "#skills", id: "skills" },
  { label: "Writing", href: "#writing", id: "writing" },
  { label: "Contact", href: "#contact", id: "contact" },
]

export function Navbar({
  onOpenCommand,
  activeSection,
  onOpenHelp,
}: {
  onOpenCommand: () => void
  activeSection: string
  onOpenHelp: () => void
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4">
      <nav
        className={cn(
          "mx-auto max-w-6xl rounded-2xl transition-all duration-500",
          "glass glass-sheen",
          scrolled ? "py-2 shadow-lg" : "py-2.5"
        )}
      >
        <div className="flex items-center justify-between px-3 sm:px-4">
          {/* Logo */}
          <Link
            href="#top"
            className="group flex items-center gap-2.5"
            aria-label="Go to top"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-xl text-white text-sm font-bold shadow-md transition-transform group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.6 0.2 200))",
              }}
            >
              S
            </span>
            <span className="hidden sm:block text-sm font-semibold tracking-tight">
              Studio
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-active={activeSection === l.id}
                className={cn(
                  "nav-link-spy px-3.5 py-1.5 rounded-full text-sm transition-colors",
                  activeSection === l.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Command palette trigger */}
            <button
              onClick={onOpenCommand}
              className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2 rounded-full text-xs text-muted-foreground hover:text-foreground bg-foreground/4 hover:bg-foreground/8 border border-foreground/8 transition-colors"
              aria-label="Open command palette"
            >
              <Search />
              <span className="hidden lg:inline">Search</span>
              <kbd className="ml-1">⌘K</kbd>
            </button>
            {/* Shortcuts help trigger */}
            <button
              onClick={onOpenHelp}
              className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenCommand}
              className="sm:hidden grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Open command palette"
            >
              <Command className="h-4 w-4" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden px-3 pb-3 pt-1 animate-fade-up">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

function Search() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
