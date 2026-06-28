import OpenAI from 'openai'

const globalForAI = globalThis as unknown as { ai: OpenAI | undefined }

export const ai =
  globalForAI.ai ??
  new OpenAI({
    baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    apiKey: 'ollama',
  })

if (process.env.NODE_ENV !== 'production') globalForAI.ai = ai

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:30b-a3b'

// `/no_think` is Qwen3's soft switch to skip its reasoning pass — we want fast,
// schema-only JSON here, not a chain of thought.
export const RESUME_WRITER_SYSTEM_PROMPT =
  'You are a professional resume writer who writes concise, keyword-rich, STAR-format bullets. You always respond with valid JSON matching the exact schema requested. Never include markdown code fences or any text outside the JSON object. /no_think'

/** Strip Qwen3 reasoning blocks and markdown code fences that local models emit despite instructions. */
export function parseJSON<T>(raw: string): T {
  const stripped = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()
  return JSON.parse(stripped) as T
}

/** Call the model and parse its JSON response, retrying up to `maxAttempts` times on parse failure. */
export async function callAI<T>(
  messages: { role: 'system' | 'user'; content: string }[],
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const completion = await ai.chat.completions.create({
      model: OLLAMA_MODEL,
      messages,
    })
    const text = completion.choices[0].message.content ?? ''
    try {
      return parseJSON<T>(text)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}
