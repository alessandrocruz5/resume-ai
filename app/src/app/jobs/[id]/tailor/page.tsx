import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TailoringFlow } from './TailoringFlow'

export default async function TailorPage({ params }: { params: { id: string } }) {
  const job = await prisma.jobApplication.findUnique({
    where: { id: params.id },
    include: {
      tailoredResumes: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!job) notFound()
  return <TailoringFlow job={job} />
}
