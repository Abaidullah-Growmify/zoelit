import { PageHeader } from "@/components/ui";

export function DashboardPageHeader(props) {
  return <PageHeader eyebrow="Customer workspace" className="panel-gradient rounded-lg border border-outline-variant/80 p-6 shadow-primary-elevated" titleClassName="text-headline-lg-mobile font-bold sm:text-headline-lg" {...props} />;
}
