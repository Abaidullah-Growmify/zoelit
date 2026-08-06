import Link from "next/link";
import { Eye } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Select } from "@/components/ui";
import { customers } from "@/lib/admin-data";
import { money, shortDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  return (
    <div>
      <AdminPageHeader title="Customers" description="View customer profiles, contact data, purchase totals, account state, addresses, and notes." />
      <Card className="mt-8"><div className="mb-4"><h2 className="text-base font-bold">Customer filters</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search account records and segment by state or join date.</p></div><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search customers" /><Select><option>All statuses</option><option>Active</option><option>Blocked</option></Select><Input type="date" /><Button variant="secondary">Reset</Button></div></Card>
      <AdminTable className="mt-6" columns={["Customer", "Email", "Phone", "Orders", "Spent", "Status", "Joined", ""]}>
        {customers.map((customer) => <AdminTableRow key={customer.id}><AdminTableCell className="font-bold text-slate-950 dark:text-white">{customer.name}</AdminTableCell><AdminTableCell>{customer.email}</AdminTableCell><AdminTableCell>{customer.phone}</AdminTableCell><AdminTableCell className="tabular-nums">{customer.orders}</AdminTableCell><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">{money(customer.totalSpent)}</AdminTableCell><AdminTableCell><AdminStatusBadge>{customer.status}</AdminStatusBadge></AdminTableCell><AdminTableCell>{shortDate(customer.joined)}</AdminTableCell><AdminTableCell><Link aria-label={`Open ${customer.name}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/customers/${customer.id}`}><Eye className="size-4" /></Link></AdminTableCell></AdminTableRow>)}
      </AdminTable>
    </div>
  );
}
