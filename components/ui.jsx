import Link from "next/link";
import { cn } from "@/lib/utils";

export function Button({ asChild, className, variant = "primary", size = "md", ...props }) {
  const Comp = asChild ? Link : "button";
  return <Comp className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

export function buttonClasses({ variant = "primary", size = "md" } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-[-0.01em] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "h-9 px-4 text-sm" : "h-11 px-5 text-sm",
    variant === "primary" && "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
    variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
    variant === "outline" && "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800",
    variant === "ghost" && "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700"
  );
}

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white p-6 soft-shadow dark:border-slate-800 dark:bg-slate-900", className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, action, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "flex flex-col justify-between gap-5 md:flex-row md:items-end", className)}>
      <div className={cn(centered ? "mx-auto" : "")}>
        {eyebrow ? <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{eyebrow}</p> : null}
        <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-[-0.02em] text-slate-950 sm:text-5xl dark:text-white">{title}</h1>
        {description ? <p className={cn("mt-3 text-sm font-normal leading-6 text-slate-500 dark:text-slate-400", centered ? "mx-auto max-w-2xl" : "max-w-2xl")}>{description}</p> : null}
      </div>
      {action ? <div className={cn(centered ? "mt-6" : "shrink-0")}>{action}</div> : null}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-2xl text-center" : "flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">{eyebrow}</p> : null}
        <h2 className="mt-2 font-heading text-3xl font-bold tracking-[-0.02em] text-slate-950 dark:text-white">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn("h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50", className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("min-h-28 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50", className)} {...props} />;
}

export function Select({ className, style, ...props }) {
  return (
    <select
      className={cn("h-11 appearance-none rounded-lg border border-slate-200 bg-white bg-no-repeat py-0 pl-4 pr-11 text-sm text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50", className)}
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 1rem center",
        backgroundSize: "1rem",
        ...style,
      }}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return <label className={cn("text-sm font-semibold text-slate-700 dark:text-slate-200", className)} {...props} />;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-rose-600">{children}</p>;
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    Processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    Shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    Cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tones[tone] || tones[children] || tones.slate)}>{children}</span>;
}

export function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-blue-50 text-3xl dark:bg-blue-500/10">•</div>
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm font-normal leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
