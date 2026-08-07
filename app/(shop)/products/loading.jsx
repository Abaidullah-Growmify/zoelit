import { ProductGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return <section className="container-page py-12"><div className="mb-8"><div className="skeleton h-10 w-64 rounded-lg" /><div className="skeleton mt-4 h-5 w-96 max-w-full rounded-lg" /></div><ProductGridSkeleton count={8} /></section>;
}
