"use client"

import React from 'react'
import { AnyUser, UserFilterProps } from '@/types/ui'

export default function UserFilter({ selectedUserId, onUserChange }: UserFilterProps) {
  const [users, setUsers] = React.useState<AnyUser[] | null>(null)
  const [loading, setLoading] = React.useState(true)

  const userDisplayName = (u: AnyUser) => {
    const first = u.first_name ?? u.firstName ?? ''
    const last = u.last_name ?? u.lastName ?? ''
    const name = `${first} ${last}`.trim()
    return name || u.email || `#${u.id}`
  }

  React.useEffect(() => {
    let mounted = true
    async function loadUsers() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Request failed with status ${res.status}`)
        }
        const data = await res.json()
        if (mounted) setUsers(data.users ?? [])
      } catch (err: any) {
        console.error('Failed to fetch admin users:', err)
        if (mounted) setUsers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadUsers()
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="h-10 bg-background rounded-3xl animate-pulse" />

  return (
    <div className="inline-block max-w-xs sm:max-w-none">
      <select
        className="w-full sm:w-auto border-3 border-primary rounded-3xl px-3 py-2 text-foreground bg-background"
        value={selectedUserId ?? ''}
        onChange={(e) => onUserChange(e.target.value || null)}
      >
        <option value="">Tous les utilisateurs</option>
        {users?.map((u) => {
          const displayText = `${userDisplayName(u)} (${u.email})`
          return (
            <option key={String(u.id)} value={String(u.id)} title={displayText}>
              {displayText}
            </option>
          )
        })}
      </select>
    </div>
  )
}