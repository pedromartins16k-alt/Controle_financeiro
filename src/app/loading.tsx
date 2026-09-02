export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-paper">
      <div className="flex-1 px-4 py-6 md:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-border/60 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-border/40 animate-pulse" />
        </div>

        {/* 4 Cards skeleton */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-paper-raised p-4 animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 rounded bg-border/60" />
                <div className="h-4 w-12 rounded bg-border/40" />
              </div>
              <div className="h-7 w-28 rounded bg-border/80" />
            </div>
          ))}
        </div>

        {/* Chart & Donut skeleton */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 h-72 rounded-xl border border-border bg-paper-raised p-6 animate-pulse" />
          <div className="h-72 rounded-xl border border-border bg-paper-raised p-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
