import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { addresses, getOrder, orders, orderItems, statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { Badge, Card } from "@/components/ui";

export function generateStaticParams() {
  return orders.map((order) => ({ id: order.id }));
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();

  const activeIndex = statuses.indexOf(order.status);
  const timelineStatuses = statuses.filter((status) => status !== "Cancelled");

  return (
    <div>
      <DashboardPageHeader
        title={`Order #${order.id}`}
        description={`Placed ${shortDate(order.date)}. Review shipment progress, items, payment, and delivery information.`}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-h2 font-semibold">Summary</h2>
              <p className="text-body font-regular text-slate-500 dark:text-slate-400">Placed {shortDate(order.date)}</p>
            </div>
            <Badge>{order.status}</Badge>
          </div>

          <div className="mt-6 space-y-5">
            {orderItems(order).map((item) => (
              <div key={item.productId} className="flex gap-4">
                <Image src={item.product.image} alt={item.product.name} width={92} height={92} className="size-24 rounded-md object-cover" />
                <div className="flex-1">
                  <h3 className="font-heading text-h3 font-semibold">{item.product.name}</h3>
                  <p className="text-body font-regular tabular-nums text-slate-500 dark:text-slate-400">Qty {item.quantity}</p>
                </div>
                <strong className="font-semibold tabular-nums text-slate-950 dark:text-white">{money(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5 font-heading text-h2 font-semibold dark:border-slate-800">
            <div className="flex justify-between">
              <span>Total</span>
              <span className="tabular-nums">{money(order.total)}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-h3 font-semibold">Shipping address</h2>
            <p className="mt-3 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">
              {addresses[0].name}<br />
              {addresses[0].line1}<br />
              {addresses[0].city}, {addresses[0].region} {addresses[0].postal}
            </p>
          </Card>
          <Card>
            <h2 className="font-heading text-h3 font-semibold">Payment</h2>
            <p className="mt-3"><Badge tone="slate">{order.payment}</Badge></p>
            <p className="mt-5 text-body font-regular text-slate-500 dark:text-slate-400">Tracking: {order.tracking || "Not available yet"}</p>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="font-heading text-h2 font-semibold">Order timeline</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {timelineStatuses.map((status, index) => {
            const done = order.status === "Cancelled" ? false : index <= activeIndex;
            const Icon = done ? CheckCircle2 : Circle;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className={done ? "text-blue-600 dark:text-blue-300" : "text-slate-300 dark:text-slate-600"}>
                  <Icon className="size-5" />
                </span>
                <span className={done ? "text-body font-semibold text-slate-950 dark:text-white" : "text-body font-regular text-slate-500 dark:text-slate-400"}>{status}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
