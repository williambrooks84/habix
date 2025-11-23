import CreateHabitForm from "@/components/habit/create-form";
import Categories from '@/components/ui/habit/categories';
import { getAllCategories } from '@/app/lib/categories';
import { Button } from '@/components/ui/button';

export default async function CreateHabitPage() {
    const categories = await getAllCategories();

    return (
        <div className="flex flex-col px-6">
            <h1 className="text-2xl font-semibold text-foreground">Créer une habitude</h1>

            <section className="mt-6">
                <CreateHabitForm categories={categories} />
            </section>
        </div>
    );
}