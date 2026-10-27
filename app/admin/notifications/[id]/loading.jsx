import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return <div className="mx-auto max-w-4xl space-y-5"><Skeleton className="h-5 w-40" /><Card className="h-96" /></div>;
}
