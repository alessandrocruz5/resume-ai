export interface PersonalInfo {
  id: string
  name: string
  email: string
  phone: string | null
  linkedin: string | null
  location: string | null
  masterResumeId: string
}

export interface WorkExperience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string | null
  bullets: string[]
  sortOrder: number
  masterResumeId: string
}

export interface Skill {
  id: string
  name: string
  category: string
  masterResumeId: string
}

export interface Education {
  id: string
  school: string
  degree: string
  startDate: string | null
  endDate: string | null
  masterResumeId: string
}

export type ProjectStatus = 'in progress' | 'in production' | 'beta testing' | 'proof of concept'

export interface Project {
  id: string
  name: string
  description: string | null
  bullets: string[]
  url: string | null
  status: ProjectStatus | null
  sortOrder: number
  masterResumeId: string
}

export interface ResumeData {
  id: string
  personalInfo: PersonalInfo | null
  workExperiences: WorkExperience[]
  skills: Skill[]
  education: Education[]
  projects: Project[]
}
