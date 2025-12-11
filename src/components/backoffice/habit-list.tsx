"use client"

import React from 'react'
import Loading from '@/components/ui/loading/loading'
import HabitRow from '../ui/backoffice/habit-row'
import { Habit } from '@/app/lib/definitions'
import UserFilter from '../ui/backoffice/user-filter'

export default function HabitList() {
  const [habits, setHabits] = React.useState<Habit[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)

  const loadHabits = React.useCallback(async (userId?: number | null) => {
    setLoading(true)
    setError(null)
    try {
      const url = userId ? `/api/admin/habits/user?userId=${userId}` : '/api/admin/habits'
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = body?.error || `Request failed with status ${res.status}`
        throw new Error(msg)
      }
      const data = await res.json()

      if (Array.isArray(data.habits)) {
        setHabits(data.habits)
      } else if (Array.isArray(data)) {
        setHabits(data as any)
      } else {
        setHabits([])
      }
    } catch (err: any) {
      console.error('Failed to fetch admin habits:', err)
      setError(err.message ?? 'Failed to load habits')
      setHabits([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    if (mounted) loadHabits(null)
    return () => { mounted = false }
  }, [loadHabits])

  React.useEffect(() => {
    let mounted = true
    const id = selectedUserId ? Number(selectedUserId) : null
    if (mounted) loadHabits(id)
    return () => { mounted = false }
  }, [selectedUserId, loadHabits])

  if (loading) return <div className="py-8"><Loading /></div>
  if (error) return <div className="p-6 text-center text-destructive"><span>{error}</span></div>

  return (
    <section className="flex flex-col gap-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label className="block text-sm text-foreground mb-1">Filtrer par utilisateur</label>
          <UserFilter selectedUserId={selectedUserId} onUserChange={setSelectedUserId} />
        </div>
        <div className="text-sm text-muted-foreground">
          {habits && <span>{habits.length} habitude(s)</span>}
        </div>
      </div>

      {habits && habits.length === 0 && (
        <span className="p-4 text-center text-muted-foreground">Aucune habitude</span>
      )}

      {habits?.map((h) => (
        <HabitRow key={String(h.id)} habit={h} />
      ))}
    </section>
  )
}
