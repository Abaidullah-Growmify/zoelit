import { CartSkeleton } from "@/components/skeletons";
import { Card } from "@/components/ui";

export default function Loading() {
  return <section className="container-page py-12"><div className="skeleton h-10 w-40 rounded-lg" /><Card className="mt-8"><CartSkeleton /></Card></section>;
}
