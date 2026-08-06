import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const tones = {
  green: {
    glow: "bg-emerald-500/10",
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  blue: {
    glow: "bg-blue-500/10",
    icon: "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  },
  purple: {
    glow: "bg-purple-500/10",
    icon: "bg-purple-50 text-purple-700 ring-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/20",
  },
  amber: {
    glow: "bg-amber-500/10",
    icon: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
  red: {
    glow: "bg-rose-500/10",
    icon: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  },
};

export function AdminStatCard({ label, value, icon: Icon, helper, tone = "blue", trend }) {
  const palette = tones[tone] || tones.blue;
  const trendPositive = trend?.direction !== "down";

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("pointer-events-none absolute right-0 top-0 size-24 rounded-full blur-2xl", palette.glow)} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-heading text-3xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl ring-1", palette.icon)}>
          <Icon className="size-5" />
        </span>
      </div>
      {(helper || trend) ? <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-semibold dark:border-slate-800">
        {helper ? <p className="text-slate-500 dark:text-slate-400">{helper}</p> : <span />}
        {trend ? <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-black", trendPositive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300")}>
          {trendPositive ? "↑" : "↓"} {trend.value}
        </span> : null}
      </div> : null}
    </Card>
  );
}
