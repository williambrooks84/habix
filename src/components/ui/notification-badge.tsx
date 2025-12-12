import { NotificationBadgeProps } from "@/types/ui";

export default function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute top-0 -right-1 bg-destructive text-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
      {count > 9 ? '9+' : count}
    </span>
  );
}
