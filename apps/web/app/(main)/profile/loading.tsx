import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="flex min-h-full flex-col pb-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 border-b px-4 pt-8 pb-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>

        {/* Sections */}
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
