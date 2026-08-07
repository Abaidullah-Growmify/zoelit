import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { adminOrders, getAdminOrder } from "@/lib/admin-data";
import { orderItems, statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";

export function generateStaticParams() {
  return adminOrders.map((order) => ({ id: order.id }));
}

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = getAdminOrder(id);
  if (!order) notFound();
  return (
    <div>
      <AdminPageHeader title={`Order #${order.id}`} description={`Placed by ${order.customer.name} on ${shortDate(order.date)}. Static controls show the intended admin workflow.`} />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-h2 font-semibold">Order items</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Payment via {order.paymentMethod}</p></div><AdminStatusBadge>{order.status}</AdminStatusBadge></div><div className="mt-6 space-y-5">{orderItems(order).map((item) => <div key={item.productId} className="flex gap-4 rounded-md border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60"><Image src={item.product.image} alt={item.product.name} width={88} height={88} className="size-22 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-800" /><div className="flex-1"><h3 className="text-h3 font-semibold text-slate-950 dark:text-white">{item.product.name}</h3><p className="mt-1 text-body font-regular tabular-nums text-slate-500 dark:text-slate-400">Qty {item.quantity}</p></div><strong className="text-body font-semibold tabular-nums">{money(item.product.price * item.quantity)}</strong></div>)}</div><div className="mt-6 space-y-2 border-t border-slate-200 pt-5 text-body dark:border-slate-800"><Summary label="Subtotal" value={money(order.subtotal)} /><Summary label="Tax" value={money(order.tax)} /><Summary label="Shipping" value={money(order.shippingFee)} /><Summary label="Discount" value={`-${money(order.discount)}`} /><Summary label="Total" value={money(order.total)} strong /></div></Card>
        <div className="space-y-6"><Card><h2 className="text-h2 font-semibold">Admin controls</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Update fulfillment state and internal handling notes.</p><div className="mt-5 space-y-4"><Field label="Order status"><Select defaultValue={order.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field><Field label="Tracking number"><Input defaultValue={order.tracking} placeholder="ZX-000000" /></Field><Field label="Internal note"><Textarea className="min-h-24" defaultValue={order.notes} /></Field><Button className="w-full">Update order</Button><Button className="w-full" variant="outline">Print invoice</Button></div></Card><Card><h2 className="text-h2 font-semibold">Customer</h2><p className="mt-4 text-body font-semibold text-slate-950 dark:text-white">{order.customer.name}</p><p className="text-body font-regular text-slate-500 dark:text-slate-400">{order.customer.email}</p><p className="mt-3 text-body font-regular text-slate-500 dark:text-slate-400">{order.customer.phone}</p></Card><Card><h2 className="text-h2 font-semibold">Shipping address</h2><p className="mt-4 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">{order.customer.addresses[0].name}<br />{order.customer.addresses[0].line1}<br />{order.customer.addresses[0].city}, {order.customer.addresses[0].region} {order.customer.addresses[0].postal}</p></Card></div>
      </div>
      <Card className="mt-6"><h2 className="text-h2 font-semibold">Timeline</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{order.timeline.map((event) => <div key={event.label} className="flex gap-3 rounded-md bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800"><CheckCircle2 className="size-5 shrink-0 text-blue-600 dark:text-blue-300" /><div><p className="text-body font-semibold text-slate-950 dark:text-white">{event.label}</p><p className="text-meta font-regular text-slate-500 dark:text-slate-400">{shortDate(event.date)}</p></div></div>)}</div></Card>
    </div>
  );
}

function Summary({ label, value, strong }) {
  return <div className={strong ? "flex justify-between text-h2 font-semibold" : "flex justify-between text-body font-regular text-slate-500 dark:text-slate-400"}><span>{label}</span><span className="tabular-nums">{value}</span></div>;
}

function Field({ label, children }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
