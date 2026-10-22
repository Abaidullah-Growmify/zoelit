"use client";

export function ThemeToggle({ className = "", showLabel = false }) {
  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={showLabel ? className : `icon-btn ${className}`}
      aria-label="Toggle color mode"
      title="Toggle color mode"
    >
      {showLabel ? <span>Theme</span> : <span className="sr-only">Theme</span>}
    </button>
  );
}
