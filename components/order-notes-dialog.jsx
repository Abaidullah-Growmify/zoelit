"use client";

import { FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { BulletNotes } from "@/components/bullet-notes";

export function OrderNotesDialog({ notes, label = "View notes" }) {
  const [open, setOpen] = useState(false);
  const text = String(notes || "").trim();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!text) {
    return <span className="text-slate-400 dark:text-slate-600">—</span>;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className="inline-grid size-9 place-items-center rounded-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
      >
        <FileText className="size-4" />
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-meta font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Order Notes</p>
                <h3 className="mt-1 font-heading text-h3 font-semibold text-slate-950 dark:text-white">Customer note</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close notes dialog"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <BulletNotes notes={text} emptyText="No notes available." />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
