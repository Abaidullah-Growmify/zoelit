import { AdminShell } from "@/components/admin-shell";

export const metadata = {
  title: "Admin Panel | Zoel IT Commerce",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
