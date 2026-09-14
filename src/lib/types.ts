export type ProjectStatus = "shipped" | "in-progress" | "concept"

export interface ProjectLinks {
  repo?: string
  demo?: string
  docs?: string
}

export interface ProjectSummary {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  category: string
  year: number
  status: ProjectStatus
  featured: boolean
  accent: string
  techStack: string[]
  links: ProjectLinks | null
  _count: { docs: number }
}

export interface ProjectDoc {
  id: string
  section: string
  icon: string
  order: number
  content: string
}

export interface ProjectDetail extends ProjectSummary {
  docs: ProjectDoc[]
}
