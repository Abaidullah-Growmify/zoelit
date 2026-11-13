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
    <Card className="overflow-hidden p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-xs font-medium leading-4 text-on-surface-variant sm:text-sm sm:leading-5">{label}</p>
          <p className="mt-1.5 truncate font-heading text-base font-semibold tabular-nums tracking-tight text-on-surface sm:text-xl">{value}</p>
        </div>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg sm:size-9", iconClass)}>
          <Icon className="size-3.5 sm:size-4" />
        </span>
      </div>
      {(helper || trend) ? (
        <div className="mt-2 flex items-start justify-between gap-2 text-xs sm:mt-3 sm:items-center sm:gap-3 sm:text-sm">
          {helper ? <p className="min-w-0 break-words leading-4 text-on-surface-variant sm:leading-5">{helper}</p> : <span />}
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
