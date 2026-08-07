import { cn } from "@/lib/utils";

const tones = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Low Stock": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Blocked: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Refunded: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "In Stock": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "Out of Stock": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function AdminStatusBadge({ children, className }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-meta font-semibold", tones[children] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200", className)}>{children}</span>;
}
