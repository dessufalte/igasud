import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

async function main() {
  const dataDir = path.join(process.cwd(), "data")
  const profile = JSON.parse(fs.readFileSync(path.join(dataDir, "profile.json"), "utf-8"))
  const projects = JSON.parse(fs.readFileSync(path.join(dataDir, "projects.json"), "utf-8"))

  console.log("Seeding SiteProfile into PostgreSQL (schema: igasud)...")
  await prisma.siteProfile.upsert({
    where: { id: "default" },
    update: {
      name: profile.name,
      role: profile.role,
      roleId: profile.roleId,
      university: profile.university,
      statusText: profile.statusText,
      statusTextId: profile.statusTextId,
      about: profile.about,
      aboutId: profile.aboutId,
      phone: profile.contact.phone,
      email: profile.contact.email,
      linkedin: profile.contact.linkedin,
      github: profile.contact.github,
      forumUrl: profile.contact.forumUrl,
    },
    create: {
      id: "default",
      name: profile.name,
      role: profile.role,
      roleId: profile.roleId,
      university: profile.university,
      statusText: profile.statusText,
      statusTextId: profile.statusTextId,
      about: profile.about,
      aboutId: profile.aboutId,
      phone: profile.contact.phone,
      email: profile.contact.email,
      linkedin: profile.contact.linkedin,
      github: profile.contact.github,
      forumUrl: profile.contact.forumUrl,
    },
  })

  console.log("Clearing old projects and seeding flagship engines (Nubian, Thema, NeuralKinematics, Aetheris)...")
  await prisma.doc.deleteMany({})
  await prisma.project.deleteMany({})

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]
    await prisma.project.create({
      data: {
        numId: Number(p.id) || i + 1,
        slug: p.slug,
        title: p.title,
        titleId: p.titleId || p.title,
        tagline: p.tagline,
        taglineId: p.taglineId || p.tagline,
        description: p.description,
        descriptionId: p.descriptionId || p.description,
        category: p.category,
        year: String(p.year),
        role: p.role,
        status: p.status,
        featured: Boolean(p.featured),
        thumbnail: p.image,
        accent: p.accent,
        techStack: JSON.stringify(p.tech || []),
        links: JSON.stringify(p.links || {}),
        sortOrder: i,
        docs: {
          create: (p.docs || []).map((d, dIdx) => ({
            section: d.section,
            icon: d.icon || "FileText",
            order: dIdx,
            content: d.content,
          })),
        },
      },
    })
  }

  const count = await prisma.project.count()
  console.log(`Successfully seeded ${count} flagship projects into PostgreSQL!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
