"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  Trash2,
  Check,
  Inbox,
  RefreshCw,
  X,
  Calendar,
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

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selected, setSelected] = React.useState<string | null>(null)

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
    }
  }, [open, loadMessages])

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
    if (selected === id) setSelected(null)
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" })
      toast.success("Message deleted")
    } catch {
      toast.error("Delete failed")
      loadMessages() // rollback
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
                {!loading && ` · ${messages.filter((m) => !m.read).length} unread`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadMessages}
              aria-label="Refresh"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
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

        {/* Body: split list + detail */}
        <div className="flex-1 min-h-0 flex">
          {/* List */}
          <div className="w-2/5 min-w-0 border-r border-foreground/8 overflow-y-auto thin-scroll">
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <Inbox className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No messages yet.
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => markRead(m.id)}
                    className={cn(
                      "admin-row w-full text-left p-2.5 rounded-lg transition-colors",
                      m.read && "read",
                      selected === m.id && "bg-foreground/8"
                    )}
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
