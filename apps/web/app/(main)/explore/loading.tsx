import { Skeleton } from '@/components/ui/skeleton'

export default function ExploreLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 space-y-3 border-b px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="min-h-0 flex-1">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    </div>
  )
}
