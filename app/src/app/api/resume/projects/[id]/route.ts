import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      name: body.name,
      description: body.description || null,
      bullets: body.bullets ?? [],
      url: body.url || null,
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.project.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
