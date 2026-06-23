import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'
import { RESUME_WRITER_SYSTEM_PROMPT, callAI } from '@/lib/anthropic'
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

Respond with this JSON object and nothing else:
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

  try {
    const result = await callAI<GapAnalysisResult>([
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])
    return NextResponse.json(result)
  } catch (e) {
    console.error('[analyze-gaps]', e)
    return NextResponse.json({ error: 'AI returned an unexpected response. Please try again.' }, { status: 502 })
  }
}
