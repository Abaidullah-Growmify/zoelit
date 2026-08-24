"use client";

import { forwardRef, useCallback, useMemo } from "react";
import { Textarea } from "@/components/ui";

function insertTextAtCursor(el, text) {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const nextValue = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`;
  el.value = nextValue;
  const nextCursor = start + text.length;
  window.requestAnimationFrame(() => {
    el.setSelectionRange(nextCursor, nextCursor);
  });
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

export const BulletTextarea = forwardRef(function BulletTextarea(
  { onFocus, onBlur, onKeyDown, className, ...props },
  ref
) {
  const handleFocus = useCallback(
    (event) => {
      if (!event.currentTarget.value) {
        insertTextAtCursor(event.currentTarget, "• ");
      }
      onFocus?.(event);
    },
    [onFocus]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        insertTextAtCursor(event.currentTarget, "\n• ");
      }
      onKeyDown?.(event);
    },
    [onKeyDown]
  );

  const handleBlur = useCallback(
    (event) => {
      const normalized = String(event.currentTarget.value || "").replace(/^\s*•\s*$/, "").trim();
      if (!normalized && /^\s*•\s*$/.test(String(event.currentTarget.value || ""))) {
        event.currentTarget.value = "";
        event.currentTarget.dispatchEvent(new Event("input", { bubbles: true }));
      }
      onBlur?.(event);
    },
    [onBlur]
  );

  return <Textarea ref={ref} className={`break-words ${className || ""}`} onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown} {...props} />;
});

export function BulletNotes({ notes, emptyText = "No notes were added to this order." }) {
  const items = useMemo(() => {
    return String(notes || "")
      .split(/\r?\n/)
      .map((line) => String(line || "").replace(/^\s*[•*-]\s*/, "").trim())
      .filter(Boolean);
  }, [notes]);

  if (!items.length) {
    return <p className="min-w-0 break-words text-body font-regular leading-6 text-slate-600 dark:text-slate-300">{emptyText}</p>;
  }

  return (
    <ul className="min-w-0 list-disc space-y-2 overflow-hidden break-words pl-5 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="min-w-0 break-words [overflow-wrap:anywhere]">{item}</li>
      ))}
    </ul>
  );
}
