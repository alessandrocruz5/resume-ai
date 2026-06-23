import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ai, OLLAMA_MODEL, RESUME_WRITER_SYSTEM_PROMPT, parseJSON } from '@/lib/anthropic'
import { TailoredSections } from '@/types/jobs'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const letters = await prisma.coverLetter.findMany({
    where: { jobApplicationId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(letters)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { tailoredResumeId } = await req.json()

  const [tailored, job] = await Promise.all([
    tailoredResumeId
      ? prisma.tailoredResume.findUnique({ where: { id: tailoredResumeId } })
      : null,
    prisma.jobApplication.findUnique({ where: { id: params.id } }),
  ])

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sections = tailored?.tailoredSections as TailoredSections | null
  const candidate = sections?.personalInfo

  const prompt = `Write a professional cover letter for this job application.

Candidate Name: ${candidate?.name ?? ''}
${sections ? `Work Experience:\n${JSON.stringify(sections.workExperiences, null, 2)}\n\nSkills:\n${sections.skills.map((s) => s.name).join(', ')}` : ''}

Company: ${job.companyName}
Role: ${job.jobTitle}

Job Description:
${job.jobDescriptionText}
${job.companyContextText ? `\nCompany Context:\n${job.companyContextText}` : ''}

Write a compelling 3-4 paragraph cover letter. Be specific and professional. Reference concrete experiences and skills from the resume that match the JD. Avoid generic phrases. Write in first person.

Respond with this JSON object and nothing else:
{
  "content": "Dear Hiring Manager,\\n\\n[paragraph 1]\\n\\n[paragraph 2]\\n\\n[paragraph 3]\\n\\nSincerely,\\n[name]"
}`

  const completion = await ai.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = completion.choices[0].message.content ?? ''
  const { content } = parseJSON<{ content: string }>(text)

  const letter = await prisma.coverLetter.create({
    data: { jobApplicationId: params.id, content },
  })

  return NextResponse.json(letter, { status: 201 })
}
