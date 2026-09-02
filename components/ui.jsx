import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({ asChild, className, variant = "primary", size = "md", ...props }) {
  const Comp = asChild ? Link : "button";
  return <Comp className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

export function buttonClasses({ variant = "primary", size = "md" } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-tight transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "h-9 px-3.5 text-sm" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-primary text-white shadow-sm hover:bg-primary-container",
    variant === "secondary" && "bg-surface-container-low text-on-surface ring-1 ring-outline-variant hover:bg-surface-container",
    variant === "outline" && "border border-outline-variant bg-surface text-on-surface hover:border-primary/40 hover:bg-surface-container-low",
    variant === "ghost" && "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
    variant === "danger" && "bg-error text-on-error hover:bg-error-container hover:text-on-error-container"
  );
}

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-outline-variant/80 bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:bg-surface-container", className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, action, align = "left", className, titleClassName, descriptionClassName }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "flex flex-col justify-between gap-4 md:flex-row md:items-end", className)}>
      <div className={cn(centered ? "mx-auto" : "")}>
        {eyebrow ? <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
        <h1 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className={cn("max-w-4xl text-balance font-heading text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl", titleClassName)}>{title}</h1>
        {description ? <p className={cn("mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant", centered ? "mx-auto" : "", descriptionClassName)}>{description}</p> : null}
      </div>
      {action ? <div className={cn(centered ? "mt-5" : "shrink-0")}>{action}</div> : null}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action, align = "left", className }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-2xl text-center" : "flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow ? <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p> : null}
        <h2 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className="text-balance font-heading text-xl font-semibold tracking-tight text-on-surface">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm text-on-surface transition placeholder:text-on-surface-variant/80 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low",
        "aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error/30",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("min-h-28 w-full rounded-md border border-outline-variant bg-surface px-3.5 py-3 text-sm text-on-surface transition placeholder:text-on-surface-variant/80 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low", className)} {...props} />;
}

export function Select({ className, style, ...props }) {
  return (
    <span className="relative flex w-full">
      <select
        className={cn("h-10 w-full appearance-none rounded-md border border-outline-variant bg-surface py-0 pl-3.5 pr-10 text-sm font-medium text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low", className)}
        style={style}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
    </span>
  );
}

export function Label({ className, ...props }) {
  return <label className={cn("text-sm font-medium text-on-surface", className)} {...props} />;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-error">{children}</p>;
}

export function FilterTabs({ tabs, value, onChange }) {
  return (
    <div className="filter-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          data-active={value === tab.value}
          onClick={() => onChange(tab.value)}
          className="filter-tab"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function SourceBadge({ source }) {
  const key = source === "ingram" ? "ingram" : source === "mixed" ? "mixed" : "manual";
  const labels = { ingram: "Ingram", mixed: "Mixed", manual: "Manual" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium",
        key === "ingram" && "bg-primary/10 text-primary",
        key === "mixed" && "bg-violet-500/10 text-violet-700 dark:text-violet-300",
        key === "manual" && "bg-surface-container text-on-surface-variant"
      )}
    >
      {labels[key]}
    </span>
  );
}

const badgeTones = {
  Active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "In Stock": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Processing: "bg-primary/10 text-primary",
  Invoiced: "bg-primary/10 text-primary",
  Shipped: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Paused: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "Low Stock": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Refunded: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "On Hold": "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Backordered: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Voided: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Failed: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Blocked: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "Out of Stock": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  Synced: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "Not synced": "bg-surface-container text-on-surface-variant",
  slate: "bg-surface-container text-on-surface-variant",
};

export function Badge({ children, tone = "slate", className }) {
  return <span className={cn("inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium", badgeTones[tone] || badgeTones[children] || badgeTones.slate, className)}>{children}</span>;
}

export function Skeleton({ className, style }) {
  return <div className={cn("skeleton rounded-md", className)} style={style} />;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      {Icon ? (
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-surface-container-low text-on-surface-variant ring-1 ring-outline-variant">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      ) : (
        <div className="mb-3 size-1.5 rounded-full bg-primary" />
      )}
      <h3 className="font-heading text-lg font-semibold tracking-tight text-on-surface">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-on-surface-variant">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
