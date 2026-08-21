"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Mail, MapPin, Pencil, Phone, ShoppingBag, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import { Button, Card } from "@/components/ui";
import { AdminCustomerDetailSkeleton } from "@/components/skeletons";
import { getAdminCustomer } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function AdminCustomerDetail({ id }) {
  const token = useAdminAuthStore((state) => state.token);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token || !id) return;
    getAdminCustomer(id, token)
      .then((data) => {
        if (!active) return;
        setCustomer(data.customer);
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (notFound || !customer) {
    return <AdminPageHeader title="Customer not found" description="We could not find the customer you are looking for." />;
  }

  return (
    <div>
      <AdminPageHeader title={customer.name} description="Customer account overview with profile, addresses, spend history, and orders." action={<Button variant="outline" aria-label="Edit customer"><Pencil className="size-4" /></Button>} />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Total spent" value={money(customer.totalSpent || 0)} icon={Wallet} />
        <AdminStatCard label="Orders" value={customer.ordersCount ?? 0} icon={ShoppingBag} />
        <AdminStatCard label="Addresses" value={customer.addresses?.length ?? 0} icon={MapPin} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div className="grid size-14 place-items-center rounded-full bg-blue-50 font-heading text-h2 font-semibold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{customer.name.slice(0, 1)}</div>
              <AdminStatusBadge>{customer.status}</AdminStatusBadge>
            </div>
            <h2 className="mt-5 font-heading text-h2 font-semibold">Contact</h2>
            <p className="mt-4 flex items-center gap-2 text-body font-regular"><Mail className="size-4 text-blue-600" />{customer.email}</p>
            <p className="mt-3 flex items-center gap-2 text-body font-regular"><Phone className="size-4 text-blue-600" />{customer.phone || "—"}</p>
            <p className="mt-3 text-meta font-regular text-slate-500 dark:text-slate-400">Joined {customer.joined ? shortDate(customer.joined) : "—"}</p>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-h2 font-semibold">Addresses</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {customer.addresses?.length ? (
                customer.addresses.map((address) => (
                  <div key={address.id} className="rounded-md border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <p className="font-heading text-h3 font-semibold text-slate-950 dark:text-white">{address.label}</p>
                    <p className="mt-2 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">{address.name}<br />{address.line1}<br />{address.city}, {address.region} {address.postal}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full py-6 text-center text-body font-regular text-slate-500 dark:text-slate-400">No saved addresses.</p>
              )}
            </div>
          </Card>
          <AdminTable columns={["Order", "Date", "Status", "Payment", "Notes", "Total", ""]}>
            {orders.map((order) => (
              <AdminTableRow key={order.id}>
                <AdminTableCell className="font-semibold tabular-nums text-slate-950 dark:text-white">{order.orderNumber ? `#${order.orderNumber}` : `#${order.id}`}</AdminTableCell>
                <AdminTableCell>{shortDate(order.date)}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.status}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.payment}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell><OrderNotesDialog notes={order.notes} label={`View notes for order ${order.orderNumber || order.id}`} /></AdminTableCell>
                <AdminTableCell className="font-semibold tabular-nums text-slate-950 dark:text-white">{money(order.total)}</AdminTableCell>
                <AdminTableCell>
                  <Link aria-label={`Open order ${order.orderNumber || order.id}`} className="inline-grid size-9 place-items-center rounded-sm text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/orders/${order.id}`}><Eye className="size-4" /></Link>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </div>
      </div>
    </div>
  );
}
