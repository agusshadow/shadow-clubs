export default function PendingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-full flex-col items-center justify-center px-4">
      {children}
    </div>
  )
}
