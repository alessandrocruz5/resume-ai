import { prisma } from './prisma'

const INCLUDE_FULL = {
  personalInfo: true,
  workExperiences: { orderBy: { sortOrder: 'asc' as const } },
  skills: { orderBy: { category: 'asc' as const } },
  education: true,
  projects: { orderBy: { sortOrder: 'asc' as const } },
}

export async function getOrCreateResume() {
  const existing = await prisma.masterResume.findFirst({ include: INCLUDE_FULL })
  if (existing) return existing
  return prisma.masterResume.create({ data: {}, include: INCLUDE_FULL })
}

export type FullResume = Awaited<ReturnType<typeof getOrCreateResume>>
