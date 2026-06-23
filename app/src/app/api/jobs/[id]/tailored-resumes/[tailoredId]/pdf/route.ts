import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer'
import { ResumePDF } from '@/lib/pdf-template'
import { TailoredSections } from '@/types/jobs'
import React from 'react'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; tailoredId: string } }
) {
  const tailored = await prisma.tailoredResume.findUnique({
    where: { id: params.tailoredId, jobApplicationId: params.id },
    include: { jobApplication: true },
  })
  if (!tailored) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = tailored.tailoredSections as unknown as TailoredSections
  const element = React.createElement(ResumePDF, { data }) as React.ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)

  const slug = `${tailored.jobApplication.companyName}-${tailored.jobApplication.jobTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
  const filename = `resume-${slug}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
