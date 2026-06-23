'use client'

import { useState } from 'react'
import { Education } from '@/types/resume'

interface Props {
  initialData: Education[]
}

const EMPTY_FORM = { school: '', degree: '', startDate: '', endDate: '' }

export function EducationSection({ initialData }: Props) {
  const [entries, setEntries] = useState<Education[]>(initialData)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openEdit = (entry: Education) => {
    setEditing(entry.id)
    setForm({
      school: entry.school,
      degree: entry.degree,
      startDate: entry.startDate ?? '',
      endDate: entry.endDate ?? '',
    })
    setIsAdding(false)
    setError(null)
  }

  const cancel = () => {
    setEditing(null)
    setIsAdding(false)
    setError(null)
  }

  const saveNew = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/resume/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const created: Education = await res.json()
      setEntries((e) => [...e, created])
      setIsAdding(false)
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/resume/education/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const updated: Education = await res.json()
      setEntries((e) => e.map((x) => (x.id === editing ? updated : x)))
      setEditing(null)
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/resume/education/${id}`, { method: 'DELETE' })
    setEntries((e) => e.filter((x) => x.id !== id))
    if (editing === id) setEditing(null)
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-5">
          {editing === entry.id ? (
            <EducationForm
              form={form}
              setForm={setForm}
              onSave={saveEdit}
              onCancel={cancel}
              saving={saving}
              error={error}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{entry.degree}</p>
                <p className="text-sm text-gray-600">
                  {entry.school}
                  {(entry.startDate || entry.endDate) && (
                    <> · {entry.startDate}–{entry.endDate ?? 'Present'}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(entry)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => deleteEntry(entry.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {isAdding && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <EducationForm
            form={form}
            setForm={setForm}
            onSave={saveNew}
            onCancel={cancel}
            saving={saving}
            error={error}
          />
        </div>
      )}

      {!isAdding && (
        <button
          onClick={() => { setIsAdding(true); setEditing(null); setForm(EMPTY_FORM); setError(null) }}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add Education
        </button>
      )}
    </div>
  )
}

function EducationForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  error,
}: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {([
          ['school', 'School / University'],
          ['degree', 'Degree / Field of Study'],
          ['startDate', 'Start Date'],
          ['endDate', 'End Date'],
        ] as const).map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
