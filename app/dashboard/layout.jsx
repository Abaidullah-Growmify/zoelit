import { DashboardShell } from "@/components/dashboard-shell";

export const metadata = { title: "Customer Dashboard | ZoeLit Commerce" };

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
