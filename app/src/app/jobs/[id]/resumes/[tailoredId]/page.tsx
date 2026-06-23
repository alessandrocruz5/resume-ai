import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TailoredSections } from '@/types/jobs'

export default async function ResumePrintPage({
  params,
}: {
  params: { id: string; tailoredId: string }
}) {
  const tailored = await prisma.tailoredResume.findUnique({
    where: { id: params.tailoredId, jobApplicationId: params.id },
    include: { jobApplication: true },
  })
  if (!tailored) notFound()

  const pdfUrl = `/api/jobs/${params.id}/tailored-resumes/${params.tailoredId}/pdf`
  const docxUrl = `/api/jobs/${params.id}/tailored-resumes/${params.tailoredId}/docx`

  const { personalInfo, workExperiences, skills, education, projects } =
    tailored.tailoredSections as unknown as TailoredSections

  const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] ?? []), s.name]
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Export controls — hidden when printing */}
      <div className="print:hidden flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <span className="text-sm text-gray-500">
          {tailored.jobApplication.jobTitle} @ {tailored.jobApplication.companyName}
          {tailored.label ? ` — ${tailored.label}` : ''}
        </span>
        <div className="flex gap-2">
          <a
            href={pdfUrl}
            download
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Download PDF
          </a>
          <a
            href={docxUrl}
            download
            className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Download DOCX
          </a>
        </div>
      </div>

      {/* Resume body */}
      <div className="max-w-[800px] mx-auto bg-white my-6 p-10 shadow-sm print:max-w-none print:my-0 print:shadow-none print:p-8">
        {/* Header */}
        <div className="mb-5 pb-4 border-b-2 border-gray-900">
          <h1 className="text-3xl font-bold text-gray-900">{personalInfo.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>

        {/* Work Experience */}
        {workExperiences.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest pb-1 mb-3 border-b border-gray-300">
              Experience
            </h2>
            {workExperiences.map((we) => (
              <div key={we.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-gray-900">{we.title}</p>
                  <p className="text-xs text-gray-500">
                    {we.startDate} – {we.endDate ?? 'Present'}
                  </p>
                </div>
                <p className="text-sm text-gray-600 italic mb-1">{we.company}</p>
                <ul className="space-y-0.5">
                  {we.bullets.map((b, i) => (
                    <li key={i} className="text-sm text-gray-800 flex gap-2">
                      <span className="mt-0.5 text-gray-400 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest pb-1 mb-3 border-b border-gray-300">
              Skills
            </h2>
            {Object.entries(skillsByCategory).map(([cat, names]) => (
              <div key={cat} className="text-sm mb-1">
                <span className="font-semibold text-gray-900">{cat}: </span>
                <span className="text-gray-700">{names.join(', ')}</span>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest pb-1 mb-3 border-b border-gray-300">
              Education
            </h2>
            {education.map((e, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-gray-900 text-sm">{e.degree}</p>
                <p className="text-sm text-gray-600">{e.school}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest pb-1 mb-3 border-b border-gray-300">
              Projects
            </h2>
            {projects.map((p, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                  {p.url && <span className="text-xs text-blue-600">{p.url}</span>}
                </div>
                {p.description && <p className="text-sm text-gray-600 mb-1">{p.description}</p>}
                <ul className="space-y-0.5">
                  {p.bullets.map((b, j) => (
                    <li key={j} className="text-sm text-gray-800 flex gap-2">
                      <span className="text-gray-400 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
