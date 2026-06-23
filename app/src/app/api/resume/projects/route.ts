import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const resume = await getOrCreateResume()

  const count = await prisma.project.count({ where: { masterResumeId: resume.id } })

  const project = await prisma.project.create({
    data: {
      masterResumeId: resume.id,
      name: body.name,
      description: body.description || null,
      bullets: body.bullets ?? [],
      url: body.url || null,
      sortOrder: count,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
