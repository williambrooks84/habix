import CreateHabitForm from "@/components/habit/create-form";
import Categories from '@/components/ui/habit/categories';
import { getAllCategories } from '@/app/lib/categories';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import Loading from '@/components/ui/loading/loading';

export default async function CreateHabitPage() {
    const categories = await getAllCategories();

    return (
        <div className="flex flex-col px-6">
            <h1 className="text-2xl font-semibold text-foreground">Créer une habitude</h1>

            <section className="mt-6 mb-22 md:flex md:flex-col md:items-center">
                <Suspense fallback={<Loading />}>
                    <CreateHabitForm categories={categories} />
                </Suspense>
            </section>
        </div>
    );
}