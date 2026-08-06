import Link from "next/link";
import { Eye } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Select } from "@/components/ui";
import { adminOrders } from "@/lib/admin-data";
import { money, shortDate } from "@/lib/utils";

export default function AdminOrdersPage() {
  return (
    <div>
      <AdminPageHeader title="Orders" description="Review purchase activity, payment state, fulfillment status, totals, and shipment tracking." />
      <Card className="mt-8"><div className="mb-4"><h2 className="text-base font-bold">Find orders faster</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filter by customer, fulfillment, payment, or order date.</p></div><div className="grid gap-3 md:grid-cols-5"><Input placeholder="Search order or customer" /><Select><option>All statuses</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></Select><Select><option>All payments</option><option>Paid</option><option>Pending</option><option>Refunded</option></Select><Input type="date" /><Button variant="secondary">Reset</Button></div></Card>
      <AdminTable className="mt-6" columns={["Order", "Customer", "Date", "Status", "Payment", "Tracking", "Total", ""]}>
        {adminOrders.map((order) => <AdminTableRow key={order.id}><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">#{order.id}</AdminTableCell><AdminTableCell>{order.customer.name}</AdminTableCell><AdminTableCell>{shortDate(order.date)}</AdminTableCell><AdminTableCell><AdminStatusBadge>{order.status}</AdminStatusBadge></AdminTableCell><AdminTableCell><AdminStatusBadge>{order.payment}</AdminStatusBadge></AdminTableCell><AdminTableCell>{order.tracking || "Not assigned"}</AdminTableCell><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">{money(order.total)}</AdminTableCell><AdminTableCell><Link aria-label={`Open order ${order.id}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/orders/${order.id}`}><Eye className="size-4" /></Link></AdminTableCell></AdminTableRow>)}
      </AdminTable>
    </div>
  );
}
