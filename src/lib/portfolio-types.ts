export type Language = "en" | "id"

export interface Profile {
  name: string
  role: string
  roleId?: string
  university: string
  statusText?: string
  statusTextId?: string
  contact: {
    phone: string
    email: string
    linkedin: string
    github: string
    forumUrl?: string
  }
  about: string
  aboutId?: string
  photos: string[]
}

export interface ProjectDoc {
  section: string
  icon: string
  content: string
}

export interface Project {
  id: number | string
  slug: string
  title: string
  titleId?: string
  tagline: string
  taglineId?: string
  description: string
  descriptionId?: string
  year: string
  role: string
  link: string
  image: string
  accent: string
  category: string
  status: string
  featured: boolean
  tech: string[]
  links: { repo?: string; demo?: string }
  docs: ProjectDoc[]
}

export interface PortfolioData {
  profile: Profile
  projects: Project[]
  source?: "postgresql" | "json-fallback"
}
