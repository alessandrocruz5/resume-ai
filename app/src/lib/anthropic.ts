import OpenAI from 'openai'

const globalForAI = globalThis as unknown as { ai: OpenAI | undefined }

export const ai =
  globalForAI.ai ??
  new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    apiKey: 'ollama',
  })

if (process.env.NODE_ENV !== 'production') globalForAI.ai = ai

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2'

export const RESUME_WRITER_SYSTEM_PROMPT =
  'You are a professional resume writer who writes concise, keyword-rich, STAR-format bullets. You always respond with valid JSON matching the exact schema requested. Never include markdown code fences or any text outside the JSON object.'

/** Strip markdown code fences that local models sometimes emit despite instructions. */
export function parseJSON<T>(raw: string): T {
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  return JSON.parse(stripped) as T
}
