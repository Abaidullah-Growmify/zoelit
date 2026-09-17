import { cn } from "@/lib/utils";

export function PriorityToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        checked ? "border-primary bg-primary" : "border-outline-variant bg-surface-container-low"
      )}
    >
      <span className={cn("size-4 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-1")} />
    </button>
  );
}
