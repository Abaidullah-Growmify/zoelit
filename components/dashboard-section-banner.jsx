import { Card } from "@/components/ui";

export function DashboardSectionBanner({ eyebrow, title, description, action }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-0 shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:p-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2 text-sm text-on-surface-variant">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}
