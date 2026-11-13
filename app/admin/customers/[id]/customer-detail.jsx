"use client";

import { useEffect, useState } from "react";
import { Eye, Mail, MapPin, Phone, ShoppingBag, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatCard } from "@/components/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableActions, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { OrderNotesDialog } from "@/components/order-notes-dialog";
import { Card } from "@/components/ui";
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
    <Card className="w-full max-w-full min-w-0 space-y-6 overflow-hidden p-4 sm:p-6">
      <AdminPageHeader title={customer.name} description="Customer account overview with profile, addresses, spend history, and orders." />
      <div className="mt-8 grid min-w-0 grid-cols-3 gap-2 sm:gap-4">
        <AdminStatCard label="Total spent" value={money(customer.totalSpent || 0)} icon={Wallet} />
        <AdminStatCard label="Orders" value={customer.ordersCount ?? 0} icon={ShoppingBag} />
        <AdminStatCard label="Addresses" value={customer.addresses?.length ?? 0} icon={MapPin} />
      </div>
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card className="w-full max-w-full min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="grid size-14 place-items-center rounded-full bg-blue-50 font-heading text-h2 font-semibold text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">{customer.name.slice(0, 1)}</div>
              <AdminStatusBadge>{customer.status}</AdminStatusBadge>
            </div>
            <h2 className="mt-5 font-heading text-h2 font-semibold">Contact</h2>
            <p className="mt-4 flex min-w-0 items-start gap-2 text-body font-regular"><Mail className="mt-0.5 size-4 shrink-0 text-blue-600" /><span className="min-w-0 break-all">{customer.email}</span></p>
            <p className="mt-3 flex min-w-0 items-center gap-2 text-body font-regular"><Phone className="size-4 shrink-0 text-blue-600" /><span className="min-w-0 break-words">{customer.phone || "—"}</span></p>
            <p className="mt-3 text-meta font-regular text-slate-500 dark:text-slate-400">Joined {customer.joined ? shortDate(customer.joined) : "—"}</p>
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Card className="w-full max-w-full min-w-0 overflow-hidden">
            <h2 className="font-heading text-h2 font-semibold">Addresses</h2>
            <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              {customer.addresses?.length ? (
                customer.addresses.map((address) => (
                  <div key={address.id} className="min-w-0 max-w-full overflow-hidden rounded-lg border border-outline-variant/70 bg-surface-container-low/40 p-3 transition-colors hover:border-primary/40 hover:bg-surface sm:p-4">
                    <p className="truncate font-heading text-sm font-semibold text-on-surface sm:text-base">{address.label}</p>
                    <p className="mt-2 break-words text-xs leading-5 text-on-surface-variant sm:text-sm sm:leading-6">{address.name}<br />{address.line1}<br />{address.city}, {address.region} {address.postal}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full py-6 text-center text-body font-regular text-slate-500 dark:text-slate-400">No saved addresses.</p>
              )}
            </div>
          </Card>
          <AdminTable wrapperClassName="max-w-full" columns={["Order", "Date", "Status", "Payment", "Notes", "Total", "Action"]}>
            {orders.map((order) => (
              <AdminTableRow key={order.id}>
                <AdminTableCell className="font-semibold tabular-nums text-slate-950 dark:text-white">{order.publicOrderId || order.orderNumber || order.id}</AdminTableCell>
                <AdminTableCell>{shortDate(order.date)}</AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.status}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell><AdminStatusBadge>{order.payment}</AdminStatusBadge></AdminTableCell>
                <AdminTableCell><OrderNotesDialog notes={order.notes} label={`View notes for order ${order.publicOrderId || order.orderNumber || order.id}`} /></AdminTableCell>
                <AdminTableCell className="font-semibold tabular-nums text-slate-950 dark:text-white">{money(order.total)}</AdminTableCell>
                  <AdminTableCell>
                    <AdminTableActions
                      label={`Actions for order ${order.publicOrderId || order.orderNumber || order.id}`}
                      actions={[{ label: "View", icon: Eye, href: `/admin/orders/${order.id}` }]}
                    />
                  </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        </div>
      </div>
    </Card>
  );
}
