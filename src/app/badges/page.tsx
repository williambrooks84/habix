"use client";
import { useEffect, useState } from "react";
import { BadgeIcons } from "@/components/ui/icons";
import BadgesIllustration from "@/components/ui/badges/badges-illustration";

type Badge = {
  id: string;
  name: string;
  description: string;
  points_required: number;
  icon: keyof typeof BadgeIcons | null;
};

export default function BadgesPage() {
  

  return (
    <div className="px-6 py-8">
      <BadgesIllustration />
    </div>
  );
}