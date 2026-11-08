"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Lock,
  Plus,
  Trash2,
  Save,
  Database,
  FolderGit2,
  Sliders,
  X,
  CheckCircle2,
  FileText,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { PortfolioData, Project, ProjectDoc } from "@/lib/portfolio-types"

interface CodexAdminModalProps {
  open: boolean
  onClose: () => void
  data: PortfolioData | null
  onRefreshData: () => Promise<void>
}

const VALID_PASSCODES = ["igasud2026", "studio2024"]

export function CodexAdminModal({
  open,
  onClose,
  data,
  onRefreshData,
}: CodexAdminModalProps) {
  const [unlocked, setUnlocked] = React.useState(false)
  const [passcode, setPasscode] = React.useState("")
  const [tab, setTab] = React.useState<"projects" | "appearance">("projects")
  const [saving, setSaving] = React.useState(false)

  // Project Editor State
  const [selectedSlug, setSelectedSlug] = React.useState<string | "__new__">("__new__")
  const [title, setTitle] = React.useState("")
  const [titleId, setTitleId] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [category, setCategory] = React.useState("Massive Simulation Engine")
  const [year, setYear] = React.useState("2026")
  const [role, setRole] = React.useState("Core Systems & Engine Architecture")
  const [status, setStatus] = React.useState("shipped")
  const [tagline, setTagline] = React.useState("")
  const [taglineId, setTaglineId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [descriptionId, setDescriptionId] = React.useState("")
  const [techStr, setTechStr] = React.useState("C++20, Data-Oriented Design, Zero-GC")
  const [repoUrl, setRepoUrl] = React.useState("https://github.com/dessulfate")
  const [demoUrl, setDemoUrl] = React.useState("")
  const [image, setImage] = React.useState("/projects/aurora-design-system.png")
  const [docs, setDocs] = React.useState<ProjectDoc[]>([
    { section: "Overview", icon: "Sparkles", content: "# Project Overview\n\nConcise technical summary." },
  ])

  // Appearance / Profile State
  const [profName, setProfName] = React.useState("")
  const [profRole, setProfRole] = React.useState("")
  const [profRoleId, setProfRoleId] = React.useState("")
  const [profStatus, setProfStatus] = React.useState("")
  const [profStatusId, setProfStatusId] = React.useState("")
  const [profUniv, setProfUniv] = React.useState("")
  const [profAbout, setProfAbout] = React.useState("")
  const [profAboutId, setProfAboutId] = React.useState("")
  const [profEmail, setProfEmail] = React.useState("")
  const [profGithub, setProfGithub] = React.useState("")
  const [profForum, setProfForum] = React.useState("")

  // Populate profile fields when data changes
  React.useEffect(() => {
    if (!data?.profile) return
    const p = data.profile
    setProfName(p.name || "Igasud Studio")
    setProfRole(p.role || "")
    setProfRoleId(p.roleId || p.role || "")
    setProfStatus(p.statusText || "Engine Core v2.0 · Zero-GC Deterministic Runtime Active")
    setProfStatusId(p.statusTextId || "Engine Core v2.0 · Runtime Deterministik Zero-GC Aktif")
    setProfUniv(p.university || "Nubian · Thema · Aetheris Framework")
    setProfAbout(p.about || "")
    setProfAboutId(p.aboutId || p.about || "")
    setProfEmail(p.contact?.email || "hello@igasud.tech")
    setProfGithub(p.contact?.github || "https://github.com/dessulfate")
    setProfForum(p.contact?.forumUrl || "https://forum.igasud.tech")
  }, [data])

  const loadProjectIntoForm = React.useCallback((proj: Project | null) => {
    if (!proj) {
      setSelectedSlug("__new__")
      setTitle("")
      setTitleId("")
      setSlug("")
      setCategory("Massive Simulation Engine")
      setYear("2026")
      setRole("Core Systems & Engine Architecture")
      setStatus("in-progress")
      setTagline("")
      setTaglineId("")
      setDescription("")
      setDescriptionId("")
      setTechStr("C++20, Data-Oriented Design, WebGPU")
      setRepoUrl("https://github.com/dessulfate")
      setDemoUrl("https://igasud.tech")
      setImage("/projects/aurora-design-system.png")
      setDocs([
        {
          section: "Overview",
          icon: "Sparkles",
          content: "# Technical Overview\n\nDocument the core architecture and benchmarks here.",
        },
      ])
      return
    }

    setSelectedSlug(proj.slug)
    setTitle(proj.title)
    setTitleId(proj.titleId || proj.title)
    setSlug(proj.slug)
    setCategory(proj.category || "Simulation Engine")
    setYear(String(proj.year || "2026"))
    setRole(proj.role || "Core Systems Architecture")
    setStatus(proj.status || "shipped")
    setTagline(proj.tagline || "")
    setTaglineId(proj.taglineId || proj.tagline || "")
    setDescription(proj.description || "")
    setDescriptionId(proj.descriptionId || proj.description || "")
    setTechStr((proj.tech || []).join(", "))
    setRepoUrl(proj.links?.repo || "https://github.com/dessulfate")
    setDemoUrl(proj.links?.demo || "https://igasud.tech")
    setImage(proj.image || "/projects/aurora-design-system.png")
    setDocs(
      proj.docs && proj.docs.length > 0
        ? proj.docs.map((d) => ({ ...d }))
        : [{ section: "Overview", icon: "FileText", content: `# ${proj.title}\n\n${proj.description}` }]
    )
  }, [])

  // Select first project by default when opened
  React.useEffect(() => {
    if (open && data?.projects && data.projects.length > 0 && selectedSlug === "__new__" && !title) {
      loadProjectIntoForm(data.projects[0])
    }
  }, [open, data, selectedSlug, title, loadProjectIntoForm])

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (VALID_PASSCODES.includes(passcode.trim())) {
      setUnlocked(true)
      setPasscode("")
      toast.success("Codex Admin unlocked (PostgreSQL Connected)")
    } else {
      toast.error("Invalid passcode")
    }
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) {
      toast.error("Project Title and Slug are required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalSlug: selectedSlug === "__new__" ? undefined : selectedSlug,
          slug: slug.trim(),
          title: title.trim(),
          titleId: titleId.trim() || title.trim(),
          tagline: tagline.trim(),
          taglineId: taglineId.trim() || tagline.trim(),
          description: description.trim(),
          descriptionId: descriptionId.trim() || description.trim(),
          category: category.trim(),
          year: year.trim(),
          role: role.trim(),
          status,
          featured: true,
          image,
          accent: "#5c0707",
          tech: techStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          links: { repo: repoUrl.trim(), demo: demoUrl.trim() },
          docs,
        }),
      })

      if (!res.ok) throw new Error("Failed to save project")
      await onRefreshData()
      setSelectedSlug(slug.trim())
      toast.success("Project saved to PostgreSQL & synced")
    } catch {
      toast.error("Error saving project to PostgreSQL")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (selectedSlug === "__new__") return
    if (!window.confirm(`Delete project "${title}" from PostgreSQL?`)) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/projects?slug=${encodeURIComponent(selectedSlug)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
      await onRefreshData()
      loadProjectIntoForm(null)
      toast.success("Project removed from PostgreSQL")
    } catch {
      toast.error("Failed to delete project")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profName,
          role: profRole,
          roleId: profRoleId,
          university: profUniv,
          statusText: profStatus,
          statusTextId: profStatusId,
          about: profAbout,
          aboutId: profAboutId,
          email: profEmail,
          github: profGithub,
          forumUrl: profForum,
        }),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      await onRefreshData()
      toast.success("Studio appearance & profile updated in PostgreSQL")
    } catch {
      toast.error("Failed to save studio profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden border-2 border-[#5c0707] bg-[#f4eedb] text-[#1e1815]"
        style={{ borderRadius: "2px" }}
      >
        <DialogTitle className="sr-only">Igasud Studio Hidden Codex Admin</DialogTitle>
        <DialogDescription className="sr-only">
          Internal PostgreSQL documentation and site appearance console.
        </DialogDescription>

        {/* Top Bar */}
        <div className="bg-[#5c0707] text-[#f4eedb] px-5 py-3 flex items-center justify-between border-b border-[#400404]">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-[#EF7F1A]" />
            <span className="font-bold tracking-wide text-sm mg-header-font uppercase">
              Igasud Codex · Internal PostgreSQL Console
            </span>
            <span className="text-[11px] bg-[#400404] text-[#df6e5a] px-2 py-0.5 border border-[#801010] font-mono">
              {data?.source === "postgresql" ? "DB: POSTGRESQL LIVE" : "DB: HYBRID SYNC"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#f4eedb]/80 hover:text-white p-1"
            aria-label="Close Admin"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="p-8 max-w-md mx-auto w-full space-y-4">
            <div className="flex items-center gap-3 border-b border-[#bfb69e] pb-3">
              <div className="h-10 w-10 bg-[#efe7ce] border border-[#bfb69e] grid place-items-center text-[#5c0707]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#5c0707]">Restricted Lab Console</h3>
                <p className="text-xs text-[#655f53]">
                  Enter internal studio passcode to manage PostgreSQL project codex.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#422624] mb-1">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                autoFocus
                className="w-full px-3 py-2 bg-[#f9f5e8] border border-[#bfb69e] text-sm font-mono focus:border-[#5c0707] focus:outline-none"
              />
              <p className="text-[11px] text-[#655f53] mt-1.5 font-mono">
                Default key: <span className="text-[#5c0707] font-bold">igasud2026</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 mg-btn-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Authenticate & Open Console
            </button>
          </form>
        ) : (
          <div className="flex flex-col max-h-[82vh]">
            {/* Sub-navigation Tabs */}
            <div className="bg-[#efe7ce] border-b border-[#bfb69e] px-5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab("projects")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                    tab === "projects"
                      ? "bg-[#5c0707] text-[#f4eedb] border-[#400404]"
                      : "bg-[#f4eedb] text-[#422624] border-[#bfb69e] hover:border-[#5c0707]"
                  }`}
                >
                  <FolderGit2 className="h-3.5 w-3.5" />
                  Project Documentation ({data?.projects?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setTab("appearance")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                    tab === "appearance"
                      ? "bg-[#5c0707] text-[#f4eedb] border-[#400404]"
                      : "bg-[#f4eedb] text-[#422624] border-[#bfb69e] hover:border-[#5c0707]"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  Studio Appearance & Identity
                </button>
              </div>

              <button
                type="button"
                onClick={() => onRefreshData()}
                className="inline-flex items-center gap-1 text-xs text-[#5c0707] hover:underline font-mono cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                Sync DB
              </button>
            </div>

            {/* Tab Content */}
            {tab === "projects" ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[460px]">
                {/* Left Sidebar: Project List */}
                <div className="md:col-span-4 border-r border-[#bfb69e] bg-[#efe7ce]/60 p-3 overflow-y-auto space-y-1.5">
                  <button
                    type="button"
                    onClick={() => loadProjectIntoForm(null)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border flex items-center gap-2 cursor-pointer ${
                      selectedSlug === "__new__"
                        ? "bg-[#5c0707] text-[#f4eedb] border-[#400404]"
                        : "bg-[#f9f5e8] text-[#5c0707] border-[#bfb69e] hover:border-[#5c0707]"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Engine / Project
                  </button>

                  <div className="pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#655f53] px-1">
                    PostgreSQL Records
                  </div>

                  {(data?.projects || []).map((proj) => (
                    <button
                      key={proj.slug}
                      type="button"
                      onClick={() => loadProjectIntoForm(proj)}
                      className={`w-full text-left p-2.5 border transition-colors cursor-pointer ${
                        selectedSlug === proj.slug
                          ? "bg-[#f9f5e8] border-[#5c0707] border-l-4"
                          : "bg-[#f4eedb] border-[#bfb69e] hover:bg-[#f9f5e8]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1e1815] line-clamp-1">
                        {proj.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-[#655f53]">
                        <span>{proj.category}</span>
                        <span>{proj.year}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right Form: Concise Project Documentation Editor */}
                <form
                  onSubmit={handleSaveProject}
                  className="md:col-span-8 p-5 overflow-y-auto space-y-4 bg-[#f4eedb]"
                >
                  <div className="flex items-center justify-between border-b border-[#bfb69e] pb-2">
                    <h4 className="font-bold text-sm text-[#5c0707] uppercase tracking-wider">
                      {selectedSlug === "__new__"
                        ? "Create New Project Record"
                        : `Editing: ${selectedSlug}`}
                    </h4>
                    {selectedSlug !== "__new__" && (
                      <button
                        type="button"
                        onClick={handleDeleteProject}
                        disabled={saving}
                        className="inline-flex items-center gap-1 text-xs text-red-800 hover:underline font-bold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Title (English Default) *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value)
                          if (selectedSlug === "__new__") {
                            setSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, "")
                            )
                          }
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                        placeholder="e.g. Nubian Engine: Macro Core"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Title (Bahasa Indonesia)
                      </label>
                      <input
                        type="text"
                        value={titleId}
                        onChange={(e) => setTitleId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                        placeholder="Opsional (otomatis fallback ke EN)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Slug ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-2 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                      >
                        <option value="shipped">Shipped / Active</option>
                        <option value="in-progress">In-Progress R&D</option>
                        <option value="concept">Architecture Spec</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Tech Stack (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={techStr}
                        onChange={(e) => setTechStr(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Concise Tagline (EN)
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Concise Tagline (ID - Optional)
                    </label>
                    <input
                      type="text"
                      value={taglineId}
                      onChange={(e) => setTaglineId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Executive Summary (EN)
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                        Executive Summary (ID)
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionId}
                        onChange={(e) => setDescriptionId(e.target.value)}
                        className="w-full p-2 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                      />
                    </div>
                  </div>

                  {/* Concise Markdown Documentation Sections */}
                  <div className="border-t border-[#bfb69e] pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold uppercase text-[#5c0707] flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Technical Spec Sections (Markdown)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setDocs((prev) => [
                            ...prev,
                            {
                              section: `Spec ${prev.length + 1}`,
                              icon: "Layers",
                              content: "# Section Title\n\nWrite concise documentation here.",
                            },
                          ])
                        }
                        className="px-2 py-1 text-[11px] font-bold bg-[#efe7ce] border border-[#bfb69e] hover:border-[#5c0707] cursor-pointer"
                      >
                        + Add Section
                      </button>
                    </div>

                    <div className="space-y-3">
                      {docs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#efe7ce]/70 border border-[#bfb69e] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={doc.section}
                              onChange={(e) => {
                                const val = e.target.value
                                setDocs((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, section: val } : item
                                  )
                                )
                              }}
                              placeholder="Section Tab Name (e.g. Overview, Benchmarks)"
                              className="px-2 py-1 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-bold flex-1"
                            />
                            {docs.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDocs((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-xs text-red-800 px-2 py-1 hover:underline"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={4}
                            value={doc.content}
                            onChange={(e) => {
                              const val = e.target.value
                              setDocs((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, content: val } : item
                                )
                              )
                            }}
                            className="w-full p-2 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 mg-btn-primary text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      {saving ? "Saving to PostgreSQL..." : "Save Project to PostgreSQL"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Studio Appearance & Identity Form */
              <form
                onSubmit={handleSaveProfile}
                className="p-6 overflow-y-auto space-y-4 bg-[#f4eedb]"
              >
                <div className="flex items-center gap-2 text-xs text-[#5c0707] font-bold uppercase tracking-wider border-b border-[#bfb69e] pb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Global Studio Identity & Masthead Telemetry (PostgreSQL)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Studio Name
                    </label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Engine Suite Subtitle
                    </label>
                    <input
                      type="text"
                      value={profUniv}
                      onChange={(e) => setProfUniv(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Primary Positioning Role (EN)
                    </label>
                    <input
                      type="text"
                      value={profRole}
                      onChange={(e) => setProfRole(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Primary Positioning Role (ID)
                    </label>
                    <input
                      type="text"
                      value={profRoleId}
                      onChange={(e) => setProfRoleId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Live Telemetry Status Banner (EN)
                    </label>
                    <input
                      type="text"
                      value={profStatus}
                      onChange={(e) => setProfStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Live Telemetry Status Banner (ID)
                    </label>
                    <input
                      type="text"
                      value={profStatusId}
                      onChange={(e) => setProfStatusId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Studio Manifesto / About (EN)
                    </label>
                    <textarea
                      rows={3}
                      value={profAbout}
                      onChange={(e) => setProfAbout(e.target.value)}
                      className="w-full p-2.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Studio Manifesto / About (ID)
                    </label>
                    <textarea
                      rows={3}
                      value={profAboutId}
                      onChange={(e) => setProfAboutId(e.target.value)}
                      className="w-full p-2.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={profGithub}
                      onChange={(e) => setProfGithub(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#422624] mb-1">
                      MG2SO4 Forum URL
                    </label>
                    <input
                      type="text"
                      value={profForum}
                      onChange={(e) => setProfForum(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#f9f5e8] border border-[#bfb69e] text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 mg-btn-primary text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Updating PostgreSQL..." : "Update Appearance in PostgreSQL"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
