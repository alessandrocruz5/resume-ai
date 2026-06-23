import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const resume = await getOrCreateResume()

  const count = await prisma.workExperience.count({ where: { masterResumeId: resume.id } })

  const entry = await prisma.workExperience.create({
    data: {
      masterResumeId: resume.id,
      company: body.company,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate || null,
      bullets: body.bullets ?? [],
      sortOrder: count,
    },
  })

  return NextResponse.json(entry, { status: 201 })
}
