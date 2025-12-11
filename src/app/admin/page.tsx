'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/loading/loading'
import { Button } from '@/components/ui/button'
import UserList from '@/components/backoffice/user-list'
import HabitList from '@/components/backoffice/habit-list'
import Toggle from '@/components/ui/backoffice/toggle'

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null)
    const [tab, setTab] = React.useState<'users' | 'habits'>('users')

    const checkAdminStatus = React.useCallback(async () => {
        if (!session?.user) return

        try {
            const response = await fetch('/api/admin/check')
            const data = await response.json()
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin) {
                router.push('/')
            }
        } catch (error) {
            console.error('Error checking admin status:', error)
            setIsAdmin(false)
            router.push('/')
        }
    }, [session, router])

    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }

        if (status === 'authenticated' && session?.user) {
            checkAdminStatus()
        }
    }, [status, session, checkAdminStatus, router])

    if (status === 'loading' || isAdmin === null) {
        return <Loading />
    }

    return (
        <main className="flex flex-col sm:max-w-7xl mx-auto p-6 mb-6 gap-6">
            <h1 className="text-3xl font-bold">Backoffice</h1>

            <Toggle value={tab} onChange={setTab} />

            {tab === 'users' ? (
                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Utilisateurs</h2>
                    <UserList />
                </section>
            ) : (
                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Habitudes</h2>
                    <HabitList />
                </section>
            )}
        </main>
    )
}
