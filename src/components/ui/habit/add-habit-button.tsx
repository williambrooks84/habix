"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "../button";
import { AddHabitIcon } from "../icons";

export default function AddHabitButton() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) return null;

  return (
    <div aria-hidden={false} className="fixed bottom-6 right-6 z-50 bg-background rounded-4xl">
      <div className="pointer-events-auto">
        <Button variant="primaryOutline" size="icon" onClick={() => router.push('/habit/create')}>
          <AddHabitIcon />
          Créer
        </Button>
      </div>
    </div>
  );
}