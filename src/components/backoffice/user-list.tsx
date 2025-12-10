"use client"

import React from 'react'
import Loading from '@/components/ui/loading/loading'
import UserRow from './user-row'
import { User } from '@/app/lib/definitions'

export default function UserList() {
    const [users, setUsers] = React.useState<User[] | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        let mounted = true

        async function load() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch('/api/admin/users')
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    const msg = body?.error || `Request failed with status ${res.status}`
                    throw new Error(msg)
                }
                const data = await res.json()
                if (mounted) setUsers(data.users ?? [])
            } catch (err: any) {
                console.error('Failed to fetch admin users:', err)
                if (mounted) setError(err.message ?? 'Failed to load users')
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
        <div className="space-y-3">
            <div className="w-full hidden sm:flex items-center px-4 py-2 text-md font-medium">
                <span className="sm:w-1/3">Email</span>
                <span className="sm:w-1/4">Nom</span>
                <span className="sm:w-1/6">Admin</span>
                <span className="sm:w-1/6">Points</span>
                <span className="sm:w-1/6">Créé le</span>
            </div>

            {users && users.length === 0 && (
                <span className="p-4 text-center text-muted-foreground">Aucun utilisateur</span>
            )}

            {users?.map((u) => (
                <UserRow key={String(u.id)} user={u} />
            ))}
        </div>
    )
}