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

export interface Project {
  id: number
  title: string
  description: string
  year: string
  role: string
  link: string
  image: string
  tech: string[]
}

export interface PortfolioData {
  profile: Profile
  projects: Project[]
}
