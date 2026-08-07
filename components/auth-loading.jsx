import { Loader2 } from "lucide-react";

export function AuthLoading({ label = "Loading secure access..." }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-white p-4 text-center dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(37,99,235,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,.12)_1px,transparent_1px)] [background-size:34px_34px] dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.12),transparent_28%)]" />
      <div className="relative z-10 grid min-h-[320px] w-full max-w-md place-items-center rounded-lg border border-white/30 bg-white/70 p-8 shadow-2xl shadow-blue-950/10 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div>
          <div className="mx-auto grid size-16 place-items-center rounded-lg border border-blue-200/70 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-300">
            <Loader2 className="size-7 animate-spin" />
          </div>
          <p className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
        </div>
      </div>
    </div>
  );
}
