import { NextRequest, NextResponse } from 'next/server'
import { ai, OLLAMA_MODEL, RESUME_WRITER_SYSTEM_PROMPT, parseJSON } from '@/lib/anthropic'

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

  const completion = await ai.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [
      { role: 'system', content: RESUME_WRITER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  })

  const text = completion.choices[0].message.content ?? ''
  const result = parseJSON<{ bullets: string[] }>(text)

  return NextResponse.json(result)
}
