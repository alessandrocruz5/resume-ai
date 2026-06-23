'use client'

import { useState } from 'react'
import { Project, ProjectStatus } from '@/types/resume'

const STATUS_OPTIONS: ProjectStatus[] = ['in progress', 'in production', 'beta testing', 'proof of concept']

const STATUS_COLORS: Record<ProjectStatus, string> = {
  'in production':    'bg-green-100 text-green-700',
  'beta testing':     'bg-blue-100 text-blue-700',
  'in progress':      'bg-yellow-100 text-yellow-700',
  'proof of concept': 'bg-gray-100 text-gray-600',
}

interface Props {
  initialData: Project[]
}

const EMPTY_FORM = { name: '', description: '', url: '', status: '' as ProjectStatus | '', bullets: [''] }

export function ProjectsSection({ initialData }: Props) {
  const [entries, setEntries] = useState<Project[]>(initialData)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openEdit = (entry: Project) => {
    setEditing(entry.id)
    setForm({
      name: entry.name,
      description: entry.description ?? '',
      url: entry.url ?? '',
      status: entry.status ?? '',
      bullets: entry.bullets.length ? entry.bullets : [''],
    })
    setIsAdding(false)
    setError(null)
  }

  const cancel = () => {
    setEditing(null)
    setIsAdding(false)
    setError(null)
  }

  const setBullet = (i: number, v: string) =>
    setForm((f) => ({ ...f, bullets: f.bullets.map((b, idx) => (idx === i ? v : b)) }))

  const addBullet = () => setForm((f) => ({ ...f, bullets: [...f.bullets, ''] }))

  const removeBullet = (i: number) =>
    setForm((f) => ({ ...f, bullets: f.bullets.filter((_, idx) => idx !== i) }))

  const saveNew = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/resume/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: form.status || null, bullets: form.bullets.filter(Boolean) }),
      })
      if (!res.ok) throw new Error()
      const created: Project = await res.json()
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
      const res = await fetch(`/api/resume/projects/${editing}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: form.status || null, bullets: form.bullets.filter(Boolean) }),
      })
      if (!res.ok) throw new Error()
      const updated: Project = await res.json()
      setEntries((e) => e.map((x) => (x.id === editing ? updated : x)))
      setEditing(null)
    } catch {
      setError('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/resume/projects/${id}`, { method: 'DELETE' })
    setEntries((e) => e.filter((x) => x.id !== id))
    if (editing === id) setEditing(null)
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-5">
          {editing === entry.id ? (
            <ProjectForm
              form={form}
              setForm={setForm}
              setBullet={setBullet}
              addBullet={addBullet}
              removeBullet={removeBullet}
              onSave={saveEdit}
              onCancel={cancel}
              saving={saving}
              error={error}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">{entry.name}</p>
                  {entry.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[entry.status]}`}>
                      {entry.status}
                    </span>
                  )}
                  {entry.url && (
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      Link
                    </a>
                  )}
                </div>
                {entry.description && (
                  <p className="text-sm text-gray-600 mt-0.5">{entry.description}</p>
                )}
                {entry.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    {entry.bullets.map((b, i) => (
                      <li key={i} className="text-sm text-gray-700">{b}</li>
                    ))}
                  </ul>
                )}
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
          <ProjectForm
            form={form}
            setForm={setForm}
            setBullet={setBullet}
            addBullet={addBullet}
            removeBullet={removeBullet}
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
          + Add Project
        </button>
      )}
    </div>
  )
}

function ProjectForm({
  form,
  setForm,
  setBullet,
  addBullet,
  removeBullet,
  onSave,
  onCancel,
  saving,
  error,
}: {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  setBullet: (i: number, v: string) => void
  addBullet: () => void
  removeBullet: (i: number) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  error: string | null
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://…"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status (optional)</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus | '' }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— none —</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bullets</label>
        <div className="space-y-2">
          {form.bullets.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={b}
                onChange={(e) => setBullet(i, e.target.value)}
                placeholder="Describe what you built or achieved…"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => removeBullet(i)}
                className="text-gray-400 hover:text-red-500 px-2"
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={addBullet} className="text-sm text-blue-600 hover:text-blue-800">
            + Add bullet
          </button>
        </div>
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
