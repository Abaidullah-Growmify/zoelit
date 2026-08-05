import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return <Card className="w-full max-w-md"><Skeleton className="h-8 w-28" /><Skeleton className="mt-8 h-9 w-40" /><Skeleton className="mt-6 h-11 w-full" /><Skeleton className="mt-4 h-11 w-full" /><Skeleton className="mt-6 h-11 w-full rounded-full" /></Card>;
}
