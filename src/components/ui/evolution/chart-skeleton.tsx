'use client';

export function ChartSkeleton() {
  return (
    <article 
      className="bg-background text-foreground py-4 sm:py-0 animate-pulse"
      aria-busy="true"
      aria-label="Chargement du graphique"
    >
      <div className="h-7 w-64 bg-muted rounded mb-3" />
      
      <div className="flex gap-6 px-2 mb-6">
        <div className="flex flex-col space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
        <div className="flex flex-col space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-8 w-16 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      </div>
      
      <div className="w-full h-[320px] bg-muted rounded" />
    </article>
  );
}
