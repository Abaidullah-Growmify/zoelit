import { PageHeader } from "@/components/ui";

export function AdminPageHeader(props) {
  return <PageHeader eyebrow="Admin workspace" className="panel-gradient rounded-lg border border-slate-200/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-slate-800/80" {...props} />;
}
