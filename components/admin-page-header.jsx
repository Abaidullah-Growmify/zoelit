import { PageHeader } from "@/components/ui";

export function AdminPageHeader(props) {
  return <PageHeader eyebrow="Admin workspace" className="panel-gradient rounded-lg border border-outline-variant/80 p-6 shadow-primary-elevated" {...props} />;
}
