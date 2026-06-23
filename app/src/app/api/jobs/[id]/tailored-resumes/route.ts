import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const saved = await prisma.tailoredResume.create({
    data: {
      jobApplicationId: params.id,
      label: body.label || null,
      tailoredSections: body.tailoredSections,
      addedExperiences: body.addedExperiences ?? [],
      atsScore: body.atsScore ?? null,
      atsKeywordReport: body.atsKeywordReport ?? null,
    },
  })

  return NextResponse.json(saved, { status: 201 })
}
