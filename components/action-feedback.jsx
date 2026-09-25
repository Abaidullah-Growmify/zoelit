"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui";

export function TransparentActionLoader({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-surface/35 backdrop-blur-[1px]" aria-label="Loading" role="status">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

export function InfoActionDialog({ open, title = "Notice", message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-inverse-surface/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 shadow-2xl shadow-slate-950/25">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>OK</Button>
        </div>
      </Card>
    </div>
  );
}

export function ConfirmActionDialog({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-inverse-surface/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 shadow-2xl shadow-slate-950/25">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-on-surface">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><Loader2 className="size-4 animate-spin" /> Working...</> : <><Trash2 className="size-4" /> {confirmLabel}</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
