import Anthropic from '@anthropic-ai/sdk'

const globalForAnthropic = globalThis as unknown as { anthropic: Anthropic | undefined }

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (process.env.NODE_ENV !== 'production') globalForAnthropic.anthropic = anthropic

export const RESUME_WRITER_SYSTEM_PROMPT =
  'You are a professional resume writer who writes concise, keyword-rich, STAR-format bullets. You always respond with valid JSON matching the exact schema requested. Never include markdown code fences in your response — only raw JSON.'
