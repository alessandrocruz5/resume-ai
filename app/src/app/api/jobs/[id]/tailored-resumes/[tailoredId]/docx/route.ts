import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildDocx } from '@/lib/docx-export'
import { TailoredSections } from '@/types/jobs'

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
  const buffer = await buildDocx(data)

  const slug = `${tailored.jobApplication.companyName}-${tailored.jobApplication.jobTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
  const filename = `resume-${slug}.docx`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
