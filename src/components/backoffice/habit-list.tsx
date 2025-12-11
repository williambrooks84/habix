"use client"

import React from 'react'
import Loading from '@/components/ui/loading/loading'
import HabitRow from '../ui/backoffice/habit-row'
import { Habit } from '@/app/lib/definitions'

export default function HabitList() {
  const [habits, setHabits] = React.useState<Habit[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/habits')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const msg = body?.error || `Request failed with status ${res.status}`
          throw new Error(msg)
        }
        const data = await res.json()
        if (mounted) setHabits(data.habits ?? [])
      } catch (err: any) {
        console.error('Failed to fetch admin habits:', err)
        if (mounted) setError(err.message ?? 'Failed to load habits')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [])

  if (loading) return <div className="py-8"><Loading /></div>
  if (error) return <div className="p-6 text-center text-destructive"><span>{error}</span></div>

  return (
    <section className="flex flex-col gap-6 space-y-3">
      {habits && habits.length === 0 && (
        <span className="p-4 text-center text-muted-foreground">Aucune habitude</span>
      )}

      {habits?.map((h) => (
        <HabitRow key={String(h.id)} habit={h} />
      ))}
    </section>
  )
}
