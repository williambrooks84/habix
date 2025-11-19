import { NoHabitIcon } from "../icons";

export default function NoHabit() {
    return (
        <div className="flex flex-col justify-center items-center border-2 border-gray rounded-3xl mx-6 py-9 gap-3">
            <NoHabitIcon />
            <p className="text-gray text-center text-lg w-fit">Vous n'avez pas encore d'habitudes</p>
        </div>
    )
}