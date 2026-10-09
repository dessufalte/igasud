export interface Profile {
  name: string
  role: string
  university: string
  contact: {
    phone: string
    email: string
    linkedin: string
    github: string
  }
  about: string
  photos: string[]
}

export interface ProjectDoc {
  section: string
  icon: string
  content: string
}

export interface Project {
  id: number
  slug: string
  title: string
  tagline: string
  description: string
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
}
