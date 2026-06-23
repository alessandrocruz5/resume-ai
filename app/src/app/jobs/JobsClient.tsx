'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface JobSummary {
  id: string
  companyName: string
  jobTitle: string
  createdAt: string | Date
  tailoredResumes: { id: string; atsScore: number | null }[]
}

export function JobsClient({ initialJobs }: { initialJobs: JobSummary[] }) {
  const router = useRouter()
  const [jobs] = useState(initialJobs)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    jobDescriptionText: '',
    companyContextText: '',
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setSaving(false)
    setShowForm(false)
    setForm({ companyName: '', jobTitle: '', jobDescriptionText: '', companyContextText: '' })
    router.push(`/jobs/${created.id}/tailor`)
  }

  const bestScore = (job: JobSummary) =>
    job.tailoredResumes.length > 0
      ? Math.max(...job.tailoredResumes.map((r) => r.atsScore ?? 0))
      : null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Job Applications</h1>
          <p className="text-sm text-gray-500">Each application has its own tailored resume session.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Application
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Job Application</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    required
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    required
                    value={form.jobTitle}
                    onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={form.jobDescriptionText}
                  onChange={(e) => setForm((f) => ({ ...f, jobDescriptionText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Paste the full job description here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company LinkedIn &ldquo;About&rdquo; <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.companyContextText}
                  onChange={(e) => setForm((f) => ({ ...f, companyContextText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  placeholder="Paste the company About section from LinkedIn..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Creating...' : 'Create & Start Tailoring'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-2">No applications yet</p>
          <p className="text-sm">Click &quot;New Application&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const score = bestScore(job)
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}/tailor`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{job.jobTitle}</p>
                    <p className="text-sm text-gray-500">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    {score !== null && (
                      <div>
                        <span
                          className={`text-lg font-bold ${
                            score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'
                          }`}
                        >
                          {score}
                        </span>
                        <span className="text-xs text-gray-400 ml-0.5">ATS</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {job.tailoredResumes.length} version{job.tailoredResumes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
