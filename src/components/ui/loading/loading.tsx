import LoadingSpin from "./loading-spin";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpin size={64} className="mb-4" />
      <span className="text-2xl font-medium">Chargement...</span>
    </div>
  );
}