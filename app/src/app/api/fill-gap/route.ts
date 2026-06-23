import { NextRequest, NextResponse } from 'next/server'
import { RESUME_WRITER_SYSTEM_PROMPT, callAI } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const { skill, context, userDescription, jdText } = await req.json()

  const prompt = `Generate 1-2 concise STAR-format resume bullets for the candidate experience below.
Mirror the language and keywords used in the job description.

Skill/Experience needed: ${skill}
Context from JD: ${context}
Candidate's description: ${userDescription}

Job Description (for keyword mirroring):
${jdText}

Respond with this JSON object and nothing else:
{ "bullets": ["bullet 1", "bullet 2"] }`

  try {
    const result = await callAI<{ bullets: string[] }>([
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ])
    return NextResponse.json(result)
  } catch (e) {
    console.error('[fill-gap]', e)
    return NextResponse.json({ error: 'AI returned an unexpected response. Please try again.' }, { status: 502 })
  }
}
