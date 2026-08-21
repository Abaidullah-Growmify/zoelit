import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({ asChild, className, variant = "primary", size = "md", ...props }) {
  const Comp = asChild ? Link : "button";
  return <Comp className={cn(buttonClasses({ variant, size }), className)} {...props} />;
}

export function buttonClasses({ variant = "primary", size = "md" } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-[0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "h-9 px-4 text-label-sm" : "h-11 px-5 text-label-md",
    variant === "primary" && "bg-primary text-white shadow-primary-elevated hover:-translate-y-0.5 hover:bg-primary-container",
    variant === "secondary" && "bg-surface-container-low text-on-surface ring-1 ring-outline-variant hover:bg-surface-container",
    variant === "outline" && "border border-outline-variant bg-surface-container-lowest text-on-surface hover:-translate-y-0.5 hover:border-primary hover:bg-surface-container-low",
    variant === "ghost" && "text-on-surface-variant hover:bg-surface-container-low",
    variant === "danger" && "bg-error text-on-error hover:bg-error-container hover:text-on-error-container"
  );
}

export function Card({ className, ...props }) {
  return <div className={cn("rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-primary-elevated dark:bg-surface-container", className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, action, align = "left", className, titleClassName, descriptionClassName }) {
  const centered = align === "center";
  return (
    <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "flex flex-col justify-between gap-5 md:flex-row md:items-end", className)}>
      <div className={cn(centered ? "mx-auto" : "")}>
        <h1 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className={cn("max-w-4xl text-balance font-heading text-headline-lg-mobile font-bold tracking-[-0.02em] text-on-surface sm:text-headline-lg", titleClassName)}>{title}</h1>
        {description ? <p className={cn("mt-4 max-w-2xl text-body-md font-normal leading-7 text-on-surface-variant", centered ? "mx-auto" : "", descriptionClassName)}>{description}</p> : null}
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
        <h2 aria-label={eyebrow ? `${eyebrow}: ${title}` : undefined} className="text-balance font-heading text-headline-md font-semibold tracking-[-0.03em] text-on-surface">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-4 text-label-md text-on-surface transition placeholder:text-on-surface-variant focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low dark:placeholder:text-on-surface-variant",
        "aria-[invalid=true]:border-error aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-error/30 aria-[invalid=true]:shadow-[0_0_0_1px_rgb(186_26_26_/_0.12)] aria-[invalid=true]:text-on-surface aria-[invalid=true]:focus:border-error aria-[invalid=true]:focus:ring-4 aria-[invalid=true]:focus:ring-error/10 aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgb(186_26_26_/_0.12)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("min-h-28 w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-4 py-3 text-label-md font-semibold text-on-surface transition placeholder:text-on-surface-variant focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low dark:placeholder:text-on-surface-variant", className)} {...props} />;
}

export function Select({ className, style, ...props }) {
  return (
    <span className="relative flex w-full">
      <select
          className={cn("h-11 w-full appearance-none rounded-sm border border-outline-variant bg-surface-container-lowest py-0 pl-4 pr-11 text-label-md font-semibold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low", className)}
        style={style}
        {...props}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
    </span>
  );
}

export function Label({ className, ...props }) {
  return <label className={cn("text-label-md font-semibold text-on-surface", className)} {...props} />;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-label-sm text-error">{children}</p>;
}

const badgeTones = {
  Active: "bg-tertiary-container text-on-tertiary",
  Approved: "bg-tertiary-container text-on-tertiary",
  Delivered: "bg-tertiary-container text-on-tertiary",
  Paid: "bg-tertiary-container text-on-tertiary",
  "In Stock": "bg-tertiary-container text-on-tertiary",
  Processing: "bg-primary-container text-on-primary-container",
  Invoiced: "bg-primary-container text-on-primary-container",
  Shipped: "bg-secondary-container text-on-secondary-container",
  Pending: "bg-secondary-container text-on-secondary-container",
  Paused: "bg-secondary-container text-on-secondary-container",
  "Low Stock": "bg-secondary-container text-on-secondary-container",
  Refunded: "bg-secondary-container text-on-secondary-container",
  "On Hold": "bg-secondary-container text-on-secondary-container",
  Backordered: "bg-secondary-container text-on-secondary-container",
  Cancelled: "bg-error-container text-on-error-container",
  Voided: "bg-error-container text-on-error-container",
  Failed: "bg-error-container text-on-error-container",
  Blocked: "bg-error-container text-on-error-container",
  Rejected: "bg-error-container text-on-error-container",
  "Out of Stock": "bg-error-container text-on-error-container",
  Synced: "bg-tertiary-container text-on-tertiary",
  "Not synced": "bg-surface-container text-on-surface-variant",
  slate: "bg-surface-container text-on-surface-variant",
};

export function Badge({ children, tone = "slate" }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-label-sm font-semibold uppercase tracking-[0.12em]", badgeTones[tone] || badgeTones[children] || badgeTones.slate)}>{children}</span>;
}

export function Skeleton({ className, style }) {
  return <div className={cn("skeleton rounded-lg", className)} style={style} />;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      {Icon ? (
        <div className="mb-5 grid size-14 place-items-center rounded-lg bg-surface-container text-on-surface-variant ring-1 ring-outline-variant">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      ) : (
        <div className="mb-4 size-1.5 rounded-full bg-primary" />
      )}
      <h3 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">{title}</h3>
      <p className="mt-2 max-w-md text-body-md font-normal leading-6 text-on-surface-variant">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
