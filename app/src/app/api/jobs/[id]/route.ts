import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobApplication.findUnique({
    where: { id: params.id },
    include: {
      tailoredResumes: { orderBy: { createdAt: 'desc' } },
      coverLetters: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(job)
}
