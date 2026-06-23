import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.jobApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tailoredResumes: { select: { id: true, createdAt: true, label: true, atsScore: true }, orderBy: { createdAt: 'desc' } },
      coverLetters: { select: { id: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
    },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const job = await prisma.jobApplication.create({
    data: {
      companyName: body.companyName,
      jobTitle: body.jobTitle,
      jobDescriptionText: body.jobDescriptionText,
      companyContextText: body.companyContextText || null,
    },
  })
  return NextResponse.json(job, { status: 201 })
}
