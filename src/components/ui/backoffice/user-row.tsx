"use client"

import React from 'react'
import { Button } from '../button'
import { BlockIcon, CheckIconValid } from '../icons'

type AnyUser = Record<string, any>

export default function UserRow({ user }: { user: AnyUser }) {
  const firstName = user.firstName ?? user.first_name ?? ''
  const lastName = user.lastName ?? user.last_name ?? ''
  const fullName = `${firstName} ${lastName}` || '-'
  const created = user.createdAt ?? user.created_at ?? null
  const isAdmin = (user.is_admin ?? user.isAdmin) === true
  const [blocked, setBlocked] = React.useState<boolean>((user.is_blocked ?? user.isBlocked) === true)
  const [busy, setBusy] = React.useState(false)

  async function toggleBlock() {
    if (!user?.id) return
    setBusy(true)
    try {
      const action = blocked ? 'unblock' : 'block'
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Request failed ${res.status}`)
      }

      setBlocked(!blocked)
    } catch (err) {
      console.error('Failed to update block status:', err)
      alert('Failed to update user block status')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 sm:gap-4 border-3 border-primary rounded-2xl p-6"
    >
      <div className="sm:hidden text-center w-full">
        <span className="text-xl font-semibold block text-foreground">{fullName}</span>
      </div>

      <div className="w-full sm:w-1/3">
        <span className="block text-sm text-muted-foreground sm:hidden">Email</span>
        <span className="block font-medium truncate text-foreground">{user.email}</span>
      </div>

      <span className="w-full sm:w-1/4 hidden sm:block text-sm text-foreground">{fullName}</span>

      <div className="w-full sm:w-1/6 text-sm">
        <span className="block text-sm text-muted-foreground sm:hidden">Rôle</span>
        <span className={isAdmin ? 'text-primary font-medium text-base' : 'text-muted-foreground sm:text-foreground text-base'}>{isAdmin ? 'Admin' : 'Utilisateur'}</span>
      </div>

      <div className="w-full sm:w-1/6 text-sm text-muted-foreground">
        <span className="block text-sm text-muted-foreground sm:hidden">Points</span>
        <span className="text-foreground text-base">{user.points ?? 0} pts</span>
      </div>

      <div className="w-full sm:w-1/6 text-sm text-muted-foreground">
        <span className="block text-sm text-muted-foreground sm:hidden">Créé le</span>
        <span className="text-foreground text-base">{created ? new Date(created).toLocaleString() : '-'}</span>
      </div>

      <div className="w-full sm:w-1/6 flex items-center justify-center sm:justify-end pt-4 gap-2">
        <Button
          variant={blocked ? 'transparent' : 'transparent'}
          size="small"
          onClick={toggleBlock}
          disabled={busy}
          title={blocked ? 'Débloquer utilisateur' : 'Bloquer utilisateur'}
          aria-label={blocked ? 'Débloquer utilisateur' : 'Bloquer utilisateur'}
        >
          {blocked ? (
            <>
              <CheckIconValid />
              <span className="ml-2">Débloquer</span>
            </>
          ) : (
            <>
              <BlockIcon />
              <span className="ml-2">Bloquer</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
