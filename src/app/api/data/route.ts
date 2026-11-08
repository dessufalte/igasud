import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { db } from "@/lib/db"
import type { Profile, Project } from "@/lib/portfolio-types"

export const dynamic = "force-dynamic"

async function readJsonFiles(): Promise<{ profile: Profile; projects: Project[] }> {
  const dataDir = path.join(process.cwd(), "data")
  const [profileRaw, projectsRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, "profile.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "projects.json"), "utf-8"),
  ])
  return {
    profile: JSON.parse(profileRaw),
    projects: JSON.parse(projectsRaw),
  }
}

export async function syncPostgresToJson() {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const [dbProfile, dbProjects] = await Promise.all([
      db.siteProfile.findUnique({ where: { id: "default" } }),
      db.project.findMany({
        include: { docs: { orderBy: { order: "asc" } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ])

    if (dbProfile) {
      const profileObj: Profile = {
        name: dbProfile.name,
        role: dbProfile.role,
        roleId: dbProfile.roleId,
        university: dbProfile.university,
        statusText: dbProfile.statusText,
        statusTextId: dbProfile.statusTextId,
        contact: {
          phone: dbProfile.phone,
          email: dbProfile.email,
          linkedin: dbProfile.linkedin,
          github: dbProfile.github,
          forumUrl: dbProfile.forumUrl,
        },
        about: dbProfile.about,
        aboutId: dbProfile.aboutId,
        photos: [],
      }
      await fs.writeFile(
        path.join(dataDir, "profile.json"),
        JSON.stringify(profileObj, null, 2),
        "utf-8"
      )
    }

    if (dbProjects.length > 0) {
      const projectsArr: Project[] = dbProjects.map((p, idx) => {
        let parsedTech: string[] = []
        let parsedLinks: { repo?: string; demo?: string } = {}
        try {
          parsedTech = JSON.parse(p.techStack)
        } catch {
          parsedTech = []
        }
        try {
          parsedLinks = p.links ? JSON.parse(p.links) : {}
        } catch {
          parsedLinks = {}
        }
        return {
          id: p.numId || idx + 1,
          slug: p.slug,
          title: p.title,
          titleId: p.titleId || p.title,
          tagline: p.tagline,
          taglineId: p.taglineId || p.tagline,
          description: p.description,
          descriptionId: p.descriptionId || p.description,
          year: p.year,
          role: p.role,
          link: parsedLinks.demo || "https://igasud.tech",
          image: p.thumbnail || "/projects/aurora-design-system.png",
          accent: p.accent,
          category: p.category,
          status: p.status,
          featured: p.featured,
          tech: parsedTech,
          links: parsedLinks,
          docs: p.docs.map((d) => ({
            section: d.section,
            icon: d.icon,
            content: d.content,
          })),
        }
      })
      await fs.writeFile(
        path.join(dataDir, "projects.json"),
        JSON.stringify(projectsArr, null, 2),
        "utf-8"
      )
    }
  } catch (err) {
    console.warn("[syncPostgresToJson] Non-fatal sync warning:", err)
  }
}

export async function GET() {
  try {
    const jsonFallback = await readJsonFiles()

    try {
      // Check if PostgreSQL has data; if empty, auto-seed from master JSON
      let dbProfile = await db.siteProfile.findUnique({ where: { id: "default" } })
      if (!dbProfile) {
        const pf = jsonFallback.profile
        dbProfile = await db.siteProfile.create({
          data: {
            id: "default",
            name: pf.name || "Igasud Studio",
            role: pf.role || "Deterministic AI Simulation & High-Throughput Game Engine Lab",
            roleId: pf.roleId || "Laboratorium Simulasi AI Deterministik & Engine Game Throughput Tinggi",
            university: pf.university || "Nubian · Thema · Aetheris Framework",
            statusText: pf.statusText || "Engine Core v2.0 · Zero-GC Deterministic Runtime Active",
            statusTextId: pf.statusTextId || "Engine Core v2.0 · Runtime Deterministik Zero-GC Aktif",
            about: pf.about || "",
            aboutId: pf.aboutId || "",
            phone: pf.contact?.phone || "",
            email: pf.contact?.email || "hello@igasud.tech",
            linkedin: pf.contact?.linkedin || "",
            github: pf.contact?.github || "https://github.com/dessulfate",
            forumUrl: pf.contact?.forumUrl || "https://forum.igasud.tech",
          },
        })
      }

      let dbProjects = await db.project.findMany({
        include: { docs: { orderBy: { order: "asc" } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      })

      if (dbProjects.length === 0 && jsonFallback.projects.length > 0) {
        for (let i = 0; i < jsonFallback.projects.length; i++) {
          const proj = jsonFallback.projects[i]
          await db.project.create({
            data: {
              numId: Number(proj.id) || i + 1,
              slug: proj.slug,
              title: proj.title,
              titleId: proj.titleId || proj.title,
              tagline: proj.tagline,
              taglineId: proj.taglineId || proj.tagline,
              description: proj.description,
              descriptionId: proj.descriptionId || proj.description,
              category: proj.category,
              year: String(proj.year || "2026"),
              role: proj.role || "Core Systems Architecture",
              status: proj.status || "shipped",
              featured: Boolean(proj.featured),
              thumbnail: proj.image || "/projects/aurora-design-system.png",
              accent: proj.accent || "#5c0707",
              techStack: JSON.stringify(proj.tech || []),
              links: JSON.stringify(proj.links || { repo: "https://github.com/dessulfate", demo: "https://igasud.tech" }),
              sortOrder: i,
              docs: {
                create: (proj.docs || []).map((d, dIdx) => ({
                  section: d.section,
                  icon: d.icon || "FileText",
                  order: dIdx,
                  content: d.content,
                })),
              },
            },
          })
        }

        dbProjects = await db.project.findMany({
          include: { docs: { orderBy: { order: "asc" } } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        })
      }

      const profile: Profile = {
        name: dbProfile.name,
        role: dbProfile.role,
        roleId: dbProfile.roleId,
        university: dbProfile.university,
        statusText: dbProfile.statusText,
        statusTextId: dbProfile.statusTextId,
        contact: {
          phone: dbProfile.phone,
          email: dbProfile.email,
          linkedin: dbProfile.linkedin,
          github: dbProfile.github,
          forumUrl: dbProfile.forumUrl,
        },
        about: dbProfile.about,
        aboutId: dbProfile.aboutId,
        photos: [],
      }

      const projects: Project[] = dbProjects.map((p, idx) => {
        let parsedTech: string[] = []
        let parsedLinks: { repo?: string; demo?: string } = {}
        try {
          parsedTech = JSON.parse(p.techStack)
        } catch {
          parsedTech = []
        }
        try {
          parsedLinks = p.links ? JSON.parse(p.links) : {}
        } catch {
          parsedLinks = {}
        }
        return {
          id: p.numId || idx + 1,
          slug: p.slug,
          title: p.title,
          titleId: p.titleId || p.title,
          tagline: p.tagline,
          taglineId: p.taglineId || p.tagline,
          description: p.description,
          descriptionId: p.descriptionId || p.description,
          year: p.year,
          role: p.role,
          link: parsedLinks.demo || "https://igasud.tech",
          image: p.thumbnail || "/projects/aurora-design-system.png",
          accent: p.accent,
          category: p.category,
          status: p.status,
          featured: p.featured,
          tech: parsedTech,
          links: parsedLinks,
          docs: p.docs.map((d) => ({
            section: d.section,
            icon: d.icon,
            content: d.content,
          })),
        }
      })

      return NextResponse.json({ profile, projects, source: "postgresql" })
    } catch (dbErr) {
      console.warn("[GET /api/data] PostgreSQL fallback to local JSON:", dbErr)
      return NextResponse.json({ ...jsonFallback, source: "json-fallback" })
    }
  } catch (error) {
    console.error("[GET /api/data]", error)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const updated = await db.siteProfile.upsert({
      where: { id: "default" },
      update: {
        name: body.name,
        role: body.role,
        roleId: body.roleId ?? body.role,
        university: body.university,
        statusText: body.statusText,
        statusTextId: body.statusTextId ?? body.statusText,
        about: body.about,
        aboutId: body.aboutId ?? body.about,
        email: body.email,
        phone: body.phone,
        github: body.github,
        linkedin: body.linkedin,
        forumUrl: body.forumUrl || "https://forum.igasud.tech",
      },
      create: {
        id: "default",
        name: body.name || "Igasud Studio",
        role: body.role || "",
        roleId: body.roleId || "",
        university: body.university || "",
        statusText: body.statusText || "",
        statusTextId: body.statusTextId || "",
        about: body.about || "",
        aboutId: body.aboutId || "",
        email: body.email || "hello@igasud.tech",
        phone: body.phone || "",
        github: body.github || "https://github.com/dessulfate",
        linkedin: body.linkedin || "",
        forumUrl: body.forumUrl || "https://forum.igasud.tech",
      },
    })

    await syncPostgresToJson()
    return NextResponse.json({ ok: true, profile: updated })
  } catch (error) {
    console.error("[PUT /api/data]", error)
    return NextResponse.json({ error: "Failed to update site profile" }, { status: 500 })
  }
}
