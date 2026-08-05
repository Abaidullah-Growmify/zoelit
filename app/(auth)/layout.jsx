import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }) {
  return <main className="relative grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#dbeafe,transparent_35%),linear-gradient(135deg,#f8fafc,#ffffff)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,#1e3a8a,transparent_35%),linear-gradient(135deg,#020617,#0f172a)]"><ThemeToggle className="absolute right-4 top-4" />{children}</main>;
}
