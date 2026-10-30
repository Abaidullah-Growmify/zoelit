import { Card } from "@/components/ui";

export function DashboardSectionBanner({ eyebrow, title, description, action }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface p-0 shadow-sm">
      <div className="flex min-h-[92px] flex-col justify-center gap-3 p-5 sm:min-h-[104px] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="font-heading text-lg font-bold tracking-tight text-on-surface sm:text-xl">{title}</h1>
          {description ? <p className="text-sm text-on-surface-variant">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </Card>
  );
}
