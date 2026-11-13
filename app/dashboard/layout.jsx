import { DashboardShell } from "@/components/dashboard-shell";

export const metadata = {
  title: "Customer Dashboard | Zoel IT Commerce",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
