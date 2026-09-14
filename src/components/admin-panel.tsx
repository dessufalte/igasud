"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Mail,
  Trash2,
  Check,
  CheckCheck,
  Inbox,
  RefreshCw,
  X,
  Calendar,
  Search as SearchIcon,
  Download,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  name: string
  email: string
  body: string
  read: boolean
  createdAt: string
}

interface AdminPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FilterMode = "all" | "unread"

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<FilterMode>("all")
  const [checked, setChecked] = React.useState<Set<string>>(new Set())

  const loadMessages = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load")
      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      loadMessages()
      // Reset selection state on open
      setChecked(new Set())
    }
  }, [open, loadMessages])

  // Filtered + searched messages
  const visibleMessages = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (filter === "unread" && m.read) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      )
    })
  }, [messages, search, filter])

  const unreadCount = messages.filter((m) => !m.read).length

  const markRead = async (id: string) => {
    setSelected(id)
    if (!messages.find((m) => m.id === id)?.read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      )
      try {
        await fetch(`/api/admin/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      } catch {
        /* non-critical */
      }
    }
  }

  const deleteMessage = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
    setChecked((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    if (selected === id) setSelected(null)
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
      toast.success("Message deleted")
    } catch {
      toast.error("Delete failed")
      loadMessages()
    }
  }

  // Keyboard shortcuts: j/k navigate, e mark read, # delete
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable
      )
        return
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        const idx = visibleMessages.findIndex((m) => m.id === selected)
        const next = visibleMessages[Math.min(idx + 1, visibleMessages.length - 1)]
        if (next) markRead(next.id)
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        const idx = visibleMessages.findIndex((m) => m.id === selected)
        const prev = visibleMessages[Math.max(idx - 1, 0)]
        if (prev) markRead(prev.id)
      } else if (e.key === "e" && selected) {
        e.preventDefault()
        markRead(selected)
      } else if (e.key === "#" && selected) {
        e.preventDefault()
        deleteMessage(selected)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, visibleMessages, selected])

  // Bulk: mark all selected as read
  const bulkMarkRead = async () => {
    const ids = Array.from(checked)
    if (ids.length === 0) return
    setMessages((prev) =>
      prev.map((m) => (checked.has(m.id) ? { ...m, read: true } : m))
    )
    setChecked(new Set())
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      toast.success(`Marked ${ids.length} as read`)
    } catch {
      toast.error("Bulk update failed")
      loadMessages()
    }
  }

  // Bulk: delete all selected
  const bulkDelete = async () => {
    const ids = Array.from(checked)
    if (ids.length === 0) return
    setMessages((prev) => prev.filter((m) => !checked.has(m.id)))
    if (selected && checked.has(selected)) setSelected(null)
    setChecked(new Set())
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
        )
      )
      toast.success(`Deleted ${ids.length} messages`)
    } catch {
      toast.error("Bulk delete failed")
      loadMessages()
    }
  }

  // Mark all as read
  const markAllRead = async () => {
    const unreadIds = messages.filter((m) => !m.read).map((m) => m.id)
    if (unreadIds.length === 0) return
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    try {
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/admin/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      toast.success(`Marked ${unreadIds.length} as read`)
    } catch {
      toast.error("Update failed")
      loadMessages()
    }
  }

  // Export as CSV
  const exportCSV = () => {
    if (messages.length === 0) {
      toast.error("No messages to export")
      return
    }
    const headers = ["Name", "Email", "Message", "Read", "Created At"]
    const rows = messages.map((m) => [
      escapeCSV(m.name),
      escapeCSV(m.email),
      escapeCSV(m.body),
      m.read ? "read" : "unread",
      new Date(m.createdAt).toISOString(),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${messages.length} messages`)
  }

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCheckAll = () => {
    if (checked.size === visibleMessages.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(visibleMessages.map((m) => m.id)))
    }
  }

  const selectedMsg = messages.find((m) => m.id === selected)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cmdk-overlay overflow-hidden p-0 max-w-3xl gap-0 glass-strong border border-foreground/10 rounded-2xl flex flex-col max-h-[85vh]">
        <DialogTitle className="sr-only">Admin — contact messages</DialogTitle>
        <DialogDescription className="sr-only">
          Manage contact form submissions.
        </DialogDescription>

        {/* Header */}
        <div className="px-5 py-4 border-b border-foreground/8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/5">
              <Inbox className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Inbox</p>
              <p className="text-[11px] text-muted-foreground">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
                {!loading && unreadCount > 0 && ` · ${unreadCount} unread`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={exportCSV}
              aria-label="Export CSV"
              title="Export as CSV"
              className="admin-action-btn"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={markAllRead}
              aria-label="Mark all as read"
              title="Mark all as read"
              className="admin-action-btn"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3" />
              <span className="hidden sm:inline">Read all</span>
            </button>
            <button
              onClick={loadMessages}
              aria-label="Refresh"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", loading && "animate-spin")}
              />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="px-5 py-3 border-b border-foreground/8 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, or content…"
              aria-label="Search messages"
              className="w-full h-8 pl-8 pr-8 rounded-lg bg-foreground/4 border border-foreground/8 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground/15 focus:bg-foreground/6 transition-all"
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
          <div className="flex items-center gap-1" role="group" aria-label="Filter">
            <button
              onClick={() => setFilter("all")}
              data-active={filter === "all"}
              className="filter-chip"
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              data-active={filter === "unread"}
              className="filter-chip"
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-0.5 px-1 rounded-full bg-foreground/10 text-[9px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bulk action bar (when items checked) */}
        {checked.size > 0 && (
          <div className="bulk-bar px-5 py-2 border-b border-foreground/8 flex items-center justify-between gap-2 shrink-0 bg-foreground/4">
            <span className="text-xs font-medium text-foreground">
              {checked.size} selected
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={bulkMarkRead}
                className="admin-action-btn"
              >
                <CheckCheck className="h-3 w-3" />
                Mark read
              </button>
              <button
                onClick={bulkDelete}
                className="admin-action-btn danger"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
              <button
                onClick={() => setChecked(new Set())}
                aria-label="Clear selection"
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-foreground/10 text-muted-foreground"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Body: split list + detail */}
        <div className="flex-1 min-h-0 flex">
          {/* List */}
          <div className="w-2/5 min-w-0 border-r border-foreground/8 overflow-y-auto thin-scroll">
            {/* Select all checkbox (when messages exist) */}
            {!loading && visibleMessages.length > 0 && (
              <div className="px-3 py-2 border-b border-foreground/5 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={
                    checked.size === visibleMessages.length &&
                    visibleMessages.length > 0
                  }
                  onChange={toggleCheckAll}
                  aria-label="Select all"
                />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                  {visibleMessages.length} shown
                </span>
              </div>
            )}
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-30" />
                {search || filter === "unread"
                  ? "No messages match."
                  : "No messages yet."}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {visibleMessages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "admin-row flex items-start gap-2 p-2 rounded-lg transition-colors",
                      m.read && "read",
                      selected === m.id && "bg-foreground/8"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="admin-checkbox mt-0.5"
                      checked={checked.has(m.id)}
                      onChange={() => toggleCheck(m.id)}
                      aria-label={`Select ${m.name}`}
                    />
                    <button
                      onClick={() => markRead(m.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-sm truncate",
                            m.read
                              ? "text-muted-foreground font-normal"
                              : "text-foreground font-semibold"
                          )}
                        >
                          {m.name}
                        </span>
                        {!m.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {m.email}
                      </p>
                      <p className="text-xs text-muted-foreground/70 truncate mt-1">
                        {m.body.slice(0, 60)}
                        {m.body.length > 60 ? "…" : ""}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="flex-1 min-w-0 overflow-y-auto thin-scroll p-5">
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {selectedMsg.name}
                    </h3>
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                    >
                      <Mail className="h-3 w-3" />
                      {selectedMsg.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => deleteMessage(selectedMsg.id)}
                      aria-label="Delete message"
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedMsg.createdAt).toLocaleString()}
                </div>
                <div className="rounded-xl bg-foreground/4 border border-foreground/8 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedMsg.body}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: your message&body=Hi ${selectedMsg.name},`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
                    }}
                  >
                    <Mail className="h-3 w-3" />
                    Reply
                  </a>
                  {!selectedMsg.read && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      Marked as read
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Select a message to read
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function escapeCSV(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
