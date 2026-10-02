"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryPicker({ categories = [], value = [], onChange, max = 0, buttonLabel = "Select categories" }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const isSelected = (name) => value.includes(name);
  const atMax = max > 0 && value.length >= max;

  const rows = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    const list = categories.filter((category) => category?.name);
    if (!term) return list;
    return list.filter((category) => category.name.toLowerCase().includes(term));
  }, [categories, keyword]);

  const toggle = (name) => {
    if (isSelected(name)) {
      onChange(value.filter((item) => item !== name));
    } else if (!atMax) {
      onChange([...value, name]);
    }
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-outline-variant bg-surface px-3 text-sm text-on-surface transition hover:border-primary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        aria-expanded={open}
      >
        <span className="truncate">
          {value.length ? `${value.length}/${max || 0} selected` : buttonLabel}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-180")} />
      </button>

      {max > 0 ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold tabular-nums">{value.length} of {max} picked</span>
            <span>{value.length >= max ? "Full — remove one to add more" : `${max - value.length} more available`}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (value.length / max) * 100)}%` }} />
          </div>
        </div>
      ) : value.length ? (
        <p className="mt-1 text-xs text-on-surface-variant">{value.length} picked</p>
      ) : null}

      {value.length ? (
        <ul className="mt-2 space-y-2">
          {value.map((name, index) => (
            <li key={name} className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">{name}</p>
                <p className="text-xs text-on-surface-variant">Order {index + 1}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className="icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${name} up`}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" className="icon-btn" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Move ${name} down`}>
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" className="icon-btn text-error hover:bg-error-container" onClick={() => toggle(name)} aria-label={`Remove ${name}`}>
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-xl">
          <div className="border-b border-outline-variant/70 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                autoFocus
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Filter categories..."
                className="h-9 w-full rounded-lg border border-outline-variant bg-surface pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>
          </div>
          <div className="max-h-64 divide-y divide-outline-variant overflow-y-auto">
            {rows.map((category) => {
              const name = category.name;
              const selected = isSelected(name);
              const disabled = !selected && atMax;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-surface-container-low",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    role="checkbox"
                    aria-checked={selected}
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border transition",
                      selected ? "border-primary bg-primary text-white" : "border-outline-variant bg-surface-container-low text-transparent"
                    )}
                  >
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">{name}</p>
                    <p className="truncate text-xs text-on-surface-variant">{category.count ? `${category.count} products` : "No products yet"}</p>
                  </div>
                  {selected ? <span className="shrink-0 text-xs font-semibold text-primary">Picked</span> : null}
                </button>
              );
            })}
            {rows.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-on-surface-variant">No categories match your filter.</div>
            ) : null}
          </div>
          <div className="border-t border-outline-variant/70 bg-surface-container-low/40 px-3 py-2">
            <p className="text-xs text-on-surface-variant">
              {max > 0 ? `Pick up to ${max} categories.` : "Pick as many categories as you want."} Order shown on the storefront.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
