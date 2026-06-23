import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const resume = await getOrCreateResume()

  const entry = await prisma.education.create({
    data: {
      masterResumeId: resume.id,
      school: body.school,
      degree: body.degree,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
