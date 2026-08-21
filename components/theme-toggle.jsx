"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }) {
  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`grid size-11 place-items-center rounded-sm bg-surface-container-low text-on-surface-variant transition hover:bg-surface-container dark:bg-surface-container dark:text-on-surface ${className}`}
      aria-label="Toggle color mode"
      title="Toggle color mode"
    >
      <Moon className="size-5 dark:hidden" />
      <Sun className="hidden size-5 dark:block" />
    </button>
  );
}
