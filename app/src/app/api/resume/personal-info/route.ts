import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateResume } from '@/lib/resume'

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const resume = await getOrCreateResume()

  const info = await prisma.personalInfo.upsert({
    where: { masterResumeId: resume.id },
    update: {
      name: body.name ?? '',
      email: body.email ?? '',
      phone: body.phone || null,
      linkedin: body.linkedin || null,
      location: body.location || null,
    },
    create: {
      masterResumeId: resume.id,
      name: body.name ?? '',
      email: body.email ?? '',
      phone: body.phone || null,
      linkedin: body.linkedin || null,
      location: body.location || null,
    },
  })

  return NextResponse.json(info)
}
