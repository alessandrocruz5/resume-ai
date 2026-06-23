'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gap, GapAnalysisResult, GapAnswer, TailoredSections } from '@/types/jobs'

type Step = 'idle' | 'analyzing' | 'gap-filling' | 'generating' | 'result'

interface JobWithResumes {
  id: string
  companyName: string
  jobTitle: string
  jobDescriptionText: string
  companyContextText: string | null
  tailoredResumes: {
    id: string
    createdAt: Date
    label: string | null
    tailoredSections: unknown
    addedExperiences: unknown
    atsScore: number | null
  }[]
}

export function TailoringFlow({ job }: { job: JobWithResumes }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  // Gap analysis
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResult | null>(null)

  // Gap filling
  const [gapIndex, setGapIndex] = useState(0)
  const [answers, setAnswers] = useState<GapAnswer[]>([])
  const [currentDesc, setCurrentDesc] = useState('')
  const [fillingBullets, setFillingBullets] = useState(false)
  const [currentBullets, setCurrentBullets] = useState<string[]>([])

  // Result
  const [tailoredSections, setTailoredSections] = useState<TailoredSections | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')

  async function runGapAnalysis() {
    setStep('analyzing')
    setError(null)
    try {
      const res = await fetch('/api/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobApplicationId: job.id }),
      })
      if (!res.ok) throw new Error('Gap analysis failed')
      const result: GapAnalysisResult = await res.json()
      setAnalysisResult(result)
      setGapIndex(0)
      setAnswers([])
      setCurrentDesc('')
      setCurrentBullets([])
      setStep('gap-filling')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('idle')
    }
  }

  const gaps = analysisResult?.gaps ?? []
  const currentGap: Gap | undefined = gaps[gapIndex]

  async function generateBullets() {
    if (!currentDesc.trim() || !currentGap) return
    setFillingBullets(true)
    try {
      const res = await fetch('/api/fill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: currentGap.skill,
          context: currentGap.context,
          userDescription: currentDesc,
          jdText: job.jobDescriptionText,
        }),
      })
      const data: { bullets: string[] } = await res.json()
      setCurrentBullets(data.bullets)
    } catch {
      setCurrentBullets([])
    } finally {
      setFillingBullets(false)
    }
  }

  function acceptCurrentGap() {
    if (!currentGap) return
    setAnswers((prev) => [
      ...prev,
      {
        skill: currentGap.skill,
        context: currentGap.context,
        userDescription: currentDesc,
        bullets: currentBullets,
      },
    ])
    advanceGap()
  }

  function skipCurrentGap() {
    if (!currentGap) return
    setAnswers((prev) => [
      ...prev,
      { skill: currentGap.skill, context: currentGap.context, userDescription: '', bullets: [] },
    ])
    advanceGap()
  }

  function advanceGap() {
    setCurrentDesc('')
    setCurrentBullets([])
    if (gapIndex + 1 >= gaps.length) {
      setStep('generating')
      generateTailored()
    } else {
      setGapIndex((i) => i + 1)
    }
  }

  async function generateTailored(answersOverride?: GapAnswer[]) {
    setStep('generating')
    setError(null)
    try {
      const res = await fetch('/api/generate-tailored', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobApplicationId: job.id,
          gapAnswers: answersOverride ?? answers,
        }),
      })
      if (!res.ok) throw new Error('Tailoring failed')
      const data: { tailoredSections: TailoredSections } = await res.json()
      setTailoredSections(data.tailoredSections)
      setStep('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStep('gap-filling')
    }
  }

  async function saveVersion() {
    if (!tailoredSections) return
    setSaving(true)
    const res = await fetch(`/api/jobs/${job.id}/tailored-resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: saveLabel || null,
        tailoredSections,
        addedExperiences: answers.filter((a) => a.bullets.length > 0),
      }),
    })
    const saved = await res.json()
    setSavedId(saved.id)
    setSaving(false)
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">{job.companyName}</p>
        <h1 className="text-2xl font-bold text-gray-900">{job.jobTitle}</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Version history */}
      {job.tailoredResumes.length > 0 && step === 'idle' && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Previous versions</p>
          <div className="space-y-2">
            {job.tailoredResumes.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{r.label ?? 'Untitled version'}</span>
                <div className="flex items-center gap-3">
                  {r.atsScore !== null && (
                    <span
                      className={`font-semibold ${
                        r.atsScore >= 80
                          ? 'text-green-600'
                          : r.atsScore >= 60
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}
                    >
                      ATS {r.atsScore}
                    </span>
                  )}
                  <span className="text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: idle */}
      {step === 'idle' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4 text-sm">
            Claude will analyze gaps between your master resume and this job description, then help you fill them.
          </p>
          <button
            onClick={runGapAnalysis}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Tailoring Session
          </button>
        </div>
      )}

      {/* Step: analyzing */}
      {step === 'analyzing' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 text-sm">Analyzing gaps between your resume and the job description...</p>
        </div>
      )}

      {/* Step: gap-filling */}
      {step === 'gap-filling' && analysisResult && (
        <div className="space-y-6">
          {/* Matched skills summary */}
          {analysisResult.matched.length > 0 && gapIndex === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-800 mb-2">Already demonstrated in your resume</p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matched.map((m) => (
                  <span key={m} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${(gapIndex / gaps.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Gap {gapIndex + 1} of {gaps.length}
            </span>
          </div>

          {/* Current gap */}
          {currentGap && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {currentGap.required ? 'Required' : 'Nice to have'}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mt-2 mb-1">{currentGap.skill}</h2>
              <p className="text-sm text-gray-500 mb-4 italic">&ldquo;{currentGap.context}&rdquo;</p>

              <p className="text-sm font-medium text-gray-700 mb-2">
                Do you have relevant experience? Describe it briefly:
              </p>
              <textarea
                rows={4}
                value={currentDesc}
                onChange={(e) => setCurrentDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-3"
                placeholder="e.g. Led migration of 3 microservices to Kubernetes at previous company, reduced deploy time by 40%..."
              />

              {currentBullets.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-2">Generated bullets — edit if needed:</p>
                  <ul className="space-y-2">
                    {currentBullets.map((b, i) => (
                      <li key={i} className="text-sm text-blue-900 flex gap-2">
                        <span className="mt-0.5 text-blue-400">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={generateBullets}
                  disabled={!currentDesc.trim() || fillingBullets}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  {fillingBullets ? 'Writing bullets...' : currentBullets.length > 0 ? 'Regenerate' : 'Write Bullets'}
                </button>
                {currentBullets.length > 0 && (
                  <button
                    onClick={acceptCurrentGap}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept & Continue
                  </button>
                )}
                <button
                  onClick={skipCurrentGap}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: generating */}
      {step === 'generating' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 text-sm">Claude is writing your tailored resume...</p>
        </div>
      )}

      {/* Step: result */}
      {step === 'result' && tailoredSections && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tailored Resume Preview</h2>

            {/* Personal info */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-xl">{tailoredSections.personalInfo.name}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                {tailoredSections.personalInfo.email && <span>{tailoredSections.personalInfo.email}</span>}
                {tailoredSections.personalInfo.phone && <span>{tailoredSections.personalInfo.phone}</span>}
                {tailoredSections.personalInfo.linkedin && <span>{tailoredSections.personalInfo.linkedin}</span>}
                {tailoredSections.personalInfo.location && <span>{tailoredSections.personalInfo.location}</span>}
              </div>
            </div>

            {/* Work experience */}
            {tailoredSections.workExperiences.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Work Experience
                </h3>
                {tailoredSections.workExperiences.map((we) => (
                  <div key={we.id} className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-gray-900">{we.title}</p>
                      <p className="text-xs text-gray-400">
                        {we.startDate} – {we.endDate ?? 'Present'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{we.company}</p>
                    <ul className="space-y-1">
                      {we.bullets.map((b, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {tailoredSections.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills</h3>
                {Object.entries(
                  tailoredSections.skills.reduce<Record<string, string[]>>((acc, s) => {
                    acc[s.category] = [...(acc[s.category] ?? []), s.name]
                    return acc
                  }, {})
                ).map(([cat, names]) => (
                  <div key={cat} className="mb-1 text-sm">
                    <span className="font-medium text-gray-700">{cat}: </span>
                    <span className="text-gray-600">{names.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {tailoredSections.education.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Education</h3>
                {tailoredSections.education.map((e, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{e.degree}</p>
                    <p className="text-sm text-gray-600">{e.school}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {tailoredSections.projects.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Projects</h3>
                {tailoredSections.projects.map((p, i) => (
                  <div key={i} className="mb-3">
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    {p.description && <p className="text-sm text-gray-600 mb-1">{p.description}</p>}
                    <ul className="space-y-1">
                      {p.bullets.map((b, j) => (
                        <li key={j} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          {savedId ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              Version saved. Start a new tailoring session to generate another version.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <input
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='Label (e.g. "v1 - conservative") — optional'
              />
              <button
                onClick={saveVersion}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {saving ? 'Saving...' : 'Save Version'}
              </button>
              <button
                onClick={() => {
                  setStep('idle')
                  setAnalysisResult(null)
                  setTailoredSections(null)
                  setSavedId(null)
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
