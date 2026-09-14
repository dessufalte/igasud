"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

interface ShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GROUPS: { group: string; items: { keys: string[]; label: string }[] }[] = [
  {
    group: "Navigation",
    items: [
      { keys: ["⌘", "K"], label: "Open command palette" },
      { keys: ["/"], label: "Open command palette (alt)" },
      { keys: ["?"], label: "Toggle this help" },
      { keys: ["Esc"], label: "Close dialog / drawer" },
    ],
  },
  {
    group: "Command palette",
    items: [
      { keys: ["↑", "↓"], label: "Move selection" },
      { keys: ["↵"], label: "Select item" },
    ],
  },
  {
    group: "Documentation drawer",
    items: [
      { keys: ["Scroll"], label: "Reading progress + active heading" },
      { keys: ["Click"], label: "Copy code / share link buttons" },
    ],
  },
]

export function ShortcutsHelp({ open, onOpenChange }: ShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cmdk-overlay overflow-hidden p-0 max-w-lg gap-0 glass-strong border border-foreground/10 rounded-2xl">
        <DialogTitle className="sr-only">Keyboard shortcuts</DialogTitle>
        <DialogDescription className="sr-only">
          List of keyboard shortcuts available on this site.
        </DialogDescription>
        <div className="px-5 py-4 border-b border-foreground/8 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5">
            <Keyboard className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Keyboard shortcuts</p>
            <p className="text-[11px] text-muted-foreground">
              Press <kbd>?</kbd> anywhere to toggle this panel.
            </p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-5 max-h-[60vh] overflow-y-auto thin-scroll">
          {GROUPS.map((g) => (
            <div key={g.group}>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">
                {g.group}
              </p>
              <ul className="flex flex-col gap-1.5">
                {g.items.map((it) => (
                  <li
                    key={it.label}
                    className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-foreground/4 transition-colors"
                  >
                    <span className="text-sm text-foreground">{it.label}</span>
                    <span className="flex items-center gap-1">
                      {it.keys.map((k, i) => (
                        <kbd key={i}>{k}</kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
