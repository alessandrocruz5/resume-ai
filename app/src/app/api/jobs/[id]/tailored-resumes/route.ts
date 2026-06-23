import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ai, OLLAMA_MODEL, RESUME_WRITER_SYSTEM_PROMPT, parseJSON } from '@/lib/anthropic'
import { AtsKeywordReport } from '@/types/jobs'

async function computeAtsScore(
  tailoredSections: unknown,
  jobDescriptionText: string
): Promise<{ atsScore: number; atsKeywordReport: AtsKeywordReport }> {
  const prompt = `Score this resume against the job description for ATS (Applicant Tracking System) compatibility.

Job Description:
${jobDescriptionText}

Resume:
${JSON.stringify(tailoredSections, null, 2)}

Extract the top required and preferred keywords/skills/tools from the JD. Check which ones appear in the resume.
Return a score from 0-100 where 100 means all important keywords are matched.

Respond with this JSON object and nothing else:
{
  "atsScore": 75,
  "atsKeywordReport": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  }
}`

  const completion = await ai.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = completion.choices[0].message.content ?? ''
  return parseJSON<{ atsScore: number; atsKeywordReport: AtsKeywordReport }>(text)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const job = await prisma.jobApplication.findUnique({ where: { id: params.id } })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let atsScore: number | null = null
  let atsKeywordReport: AtsKeywordReport | null = null

  try {
    const result = await computeAtsScore(body.tailoredSections, job.jobDescriptionText)
    atsScore = result.atsScore
    atsKeywordReport = result.atsKeywordReport
  } catch {
    // ATS scoring is best-effort — don't fail the save
  }

  const saved = await prisma.tailoredResume.create({
    data: {
      jobApplicationId: params.id,
      label: body.label || null,
      tailoredSections: body.tailoredSections,
      addedExperiences: body.addedExperiences ?? [],
      atsScore,
      atsKeywordReport: atsKeywordReport ? (atsKeywordReport as unknown as object) : undefined,
    },
  })

  return NextResponse.json(saved, { status: 201 })
}
