'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import HabitList from '@/components/habit/habit-list';
import Loading from '@/components/ui/loading';
import HomeDisconnected from '@/components/home-disconnected';
import NoHabit from '@/components/ui/habit/no-habit';
import AddHabbitButton from '@/components/ui/habit/add-habit-button';
import { pickIconByName } from '../lib/pick-icon-by-name';

export default function HabitPage() {
    const { data: session, status } = useSession();

    const [loadingHabits, setLoadingHabits] = React.useState(false);
    const [habits, setHabits] = React.useState<any[] | null>(null);

    React.useEffect(() => {
        if (!session) return;
        let mounted = true;
        async function load() {
            setLoadingHabits(true);
            try {
                const res = await fetch('/api/habits', { credentials: 'include' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const body = await res.json();
                if (!mounted) return;
                setHabits(body.habits ?? []);
            } catch {
                if (!mounted) return;
                setHabits([]);
            } finally {
                if (mounted) setLoadingHabits(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [session]);

    if (status === 'loading') return <Loading />;

    if (!session) return <HomeDisconnected />;

    if (loadingHabits) return <Loading />;

    const hasHabits = Array.isArray(habits) && habits.length > 0;
    return (
        <main className="w-full mx-auto px-6 py-8 grid gap-8">
            <section aria-labelledby="habits-section" className="flex flex-col justify-center gap-9">
                {hasHabits ? (
                    <>
                        <HabitList
                            items={habits.map((h: any) => ({
                                id: h.id,
                                name: h.name,
                                Icon: pickIconByName(h.category?.name ?? ''),
                                subtitle: h.category?.name ?? undefined,
                                onClick: () => { },
                                motivation: h.motivation,
                                periodStart: h.periodStart ?? null,
                                periodEnd: h.periodEnd ?? null,
                            }))}
                        />
                        <AddHabbitButton />
                    </>
                ) : (
                    <>
                        <NoHabit />
                        <AddHabbitButton />
                    </>
                )}
            </section>
        </main>
    )
}