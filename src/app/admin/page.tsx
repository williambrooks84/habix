'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/loading/loading'

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null)

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

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
                    <p className="text-gray-600 mt-2">Vous n'avez pas les droits d'accès à cette page.</p>
                </div>
            </div>
        )
    }

    return (
        <main className="max-w-7xl mx-auto p-6">
            {/* <nav className="bg-primary text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Backoffice Admin</h1>
          <div className="text-sm">
            Connecté en tant que: <span className="font-semibold">{session?.user?.email}</span>
          </div>
        </div>
      </nav> */}
            <h1 className="text-3xl font-bold">Bienvenue, Admin</h1>
        </main>
    )
}
