import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const resume = await getOrCreateResume()

  const skill = await prisma.skill.create({
    data: {
      masterResumeId: resume.id,
      name: body.name,
      category: body.category || 'General',
    },
  })

  return NextResponse.json(skill, { status: 201 })
}
