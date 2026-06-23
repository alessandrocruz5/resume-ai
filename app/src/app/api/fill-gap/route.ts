import { NextRequest, NextResponse } from 'next/server'
import { anthropic, RESUME_WRITER_SYSTEM_PROMPT } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const { skill, context, userDescription, jdText } = await req.json()

  const prompt = `Generate 1-2 concise STAR-format resume bullets for the candidate experience below.
Mirror the language and keywords used in the job description.

Skill/Experience needed: ${skill}
Context from JD: ${context}
Candidate's description: ${userDescription}

Job Description (for keyword mirroring):
${jdText}

Respond with JSON only — no markdown fences:
{ "bullets": ["bullet 1", "bullet 2"] }`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: RESUME_WRITER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const result: { bullets: string[] } = JSON.parse(text)

  return NextResponse.json(result)
}
