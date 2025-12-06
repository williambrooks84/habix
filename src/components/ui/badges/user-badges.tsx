"use client"

import React, { useEffect, useState } from 'react'
import { BadgeIcons } from '@/components/ui/icons'
import { UserBadge } from '@/app/lib/definitions'

export default function UserBadges({ className }: { className?: string }) {
  const [badges, setBadges] = useState<UserBadge[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/badges/user')
      .then((r) => r.json())
      .then((data) => {
        setBadges(data.badges ?? [])
        setLoading(false)
      })
      .catch(() => {
        setBadges([])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className={className}>Chargement des badges…</div>
  if (!badges || badges.length === 0) return <div className={className}>Aucun badge obtenu pour l'instant.</div>

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-6">Vos badges</h2>
      <div
        className="flex flex-wrap gap-1 justify-center w-full max-w-[360px] mx-auto"
      >
        {badges.map((b) => (
          <div
            key={b.id}
            className="flex flex-col items-center p-4"
          >
            {b.id && BadgeIcons[(b.id.charAt(0).toUpperCase() + b.id.slice(1)) as keyof typeof BadgeIcons]?.()}
            <div className="mt-2 text-base font-bold">{b.name}</div>
            <div className="text-sm text-primary">
              {b.description}
            </div>
            <div className="mt-1 text-xs text-gray">
              {b.awarded_at ? new Date(b.awarded_at).toLocaleDateString() : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
