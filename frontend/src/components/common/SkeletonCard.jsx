export function SkeletonLine({ width = 'full', height = 'h-4' }) {
  const widths = { full: 'w-full', '3/4': 'w-3/4', '1/2': 'w-1/2', '1/3': 'w-1/3', '2/3': 'w-2/3' }
  return (
    <div className={`${widths[width] || 'w-full'} ${height} rounded-lg bg-light-border dark:bg-dark-border animate-pulse`} />
  )
}

export function SkeletonJobCard() {
  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
      <div className="p-5 space-y-3.5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-light-border dark:bg-dark-border animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <SkeletonLine width="3/4" height="h-4" />
            <SkeletonLine width="1/2" height="h-3" />
          </div>
          <div className="w-12 h-6 rounded-lg bg-light-border dark:bg-dark-border animate-pulse flex-shrink-0" />
        </div>
        {/* Meta */}
        <div className="flex gap-3">
          <SkeletonLine width="1/3" height="h-3" />
          <SkeletonLine width="1/4" height="h-3" />
        </div>
        {/* Description */}
        <SkeletonLine width="full" height="h-3" />
        <SkeletonLine width="2/3" height="h-3" />
        {/* Skills */}
        <div className="flex gap-1.5 pt-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 w-14 rounded-md bg-light-border dark:bg-dark-border animate-pulse" />
          ))}
        </div>
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-light-border dark:border-dark-border mt-1">
          <div className="h-8 w-8 rounded-lg bg-light-border dark:bg-dark-border animate-pulse" />
          <div className="h-8 flex-1 rounded-lg bg-light-border dark:bg-dark-border animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-light-border dark:bg-dark-border animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTaskRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 animate-pulse">
      <div className="w-4 h-4 rounded-full bg-light-border dark:bg-dark-border flex-shrink-0" />
      <SkeletonLine width="full" height="h-3.5" />
    </div>
  )
}
