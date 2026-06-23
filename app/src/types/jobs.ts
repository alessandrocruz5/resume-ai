export interface JobApplication {
  id: string
  companyName: string
  jobTitle: string
  jobDescriptionText: string
  companyContextText: string | null
  createdAt: string
  tailoredResumes: TailoredResume[]
  coverLetters: CoverLetter[]
}

export interface TailoredResume {
  id: string
  jobApplicationId: string
  createdAt: string
  label: string | null
  tailoredSections: TailoredSections
  addedExperiences: GapAnswer[] | null
  atsScore: number | null
  atsKeywordReport: AtsKeywordReport | null
}

export interface CoverLetter {
  id: string
  jobApplicationId: string
  createdAt: string
  content: string
}

export interface TailoredSections {
  personalInfo: {
    name: string
    email: string
    phone: string | null
    linkedin: string | null
    location: string | null
  }
  workExperiences: TailoredWorkExperience[]
  skills: { name: string; category: string }[]
  education: { school: string; degree: string; startDate: string | null; endDate: string | null }[]
  projects: { name: string; description: string | null; bullets: string[]; url: string | null }[]
}

export interface TailoredWorkExperience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string | null
  bullets: string[]
}

export interface Gap {
  skill: string
  context: string
  required: boolean
}

export interface GapAnalysisResult {
  matched: string[]
  gaps: Gap[]
}

export interface GapAnswer {
  skill: string
  context: string
  userDescription: string
  bullets: string[]
}

export interface AtsKeywordReport {
  matched: string[]
  missing: string[]
}
