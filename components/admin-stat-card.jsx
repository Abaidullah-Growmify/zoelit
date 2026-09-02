import { ArrowDown, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  blue: "bg-primary/10 text-primary",
  purple: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  red: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  indigo: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  pink: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  teal: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

export function AdminStatCard({ label, value, icon: Icon, helper, tone = "blue", trend }) {
  const iconClass = tones[tone] || tones.blue;
  const trendPositive = trend?.direction !== "down";
  const TrendIcon = trendPositive ? ArrowUp : ArrowDown;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-on-surface-variant">{label}</p>
          <p className="mt-1.5 truncate font-heading text-xl font-semibold tabular-nums tracking-tight text-on-surface">{value}</p>
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", iconClass)}>
          <Icon className="size-4" />
        </span>
      </div>
      {(helper || trend) ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          {helper ? <p className="text-on-surface-variant">{helper}</p> : <span />}
          {trend ? (
            <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 font-medium tabular-nums", trendPositive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300")}>
              <TrendIcon className="size-3" aria-hidden="true" /> {trend.value}
            </span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
