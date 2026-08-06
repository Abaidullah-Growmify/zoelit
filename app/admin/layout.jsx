import { AdminShell } from "@/components/admin-shell";

export const metadata = {
  title: "Admin Panel | ZoeLit Commerce",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
