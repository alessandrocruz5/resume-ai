'use client'

import { useState } from 'react'
import { Skill } from '@/types/resume'

interface Props {
  initialData: Skill[]
}

export function SkillsSection({ initialData }: Props) {
  const [skills, setSkills] = useState<Skill[]>(initialData)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [customCategory, setCustomCategory] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = Array.from(new Set(skills.map((s) => s.category))).sort()

  const addSkill = async () => {
    if (!newName.trim()) return
    setAdding(true)
    setError(null)
    try {
      const resolvedCategory = newCategory === '__new__'
        ? (customCategory.trim() || 'General')
        : newCategory
      const res = await fetch('/api/resume/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), category: resolvedCategory }),
      })
      if (!res.ok) throw new Error()
      const skill: Skill = await res.json()
      setSkills((s) => [...s, skill])
      setNewName('')
      if (newCategory === '__new__') {
        setNewCategory(resolvedCategory)
        setCustomCategory('')
      }
    } catch {
      setError('Failed to add skill.')
    } finally {
      setAdding(false)
    }
  }

  const deleteSkill = async (id: string) => {
    await fetch(`/api/resume/skills/${id}`, { method: 'DELETE' })
    setSkills((s) => s.filter((x) => x.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addSkill()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Skills</h2>

      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {skills
              .filter((s) => s.category === cat)
              .map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  {skill.name}
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="text-gray-400 hover:text-red-500 leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        </div>
      ))}

      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Add Skill</p>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skill name"
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {!categories.includes('General') && <option value="General">General</option>}
            <option value="__new__">New category…</option>
          </select>
          {newCategory === '__new__' && (
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Category name"
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            />
          )}
          <button
            onClick={addSkill}
            disabled={adding || !newName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}
