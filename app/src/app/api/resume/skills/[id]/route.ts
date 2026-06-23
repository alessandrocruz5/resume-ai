import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const skill = await prisma.skill.update({
    where: { id: params.id },
    data: {
      name: body.name,
      category: body.category || 'General',
    },
  })

  return NextResponse.json(skill)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.skill.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
