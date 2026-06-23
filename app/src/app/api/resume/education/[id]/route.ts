import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const entry = await prisma.education.update({
    where: { id: params.id },
    data: {
      school: body.school,
      degree: body.degree,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
    },
  })

  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.education.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
