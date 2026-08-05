import { Loader2 } from "lucide-react";

export function AuthLoading({ label = "Loading secure access..." }) {
  return (
    <div className="grid min-h-[420px] w-full max-w-md place-items-center rounded-[2rem] border border-white/30 bg-white/10 p-8 text-center shadow-2xl shadow-blue-950/10 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-full border border-blue-200/70 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:text-blue-300">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <p className="mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">{label}</p>
      </div>
    </div>
  );
}
