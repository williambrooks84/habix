import { cn } from "@/app/lib/utils";
import { ChartStatProps } from "@/types/ui";


export default function ChartStat({
  label,
  value,
  className,
}: ChartStatProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-1 px-6 py-4 sm:px-8 sm:py-6 text-center",
        className
      )}
    >
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="text-2xl font-bold text-primary">{value.toFixed(1)}%</span>
    </div>
  );
}