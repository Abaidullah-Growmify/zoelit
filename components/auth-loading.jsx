import { Loader2 } from "lucide-react";

function SecureAccessLoader({ label = "Loading..." }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-on-surface">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="grid size-12 place-items-center rounded-full border border-outline-variant bg-surface-container-lowest shadow-primary-elevated">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

export function AuthLoading({ label = "Loading secure access..." }) {
  return <SecureAccessLoader label={label} />;
}

export { SecureAccessLoader };
