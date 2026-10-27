"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CreditCard, Loader2, MapPin, Package, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, Skeleton } from "@/components/ui";
import { getAdminNotification, getAdminOrder, getAdminProducts, getAdminProductsByIds, markAdminNotificationRead } from "@/lib/api";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export default function AdminNotificationDetailPage() {
  const { id } = useParams();
  const token = useAdminAuthStore((state) => state.token);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return undefined;
    let cancelled = false;
    getAdminNotification(id, token).then((data) => {
      if (cancelled) return;
        setNotification(data.notification);
        if (!data.notification.isRead) markAdminNotificationRead(id, token).catch(() => {});
        const orderId = getRelatedOrderId(data.notification.url);
       if (orderId) {
         setOrderLoading(true);
         getAdminOrder(orderId, token).then(async (orderData) => {
           const nextOrder = orderData.order;
           const missingImageIds = (nextOrder.lineItems || []).filter((item) => !item.image && !item.imageUrl && !item.productImage).map((item) => item.productId).filter(Boolean);
           if (!missingImageIds.length) {
             setOrder(nextOrder);
             return;
           }
           const productsData = await getAdminProductsByIds(missingImageIds, token).catch(() => ({ products: [] }));
           const catalogProducts = [...(productsData.products || [])];
           const unresolvedItems = (nextOrder.lineItems || []).filter((item) => !catalogProducts.some((product) => String(product.ingramPartNumber) === String(item.productId)) && item.name);
           const searchedProducts = await Promise.all(unresolvedItems.map((item) => getAdminProducts({ keyword: item.name, limit: 10 }, token).then((data) => data.products || []).catch(() => [])));
           searchedProducts.flat().forEach((product) => { if (!catalogProducts.some((existing) => String(existing._id) === String(product._id))) catalogProducts.push(product); });
           const products = new Map(catalogProducts.flatMap((product) => [[String(product.ingramPartNumber), product], [String(product.name), product], [String(product.description), product]]));
           setOrder({ ...nextOrder, lineItems: (nextOrder.lineItems || []).map((item) => ({ ...item, image: item.image || products.get(String(item.productId))?.imageUrl || products.get(String(item.productId))?.image || products.get(String(item.name))?.imageUrl || products.get(String(item.name))?.image || "" })) });
         }).catch(() => {}).finally(() => setOrderLoading(false));
       }
    }).catch((error) => {
      if (!cancelled) toast.error(error.message || "Could not load notification");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, token]);

  if (loading || orderLoading) return <NotificationDetailLoading />;
  if (!notification) return <Card><p className="text-sm text-on-surface-variant">Notification not found.</p></Card>;

  const relatedOrderUrl = notification.url?.startsWith("/admin/orders/") ? notification.url : "";
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Card className="overflow-hidden p-0">
         <div className="px-5 py-7 sm:px-8 sm:py-9">
           <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Notification</p><h1 className="mt-2 break-words font-heading text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">{notification.title}</h1><p className="mt-2 text-sm text-on-surface-variant">Received {formatDate(notification.createdAt)}</p></div>
         </div>
         <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
           <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/45 p-5 sm:p-6"><p className="whitespace-pre-wrap break-words text-base leading-8 text-on-surface">{notification.body}</p></div>
           {relatedOrderUrl ? <div className="mt-8 border-t border-outline-variant/70 pt-8"><OrderPreview order={order} /></div> : null}
         </div>
       </Card>
      </div>
  );
}

function getRelatedOrderId(url = "") {
  const match = url.match(/^\/admin\/orders\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function OrderPreview({ order }) {
  if (!order) return <Card><div className="flex items-center gap-3 text-sm text-on-surface-variant"><Loader2 className="size-4 animate-spin" /> Loading order details...</div></Card>;
  const customer = order.customer || {};
  const address = order.billing || order.shipping || {};
  const items = order.lineItems || [];
  return <section className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="min-w-0"><div className="flex items-center justify-between gap-3"><div><h3 className="font-heading text-lg font-semibold text-on-surface">Products</h3><p className="mt-1 text-sm text-on-surface-variant">{items.length} product{items.length === 1 ? "" : "s"} in this order</p></div><Package className="size-5 text-primary" /></div><div className="mt-5 divide-y divide-outline-variant/60">{items.map((item) => <div key={item.productId || item.name} className="flex gap-3 py-4 first:pt-0 last:pb-0"><div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-container"><ProductImage item={item} /></div><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-on-surface">{item.name || "Product"}</p><p className="mt-1 text-xs text-on-surface-variant">Quantity: {Math.max(1, Number(item.quantity) || 1)}</p></div><p className="shrink-0 text-sm font-semibold tabular-nums text-on-surface">{money(item.lineTotalAfterCommission || item.originalLineTotal || (Number(item.price) || 0) * (Number(item.quantity) || 1))}</p></div>)}</div><div className="mt-5 space-y-2 border-t border-outline-variant/70 pt-5"><OrderTotal label="Subtotal" value={money(order.subtotal || 0)} /><OrderTotal label="Shipping" value={money(order.shippingFee || 0)} /><OrderTotal label="Discount" value={`-${money(order.discount || 0)}`} /><OrderTotal label="Total" value={money(order.total || 0)} strong /></div></Card>
      <div className="space-y-5"><InfoCard icon={UserRound} title="Customer"><p className="font-semibold text-on-surface">{customer.name || "Unknown"}</p><p className="mt-1 break-words text-sm text-on-surface-variant">{customer.email || "No email"}</p><p className="mt-1 text-sm text-on-surface-variant">{customer.phone || "No phone"}</p></InfoCard><InfoCard icon={MapPin} title="Shipping details"><p className="break-words text-sm leading-6 text-on-surface-variant">{address.firstName} {address.lastName}<br />{address.address || "Address unavailable"}<br />{address.city}, {address.state} {address.postal}</p></InfoCard><InfoCard icon={CreditCard} title="Payment"><p className="font-semibold capitalize text-on-surface">{order.paymentMethod || "Card"}</p><p className="mt-1 text-sm text-on-surface-variant">{order.payment || "Payment status unavailable"}</p></InfoCard></div>
    </div>
  </section>;
}

function ProductImage({ item }) {
  const image = item.image || item.imageUrl || item.productImage || "";
  return image ? <Image src={image} alt="" width={64} height={64} unoptimized className="size-full object-cover" /> : <div className="grid size-full place-items-center text-xs text-on-surface-variant">No image</div>;
}

function InfoCard({ icon: Icon, title, children }) {
  return <Card><div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-primary" /><h3 className="font-heading text-base font-semibold text-on-surface">{title}</h3></div>{children}</Card>;
}

function OrderTotal({ label, value, strong = false }) {
  return <div className={`flex justify-between gap-3 ${strong ? "pt-2 text-base font-semibold text-on-surface" : "text-sm text-on-surface-variant"}`}><span>{label}</span><span className="tabular-nums">{value}</span></div>;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Just now" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function NotificationDetailLoading() {
  return <div className="mx-auto max-w-6xl"><Card className="overflow-hidden p-0"><div className="px-5 py-8 sm:px-8"><div className="space-y-3"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-72 max-w-full" /><Skeleton className="h-4 w-40" /></div></div><div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8"><Skeleton className="h-28 w-full rounded-xl" /><div className="border-t border-outline-variant/70 pt-8"><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><Card><div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-6 w-28" /><Skeleton className="h-4 w-40" /></div><Skeleton className="size-5" /></div><div className="mt-6 flex gap-3"><Skeleton className="size-16 shrink-0 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-4 w-16" /></div><div className="mt-5 space-y-2 border-t border-outline-variant/70 pt-5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-5 w-full" /></div></Card><div className="space-y-5"><Card><Skeleton className="h-5 w-28" /><Skeleton className="mt-4 h-4 w-full" /><Skeleton className="mt-2 h-4 w-3/4" /></Card><Card><Skeleton className="h-5 w-36" /><Skeleton className="mt-4 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /></Card><Card><Skeleton className="h-5 w-24" /><Skeleton className="mt-4 h-4 w-2/3" /></Card></div></div></div></div></Card></div>;
}
