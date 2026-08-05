import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { addresses, getOrder, orders, orderItems, statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { Badge, Card } from "@/components/ui";

export function generateStaticParams() {
  return orders.map((order) => ({ id: order.id }));
}

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const activeIndex = statuses.indexOf(order.status);
  return <div><p className="font-bold text-blue-600">Order Details</p><h1 className="text-4xl font-black">Order #{order.id}</h1><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><Card><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Summary</h2><p className="text-sm text-slate-500">Placed {shortDate(order.date)}</p></div><Badge>{order.status}</Badge></div><div className="mt-6 space-y-5">{orderItems(order).map((item) => <div key={item.productId} className="flex gap-4"><Image src={item.product.image} alt={item.product.name} width={92} height={92} className="size-24 rounded-2xl object-cover" /><div className="flex-1"><h3 className="font-black">{item.product.name}</h3><p className="text-sm text-slate-500">Qty {item.quantity}</p></div><strong>{money(item.product.price * item.quantity)}</strong></div>)}</div><div className="mt-6 border-t border-slate-200 pt-5 text-lg font-black dark:border-slate-800"><div className="flex justify-between"><span>Total</span><span>{money(order.total)}</span></div></div></Card><div className="space-y-6"><Card><h2 className="font-black">Shipping address</h2><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{addresses[0].name}<br />{addresses[0].line1}<br />{addresses[0].city}, {addresses[0].region} {addresses[0].postal}</p></Card><Card><h2 className="font-black">Payment</h2><p className="mt-3"><Badge tone="slate">{order.payment}</Badge></p><p className="mt-5 text-sm text-slate-500">Tracking: {order.tracking || "Not available yet"}</p></Card></div></div><Card className="mt-6"><h2 className="text-xl font-black">Order timeline</h2><div className="mt-6 grid gap-4 md:grid-cols-5">{statuses.filter((status) => status !== "Cancelled").map((status, index) => { const done = order.status === "Cancelled" ? false : index <= activeIndex; return <div key={status} className="flex items-center gap-3"><span className={done ? "text-emerald-500" : "text-slate-300"}>{done ? <CheckCircle2 /> : <Circle />}</span><span className="text-sm font-bold">{status}</span></div>; })}</div></Card></div>;
}
