export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-3/4 mb-3 rounded" />
      <div className="skeleton h-3 w-1/2 mb-2 rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <div className="skeleton h-4 w-8 rounded" />
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card">
      <div className="skeleton h-3 w-20 mb-2 rounded" />
      <div className="skeleton h-8 w-16 mb-1 rounded" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}
