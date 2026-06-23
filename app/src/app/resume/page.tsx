import { getOrCreateResume } from '@/lib/resume'
import { ResumeEditor } from './ResumeEditor'

export default async function ResumePage() {
  const resume = await getOrCreateResume()
  return <ResumeEditor initialData={resume} />
}
