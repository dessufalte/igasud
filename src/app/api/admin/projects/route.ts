import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { syncPostgresToJson } from "@/app/api/data/route"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      slug,
      originalSlug,
      title,
      titleId,
      tagline,
      taglineId,
      description,
      descriptionId,
      category,
      year,
      role,
      status,
      featured,
      image,
      accent,
      tech,
      links,
      docs,
    } = body

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      )
    }

    const cleanSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, "-")

    const targetLookupSlug = originalSlug || cleanSlug
    const existing = await db.project.findUnique({
      where: { slug: targetLookupSlug },
    })

    const techStackStr = JSON.stringify(
      Array.isArray(tech)
        ? tech
        : String(tech || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
    )

    const linksStr = JSON.stringify(
      links || { repo: "https://github.com/dessulfate", demo: "https://igasud.tech" }
    )

    const docsArray = Array.isArray(docs) && docs.length > 0
      ? docs
      : [
          {
            section: "Overview",
            icon: "FileText",
            content: `# ${title}\n\n${description || tagline || ""}`,
          },
        ]

    if (existing) {
      await db.doc.deleteMany({ where: { projectId: existing.id } })
      const updated = await db.project.update({
        where: { id: existing.id },
        data: {
          slug: cleanSlug,
          title,
          titleId: titleId || title,
          tagline: tagline || "",
          taglineId: taglineId || tagline || "",
          description: description || "",
          descriptionId: descriptionId || description || "",
          category: category || "Simulation Engine",
          year: String(year || "2026"),
          role: role || "Core Systems & Architecture",
          status: status || "shipped",
          featured: Boolean(featured ?? true),
          thumbnail: image || existing.thumbnail || "/projects/aurora-design-system.png",
          accent: accent || "#5c0707",
          techStack: techStackStr,
          links: linksStr,
          docs: {
            create: docsArray.map((d: { section?: string; icon?: string; content?: string }, idx: number) => ({
              section: d.section || `Section ${idx + 1}`,
              icon: d.icon || "FileText",
              order: idx,
              content: d.content || "",
            })),
          },
        },
        include: { docs: true },
      })

      await syncPostgresToJson()
      return NextResponse.json({ ok: true, project: updated })
    } else {
      const count = await db.project.count()
      const created = await db.project.create({
        data: {
          numId: count + 1,
          slug: cleanSlug,
          title,
          titleId: titleId || title,
          tagline: tagline || "",
          taglineId: taglineId || tagline || "",
          description: description || "",
          descriptionId: descriptionId || description || "",
          category: category || "Simulation Engine",
          year: String(year || "2026"),
          role: role || "Core Systems & Architecture",
          status: status || "shipped",
          featured: Boolean(featured ?? true),
          thumbnail: image || "/projects/aurora-design-system.png",
          accent: accent || "#5c0707",
          techStack: techStackStr,
          links: linksStr,
          sortOrder: count,
          docs: {
            create: docsArray.map((d: { section?: string; icon?: string; content?: string }, idx: number) => ({
              section: d.section || `Section ${idx + 1}`,
              icon: d.icon || "FileText",
              order: idx,
              content: d.content || "",
            })),
          },
        },
        include: { docs: true },
      })

      await syncPostgresToJson()
      return NextResponse.json({ ok: true, project: created })
    }
  } catch (error) {
    console.error("[POST /api/admin/projects]", error)
    return NextResponse.json(
      { error: "Failed to save project to PostgreSQL" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 })
    }

    await db.project.delete({ where: { slug } })
    await syncPostgresToJson()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[DELETE /api/admin/projects]", error)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}
