'use client'

import { useState } from 'react'
import { FullResume } from '@/lib/resume'
import { PersonalInfoSection } from './PersonalInfoSection'
import { WorkExperienceSection } from './WorkExperienceSection'
import { SkillsSection } from './SkillsSection'
import { EducationSection } from './EducationSection'
import { ProjectsSection } from './ProjectsSection'

type Tab = 'personal' | 'work' | 'skills' | 'education' | 'projects'

const TABS: { id: Tab; label: string }[] = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'work', label: 'Work Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
]

export function ResumeEditor({ initialData }: { initialData: FullResume }) {
  const [activeTab, setActiveTab] = useState<Tab>('personal')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Master Resume</h1>
        <p className="text-sm text-gray-500">Your base resume — tailored per job in the Jobs section.</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={activeTab === 'personal' ? '' : 'hidden'}>
        <PersonalInfoSection initialData={initialData.personalInfo} />
      </div>
      <div className={activeTab === 'work' ? '' : 'hidden'}>
        <WorkExperienceSection initialData={initialData.workExperiences} />
      </div>
      <div className={activeTab === 'skills' ? '' : 'hidden'}>
        <SkillsSection initialData={initialData.skills} />
      </div>
      <div className={activeTab === 'education' ? '' : 'hidden'}>
        <EducationSection initialData={initialData.education} />
      </div>
      <div className={activeTab === 'projects' ? '' : 'hidden'}>
        <ProjectsSection initialData={initialData.projects} />
      </div>
    </div>
  )
}
