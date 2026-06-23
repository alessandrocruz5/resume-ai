import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'
import { ai, OLLAMA_MODEL, RESUME_WRITER_SYSTEM_PROMPT, parseJSON } from '@/lib/anthropic'
import { GapAnswer, TailoredSections } from '@/types/jobs'

export async function POST(req: NextRequest) {
  const { jobApplicationId, gapAnswers }: { jobApplicationId: string; gapAnswers: GapAnswer[] } =
    await req.json()

  const [resume, job] = await Promise.all([
    getOrCreateResume(),
    prisma.jobApplication.findUnique({ where: { id: jobApplicationId } }),
  ])

  if (!job) return NextResponse.json({ error: 'Job application not found' }, { status: 404 })

  const prompt = `Rewrite the master resume below to be optimally tailored for the job description.

Rules:
- Reorder and rewrite existing bullets to mirror JD keywords and terminology
- Sort skills by JD relevance (most relevant category and skill first)
- Incorporate the added experience bullets from gap-filling into relevant work experience entries or as a new entry if no role fits
- Keep all factual information accurate — never invent experience
- Keep personal info and education unchanged
- Return the full resume as structured JSON

Master Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
${job.jobDescriptionText}

Company Context:
${job.companyContextText ?? 'Not provided'}

Added Experiences from gap-filling:
${JSON.stringify(gapAnswers.filter((a) => a.bullets.length > 0), null, 2)}

Respond with this JSON object and nothing else:
{
  "tailoredSections": {
    "personalInfo": { "name": "", "email": "", "phone": null, "linkedin": null, "location": null },
    "workExperiences": [
      { "id": "", "company": "", "title": "", "startDate": "", "endDate": null, "bullets": [] }
    ],
    "skills": [{ "name": "", "category": "" }],
    "education": [{ "school": "", "degree": "", "startDate": null, "endDate": null }],
    "projects": [{ "name": "", "description": null, "bullets": [], "url": null }]
  },
  "addedExperiences": [{ "skill": "", "context": "", "userDescription": "", "bullets": [] }]
}`

  const completion = await ai.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = completion.choices[0].message.content ?? ''
  const result = parseJSON<{ tailoredSections: TailoredSections; addedExperiences: GapAnswer[] }>(text)

  return NextResponse.json(result)
}
