import { PageHeader } from "@/components/ui";

export function DashboardPageHeader(props) {
  return <PageHeader eyebrow="Customer workspace" className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/50" {...props} />;
}
