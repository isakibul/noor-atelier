export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="skeleton-shimmer h-72 w-full" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-2.5 w-28 rounded" />
              <div className="skeleton-shimmer h-4 w-44 rounded" />
            </div>
            <div className="skeleton-shimmer h-4 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
