import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const entry = await prisma.workExperience.update({
    where: { id: params.id },
    data: {
      company: body.company,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate || null,
      bullets: body.bullets ?? [],
    },
  })

  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.workExperience.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
