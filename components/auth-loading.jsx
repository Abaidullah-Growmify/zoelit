import { Loader2 } from "lucide-react";

function SecureAccessLoader({ label = "Loading..." }) {
  return (
    <div className="grid min-h-screen place-items-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid size-14 place-items-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="size-6 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function AuthLoading({ label = "Loading secure access..." }) {
  return <SecureAccessLoader label={label} />;
}

export { SecureAccessLoader };
