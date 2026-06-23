import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'
import { anthropic, RESUME_WRITER_SYSTEM_PROMPT } from '@/lib/anthropic'
import { GapAnalysisResult } from '@/types/jobs'

export async function POST(req: NextRequest) {
  const { jobApplicationId } = await req.json()

  const [resume, job] = await Promise.all([
    getOrCreateResume(),
    prisma.jobApplication.findUnique({ where: { id: jobApplicationId } }),
  ])

  if (!job) return NextResponse.json({ error: 'Job application not found' }, { status: 404 })

  const prompt = `Given the master resume and job description below, identify:
1. Skills/experiences from the JD that the candidate already demonstrates in their resume (matched)
2. Skills/experiences required or strongly preferred by the JD that are missing or weak in the resume (gaps) — focus on concrete, actionable gaps, not generic qualities

Master Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
${job.jobDescriptionText}

Company Context:
${job.companyContextText ?? 'Not provided'}

Respond with JSON only, exactly this schema — no markdown fences:
{
  "matched": ["skill or experience already demonstrated"],
  "gaps": [
    {
      "skill": "specific skill or experience",
      "context": "why this matters / relevant quote from JD",
      "required": true
    }
  ]
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: RESUME_WRITER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const result: GapAnalysisResult = JSON.parse(text)

  return NextResponse.json(result)
}
