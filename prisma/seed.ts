import { db } from "../src/lib/db"

async function main() {
  // Clean
  await db.doc.deleteMany()
  await db.project.deleteMany()

  const projects = [
    {
      slug: "aurora-design-system",
      title: "Aurora Design System",
      tagline: "A token-driven, theme-aware design system for product teams.",
      description:
        "Aurora is a production-grade design system with semantic color tokens, fluid typography, and 60+ accessible React components. It ships with a living documentation site, Figma sync, and zero-runtime CSS.",
      category: "Design Systems",
      year: 2024,
      status: "shipped",
      featured: true,
      accent: "#8b5cf6",
      techStack: ["React", "TypeScript", "Radix UI", "Tailwind CSS", "Storybook"],
      links: { repo: "https://github.com", demo: "https://example.com" },
    },
    {
      slug: "lumen-analytics",
      title: "Lumen Analytics",
      tagline: "Privacy-first product analytics with edge ingestion.",
      description:
        "Lumen ingests millions of events per day at the edge, with sub-50ms p99 latency. It features a query builder, cohort retention, and a zero-cookie architecture that keeps user data on-device.",
      category: "Data & Analytics",
      year: 2024,
      status: "shipped",
      featured: true,
      accent: "#06b6d4",
      techStack: ["Next.js", "ClickHouse", "Cloudflare Workers", "TypeScript"],
      links: { repo: "https://github.com", demo: "https://example.com" },
    },
    {
      slug: "harbor-cms",
      title: "Harbor CMS",
      tagline: "A headless CMS that feels like a notebook.",
      description:
        "Harbor reimagines content management as a calm, block-based editor with real-time collaboration. Built on CRDTs, it works offline-first and syncs instantly across devices.",
      category: "Developer Tools",
      year: 2023,
      status: "shipped",
      featured: true,
      accent: "#f59e0b",
      techStack: ["Next.js", "Yjs", "Prisma", "PostgreSQL", "tRPC"],
      links: { repo: "https://github.com", demo: "https://example.com" },
    },
    {
      slug: "driftwood-cli",
      title: "Driftwood CLI",
      tagline: "Ship full-stack apps from a single command.",
      description:
        "Driftwood is a zero-config scaffolding CLI that generates production-ready Next.js apps with auth, billing, and CI pre-wired. It ships with 12 opinionated templates.",
      category: "Developer Tools",
      year: 2023,
      status: "shipped",
      featured: false,
      accent: "#10b981",
      techStack: ["Node.js", "TypeScript", "Bun", "Ink"],
      links: { repo: "https://github.com" },
    },
    {
      slug: "prism-motion",
      title: "Prism Motion",
      tagline: "Declarative scroll-driven animations for React.",
      description:
        "Prism Motion is a lightweight animation library focused on scroll storytelling. It composes framer-motion primitives into a declarative API with a 3kb runtime.",
      category: "Open Source",
      year: 2024,
      status: "in-progress",
      featured: false,
      accent: "#ec4899",
      techStack: ["React", "Framer Motion", "TypeScript"],
      links: { repo: "https://github.com" },
    },
    {
      slug: "atlas-maps",
      title: "Atlas Maps",
      tagline: "Vector tile rendering at 120fps in the browser.",
      description:
        "Atlas is a WebGL2 mapping engine that renders custom vector tiles with smooth camera transitions, 3D terrain, and a plugin ecosystem. Built for data visualization at scale.",
      category: "Data & Analytics",
      year: 2022,
      status: "shipped",
      featured: false,
      accent: "#6366f1",
      techStack: ["WebGL2", "TypeScript", "MapLibre", "Workers"],
      links: { repo: "https://github.com", demo: "https://example.com" },
    },
  ]

  for (const p of projects) {
    const created = await db.project.create({
      data: {
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        category: p.category,
        year: p.year,
        status: p.status,
        featured: p.featured,
        accent: p.accent,
        thumbnail: `/projects/${p.slug}.png`,
        techStack: JSON.stringify(p.techStack),
        links: JSON.stringify(p.links),
      },
    })

    // Documentation sections per project
    const docs = buildDocs(p.slug, p.title, p.techStack)
    for (const doc of docs) {
      await db.doc.create({
        data: { ...doc, projectId: created.id },
      })
    }
  }

  console.log(`Seeded ${projects.length} projects with documentation.`)
}

function buildDocs(slug: string, title: string, tech: string[]) {
  const sections = [
    {
      section: "Overview",
      icon: "Sparkles",
      order: 0,
      content: `# ${title}

${overviewFor(slug)}

## Why this exists

This project was born out of a recurring frustration: existing solutions traded **calm** for **power**. ${title} aims to deliver both — a tool that disappears when you're in flow, yet surfaces deep capabilities the moment you need them.

## Highlights

- Zero-config onboarding
- Built for edge performance
- Accessibility as a first-class concern
- Fully typed end-to-end`,
    },
    {
      section: "Architecture",
      icon: "Layers",
      order: 1,
      content: `# Architecture

${title} is organized around three principles: **isolation**, **streaming**, and **graceful degradation**.

\`\`\`
┌─────────────────────────────────────────┐
│              Client (React)             │
│  ┌───────────┐  ┌──────────┐  ┌───────┐ │
│  │   UI      │  │  State   │  │ Sync  │ │
│  └─────┬─────┘  └────┬─────┘  └───┬───┘ │
└────────┼─────────────┼────────────┼─────┘
         │             │            │
         ▼             ▼            ▼
┌─────────────────────────────────────────┐
│           Edge (Workers / Node)         │
│   Ingest → Validate → Route → Persist   │
└─────────────────────────────────────────┘
\`\`\`

## Tech stack

${tech.map((t) => `- ${t}`).join("\n")}`,
    },
    {
      section: "Features",
      icon: "ListChecks",
      order: 2,
      content: `# Features

## Core capabilities

1. **Real-time updates** — changes propagate in under 100ms via streaming.
2. **Offline-first** — a local queue replays mutations once connectivity returns.
3. **Granular permissions** — role-based access at the resource level.
4. **Audit trail** — every mutation is recorded with a cryptographic signature.

## Quality bar

| Metric         | Target       | Achieved     |
|----------------|--------------|--------------|
| p99 latency    | < 100ms      | 42ms         |
| Uptime         | 99.9%        | 99.97%       |
| Test coverage  | 80%          | 87%          |
| Bundle size    | < 100kb gzip | 68kb gzip    |`,
    },
    {
      section: "Roadmap",
      icon: "Map",
      order: 3,
      content: `# Roadmap

## Shipped ✅

- Public beta
- Edge deployment
- Real-time collaboration

## In progress 🚧

- Plugin marketplace
- Native mobile SDKs

## Exploring 🔭

- AI-assisted authoring
- Multi-region replication`,
    },
  ]
  return sections
}

function overviewFor(slug: string) {
  const map: Record<string, string> = {
    "aurora-design-system":
      "Aurora is a token-driven design system built for scale. Every color, spacing, and motion decision is encoded as a semantic token, so re-theming an entire product takes minutes — not months.",
    "lumen-analytics":
      "Lumen is a privacy-first analytics engine. It ingests events at the edge, never writes cookies, and keeps raw data on-device whenever possible. Teams get full funnel and retention tooling without compromising user trust.",
    "harbor-cms":
      "Harbor is a headless CMS that feels like a notebook. Block-based editing, CRDT sync, and offline-first storage make content authoring feel calm and immediate.",
    "driftwood-cli":
      "Driftwood is a zero-config CLI that scaffolds production-ready full-stack apps. Auth, billing, CI, and observability are pre-wired — you just ship features.",
    "prism-motion":
      "Prism Motion brings declarative scroll-driven storytelling to React. It wraps framer-motion in a tiny, composable API optimized for marketing pages and editorial layouts.",
    "atlas-maps":
      "Atlas is a WebGL2 mapping engine focused on data visualization. It renders custom vector tiles at 120fps with smooth camera transitions and 3D terrain.",
  }
  return map[slug] ?? "A focused exploration of a hard problem, shipped with care."
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
