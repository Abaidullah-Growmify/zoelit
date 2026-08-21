import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const tones = {
  green: {
    glow: "bg-tertiary-container/10",
    icon: "bg-tertiary-container text-white ring-tertiary-container/20",
  },
  blue: {
    glow: "bg-primary-container/10",
    icon: "bg-primary-container text-white ring-primary-container/20",
  },
  purple: {
    glow: "bg-secondary-container/10",
    icon: "bg-secondary-container text-white ring-secondary-container/20",
  },
  amber: {
    glow: "bg-secondary-container/10",
    icon: "bg-secondary-container text-white ring-secondary-container/20",
  },
  red: {
    glow: "bg-error-container/10",
    icon: "bg-error-container text-white ring-error-container/20",
  },
  emerald: {
    glow: "bg-tertiary-container/10",
    icon: "bg-tertiary-container text-white ring-tertiary-container/20",
  },
  indigo: {
    glow: "bg-primary-container/10",
    icon: "bg-primary-container text-white ring-primary-container/20",
  },
  pink: {
    glow: "bg-secondary-container/10",
    icon: "bg-secondary-container text-white ring-secondary-container/20",
  },
  teal: {
    glow: "bg-tertiary-container/10",
    icon: "bg-tertiary-container text-white ring-tertiary-container/20",
  },
};

export function AdminStatCard({ label, value, icon: Icon, helper, tone = "blue", trend }) {
  const palette = tones[tone] || tones.blue;
  const trendPositive = trend?.direction !== "down";
  const TrendIcon = trendPositive ? ArrowUp : ArrowDown;

  return (
    <Card className="relative overflow-hidden p-5 shadow-primary-elevated transition duration-200 hover:-translate-y-0.5 hover:shadow-primary-elevated">
      <div className={cn("pointer-events-none absolute right-0 top-0 size-24 rounded-full blur-2xl", palette.glow)} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
          <p className="mt-2 font-heading text-headline-lg font-extrabold tabular-nums tracking-[-0.03em] text-on-surface">{value}</p>
        </div>
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-sm ring-1", palette.icon)}>
          <Icon className="size-5" />
        </span>
      </div>
      {(helper || trend) ? <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-4 text-label-sm font-semibold">
        {helper ? <p className="font-semibold text-on-surface-variant">{helper}</p> : <span />}
        {trend ? <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-semibold tabular-nums", trendPositive ? "bg-tertiary-container text-white" : "bg-error-container text-white")}>
          <TrendIcon className="size-3" aria-hidden="true" /> {trend.value}
        </span> : null}
      </div> : null}
    </Card>
  );
}
