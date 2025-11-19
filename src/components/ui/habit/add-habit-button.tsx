"use client";
import { useRouter } from "next/navigation";
import { Button } from "../button";
import { AddHabitIcon } from "../icons";

export default function AddHabitButton() {
    const router = useRouter();

    return (
        <Button variant="primaryOutline" size="icon" onClick={() => router.push('/habit/create')}>
            <AddHabitIcon />
            Nouvelle habitude
        </Button>
    );
}