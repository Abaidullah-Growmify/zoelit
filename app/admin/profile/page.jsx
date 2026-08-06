import { Eye, ShieldCheck, UserRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { Button, Card, Input, Label } from "@/components/ui";
import { adminUser } from "@/lib/admin-data";

export default function AdminProfilePage() {
  return (
    <div>
      <AdminPageHeader title="Admin profile" description="Manage the visual account profile for the store administrator. Authentication is not connected yet." />
      <div className="mt-8 grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card><div className="grid size-20 place-items-center rounded-full bg-blue-50 font-heading text-3xl font-extrabold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{adminUser.name.slice(0, 1)}</div><h2 className="mt-5 text-2xl font-bold">{adminUser.name}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{adminUser.email}</p><div className="mt-4"><AdminStatusBadge>{adminUser.role}</AdminStatusBadge></div><div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800"><ShieldCheck className="size-6 text-blue-600 dark:text-blue-300" /><p className="mt-3 text-sm font-bold">Admin permissions</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Full UI access for products, orders, customers, inventory, and settings.</p></div></Card>
        <div className="space-y-6"><Card><div className="flex items-center gap-3"><UserRound className="size-5 text-blue-600" /><h2 className="text-xl font-bold">Profile details</h2></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Name"><Input defaultValue={adminUser.name} /></Field><Field label="Email"><Input defaultValue={adminUser.email} /></Field><Field label="Phone"><Input defaultValue={adminUser.phone} /></Field><Field label="Role"><Input defaultValue={adminUser.role} /></Field></div><Button className="mt-5">Save profile</Button></Card><Card><h2 className="text-xl font-bold">Change password</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Current password"><Input type="password" placeholder="Current password" /></Field><Field label="New password"><Input type="password" placeholder="New password" /></Field></div><Button className="mt-5" variant="outline">Update password</Button></Card><Card><h2 className="text-xl font-bold">Security</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Two-factor authentication, active sessions, and device logs can be connected when real admin auth is added.</p><Button className="mt-5" variant="secondary" aria-label="Open sessions"><Eye className="size-4" /></Button></Card></div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
