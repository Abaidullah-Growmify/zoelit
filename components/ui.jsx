import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({ asChild, className, variant = "primary", size = "md", ...props }) {
  const Comp = asChild ? Link : "button";
  return <Comp className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

export function buttonClasses({ variant = "primary", size = "md" } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "h-9 px-4 text-sm" : "h-11 px-5 text-sm",
    variant === "primary" && "bg-blue-700 text-white shadow-lg shadow-blue-700/20 hover:-translate-y-0.5 hover:bg-blue-800 dark:bg-blue-600 dark:text-white dark:shadow-blue-500/20 dark:hover:bg-blue-500",
    variant === "secondary" && "bg-slate-100 text-slate-950 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:ring-slate-700 dark:hover:bg-slate-700",
    variant === "outline" && "border border-slate-300 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:border-blue-500/60 dark:hover:bg-slate-800 dark:hover:text-white",
    variant === "ghost" && "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
    variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700"
  );
}

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-slate-200/90 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/95", className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, action, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "flex flex-col justify-between gap-5 md:flex-row md:items-end", className)}>
      <div className={cn(centered ? "mx-auto" : "")}>
        <h1 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className="max-w-4xl text-balance font-heading text-4xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl dark:text-white">{title}</h1>
        {description ? <p className={cn("mt-4 text-body font-regular leading-7 text-slate-600 dark:text-slate-300", centered ? "mx-auto max-w-2xl" : "max-w-2xl")}>{description}</p> : null}
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
        <h2 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className="text-balance font-heading text-h1 font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500",
        "aria-[invalid=true]:border-rose-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-rose-500/30 aria-[invalid=true]:shadow-[0_0_0_1px_rgba(244,63,94,0.12)] aria-[invalid=true]:text-slate-900 aria-[invalid=true]:focus:border-rose-500 aria-[invalid=true]:focus:ring-4 aria-[invalid=true]:focus:ring-rose-500/10 aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgba(244,63,94,0.12)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("min-h-28 w-full rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500", className)} {...props} />;
}

export function Select({ className, style, ...props }) {
  return (
    <span className="relative flex w-full">
      <select
        className={cn("h-11 w-full appearance-none rounded-sm border border-slate-300 bg-white py-0 pl-4 pr-11 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50", className)}
        style={style}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
    </span>
  );
}

export function Label({ className, ...props }) {
  return <label className={cn("text-body font-semibold text-slate-700 dark:text-slate-200", className)} {...props} />;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-rose-600">{children}</p>;
}

const badgeTones = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "In Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Invoiced: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Refunded: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Backordered: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Voided: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Failed: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Blocked: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "Out of Stock": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Synced: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "Not synced": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function Badge({ children, tone = "slate" }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-meta font-semibold", badgeTones[tone] || badgeTones[children] || badgeTones.slate)}>{children}</span>;
}

export function Skeleton({ className, style }) {
  return <div className={cn("skeleton rounded-lg", className)} style={style} />;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      {Icon ? (
        <div className="mb-5 grid size-14 place-items-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : (
        <div className="mb-4 size-1.5 rounded-full bg-blue-700 dark:bg-blue-300" />
      )}
      <h3 className="font-heading text-h2 font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 max-w-md text-body font-regular leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
