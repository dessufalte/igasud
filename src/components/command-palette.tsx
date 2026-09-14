"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Search,
  FolderGit2,
  Hash,
  ArrowUp,
  Mail,
  Github,
  Sparkles,
  Layers,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { ProjectSummary } from "@/lib/types"

type CommandItem = {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  group: "Navigate" | "Projects" | "Actions"
  onSelect: () => void
  accent?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: ProjectSummary[]
  onOpenProject: (slug: string) => void
}

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon; hint: string }[] =
  [
    { label: "Top", href: "#top", icon: ArrowUp, hint: "Home" },
    { label: "Work", href: "#work", icon: FolderGit2, hint: "Projects" },
    { label: "About", href: "#about", icon: Sparkles, hint: "Bio" },
    { label: "Skills", href: "#skills", icon: Layers, hint: "Toolkit" },
    { label: "Contact", href: "#contact", icon: Mail, hint: "Get in touch" },
  ]

export function CommandPalette({
  open,
  onOpenChange,
  projects,
  onOpenProject,
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState("")

  // Reset search when palette closes
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSearch(""), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  const run = React.useCallback(
    (fn: () => void) => {
      onOpenChange(false)
      setTimeout(fn, 60)
    },
    [onOpenChange]
  )

  const items: CommandItem[] = React.useMemo(() => {
    const nav: CommandItem[] = NAV_ITEMS.map((n) => ({
      id: `nav-${n.href}`,
      label: n.label,
      hint: n.hint,
      icon: n.icon,
      group: "Navigate",
      onSelect: () =>
        run(() => {
          document
            .querySelector(n.href)
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }),
    }))

    const proj: CommandItem[] = projects.map((p) => ({
      id: `proj-${p.slug}`,
      label: p.title,
      hint: p.category,
      icon: Hash,
      group: "Projects",
      accent: p.accent,
      onSelect: () => run(() => onOpenProject(p.slug)),
    }))

    const actions: CommandItem[] = [
      {
        id: "act-email",
        label: "Copy email address",
        hint: "hello@studio.dev",
        icon: Mail,
        group: "Actions",
        onSelect: () =>
          run(() => {
            navigator.clipboard?.writeText("hello@studio.dev")
          }),
      },
      {
        id: "act-github",
        label: "Open GitHub",
        hint: "External",
        icon: Github,
        group: "Actions",
        onSelect: () =>
          run(() => window.open("https://github.com", "_blank", "noreferrer")),
      },
      {
        id: "act-top",
        label: "Scroll to top",
        hint: "Home",
        icon: ArrowUp,
        group: "Actions",
        onSelect: () => run(() => window.scrollTo({ top: 0, behavior: "smooth" })),
      },
    ]

    const q = search.trim().toLowerCase()
    const all = [...nav, ...proj, ...actions]
    if (!q) return all
    return all.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.hint?.toLowerCase().includes(q) ?? false) ||
        it.group.toLowerCase().includes(q)
    )
  }, [projects, search, onOpenProject, run])

  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const it of items) {
      if (!map.has(it.group)) map.set(it.group, [])
      map.get(it.group)!.push(it)
    }
    const order = ["Navigate", "Projects", "Actions"]
    return order
      .map((g) => ({ group: g, items: map.get(g) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [items])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cmdk-overlay overflow-hidden p-0 max-w-xl gap-0 glass-strong border border-foreground/10 rounded-2xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search projects and navigate the site.
        </DialogDescription>
        <CommandPrimitive
          label="Command Palette"
          className="flex flex-col"
          shouldFilter={false}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-foreground/8">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              autoFocus
              placeholder="Search projects, jump to section…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <kbd className="text-muted-foreground/70">Esc</kbd>
          </div>

          {/* Results */}
          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto thin-scroll py-2">
            <CommandPrimitive.Empty>
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No results for “{search}”.
              </div>
            </CommandPrimitive.Empty>

            {grouped.map(({ group, items }) => (
              <CommandPrimitive.Group
                key={group}
                heading={group}
                className="text-foreground"
              >
                <div className="px-2 pb-1 pt-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60">
                  {group}
                </div>
                {items.map((it) => (
                  <CommandPrimitive.Item
                    key={it.id}
                    value={it.id}
                    onSelect={() => it.onSelect()}
                    className="cmdk-item flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg cursor-pointer text-sm outline-none data-[selected=true]:bg-foreground/8 transition-colors"
                  >
                    <span
                      className="grid h-7 w-7 place-items-center rounded-md shrink-0"
                      style={
                        it.accent
                          ? {
                              background: `${it.accent}22`,
                              color: it.accent,
                            }
                          : undefined
                      }
                    >
                      <it.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 truncate font-medium">
                      {it.label}
                    </span>
                    {it.hint && (
                      <span className="text-xs text-muted-foreground">
                        {it.hint}
                      </span>
                    )}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-foreground/8 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd>↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <Wrench className="h-3 w-3" />
              Studio Command
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
