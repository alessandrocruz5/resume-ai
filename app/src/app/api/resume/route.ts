import { NextResponse } from 'next/server'
import { getOrCreateResume } from '@/lib/resume'

export async function GET() {
  const resume = await getOrCreateResume()
  return NextResponse.json(resume)
}
