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
      className={`icon-btn ${className}`}
      aria-label="Toggle color mode"
      title="Toggle color mode"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
