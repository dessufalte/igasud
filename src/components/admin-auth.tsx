"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Lock, ArrowRight, X } from "lucide-react"
import { toast } from "sonner"

interface AdminAuthProps {
  open: boolean
  onSuccess: () => void
  onClose: () => void
}

// Simple demo password — in production this would be a server-side check
const ADMIN_PASSWORD = "studio2024"

export function AdminAuth({ open, onSuccess, onClose }: AdminAuthProps) {
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setPassword("")
      setError(false)
    }
  }, [open])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onSuccess()
      setPassword("")
      setError(false)
    } else {
      setError(true)
      toast.error("Incorrect password")
      setPassword("")
      inputRef.current?.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="cmdk-overlay overflow-hidden p-0 max-w-sm gap-0 glass-strong border border-foreground/10 rounded-2xl">
        <DialogTitle className="sr-only">Admin authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Enter password to access the admin inbox.
        </DialogDescription>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground/5">
                <Lock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Admin access</p>
                <p className="text-[11px] text-muted-foreground">
                  Enter password to view inbox
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-7 w-7 place-items-center rounded-lg hover:bg-foreground/5 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder="Password"
              aria-label="Admin password"
              className={`w-full h-11 px-4 rounded-xl bg-foreground/4 border text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-destructive/40 focus:ring-destructive/30"
                  : "border-foreground/8 focus:ring-foreground/15"
              }`}
            />
            {error && (
              <p className="text-xs text-destructive">
                Incorrect password. Try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-medium text-white shadow-lg shadow-foreground/10 transition-transform hover:scale-[1.01]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.22 280), oklch(0.55 0.2 200))",
              }}
            >
              Unlock
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
            Demo password: <code className="font-mono">studio2024</code>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
