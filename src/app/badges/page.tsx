"use client";
import BadgesIllustration from "@/components/ui/badges/badges-illustration";
import UserBadges from "@/components/ui/badges/user-badges";

export default function BadgesPage() {
  

  return (
    <section className="flex flex-col px-6 py-8 gap-6">
      <UserBadges />
      <BadgesIllustration />
    </section>
  );
}