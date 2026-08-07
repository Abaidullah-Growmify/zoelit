import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Mail, MapPin, Pencil, Phone, ShoppingBag, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Label, Textarea } from "@/components/ui";
import { adminOrders, customers, getCustomer } from "@/lib/admin-data";
import { money, shortDate } from "@/lib/utils";

export function generateStaticParams() {
  return customers.map((customer) => ({ id: customer.id }));
}

export default async function AdminCustomerDetailPage({ params }) {
  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) notFound();
  const orders = adminOrders.filter((order) => order.customer.id === customer.id);
  return (
    <div>
      <AdminPageHeader title={customer.name} description="Customer account overview with profile, addresses, spend history, orders, and admin notes." action={<Button variant="outline" aria-label="Edit customer"><Pencil className="size-4" /></Button>} />
      <div className="mt-8 grid gap-4 md:grid-cols-3"><AdminStatCard label="Total spent" value={money(customer.totalSpent)} icon={Wallet} /><AdminStatCard label="Orders" value={customer.orders} icon={ShoppingBag} /><AdminStatCard label="Addresses" value={customer.addresses.length} icon={MapPin} /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6"><Card><div className="flex items-center justify-between gap-4"><div className="grid size-14 place-items-center rounded-lg bg-blue-50 font-heading text-xl font-extrabold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{customer.name.slice(0, 1)}</div><AdminStatusBadge>{customer.status}</AdminStatusBadge></div><h2 className="mt-5 text-xl font-bold">Contact</h2><p className="mt-4 flex items-center gap-2 text-sm"><Mail className="size-4 text-blue-600" />{customer.email}</p><p className="mt-3 flex items-center gap-2 text-sm"><Phone className="size-4 text-blue-600" />{customer.phone}</p><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Joined {shortDate(customer.joined)}</p></Card><Card><h2 className="text-xl font-bold">Admin notes</h2><Label className="mt-5 block">Private note</Label><Textarea className="mt-2 min-h-32" defaultValue="High-value customer. Prefers quick shipment updates." /><Button className="mt-4 w-full">Save note</Button></Card></div>
        <div className="space-y-6"><Card><h2 className="text-xl font-bold">Addresses</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{customer.addresses.map((address) => <div key={address.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60"><p className="font-bold text-slate-950 dark:text-white">{address.label}</p><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{address.name}<br />{address.line1}<br />{address.city}, {address.region} {address.postal}</p></div>)}</div></Card><AdminTable columns={["Order", "Date", "Status", "Payment", "Total", ""]}>{orders.map((order) => <AdminTableRow key={order.id}><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">#{order.id}</AdminTableCell><AdminTableCell>{shortDate(order.date)}</AdminTableCell><AdminTableCell><AdminStatusBadge>{order.status}</AdminStatusBadge></AdminTableCell><AdminTableCell><AdminStatusBadge>{order.payment}</AdminStatusBadge></AdminTableCell><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">{money(order.total)}</AdminTableCell><AdminTableCell><Link aria-label={`Open order ${order.id}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/orders/${order.id}`}><Eye className="size-4" /></Link></AdminTableCell></AdminTableRow>)}</AdminTable></div>
      </div>
    </div>
  );
}
