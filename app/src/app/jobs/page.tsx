import { prisma } from '@/lib/prisma'
import { JobsClient } from './JobsClient'

export default async function JobsPage() {
  const jobs = await prisma.jobApplication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      tailoredResumes: { select: { id: true, atsScore: true }, orderBy: { createdAt: 'desc' } },
    },
  })
  return <JobsClient initialJobs={jobs} />
}
