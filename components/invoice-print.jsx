"use client";

import { money, shortDate } from "@/lib/utils";

export function InvoicePrint({ order }) {
  const billing = order?.billing || {};
  const items = order?.lineItems || order?.items || [];
  const customerName = order?.customer?.name || [billing.firstName, billing.lastName].filter(Boolean).join(" ") || "Customer";
  const subtotal = Number(order?.subtotal) || 0;
  const shipping = Number(order?.shippingFee || order?.shipping) || 0;
  const discount = Number(order?.discount) || 0;
  const qty = (item) => Math.max(1, Math.round(Number(item.quantity) || 1));
  const total = Number(order?.total) || subtotal + shipping - discount;

  return (
    <div className="hidden bg-white text-slate-900 print:block">
      <div className="flex items-start justify-between border-b-4 border-slate-900 pb-6">
        <div>
          <p className="font-heading text-4xl font-extrabold tracking-tight">
            <span className="text-blue-700">Zoe</span>Lit
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Commerce Invoice</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold uppercase tracking-[0.08em]">Invoice</p>
          <p className="mt-2 text-sm font-semibold">#{order?.orderNumber}</p>
          <p className="text-sm text-slate-600">Issued {order?.date ? shortDate(order.date) : ""}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Billed to</p>
          <p className="mt-2 text-base font-bold">{customerName}</p>
          {billing.address ? <p className="mt-1 text-sm text-slate-700">{billing.address}</p> : null}
          {billing.address2 ? <p className="text-sm text-slate-700">{billing.address2}</p> : null}
          {[billing.city, billing.state, billing.postal].filter(Boolean).length ? <p className="text-sm text-slate-700">{[billing.city, billing.state, billing.postal].filter(Boolean).join(", ")}</p> : null}
          {billing.country ? <p className="text-sm text-slate-700">{billing.country}</p> : null}
          {billing.email ? <p className="mt-2 text-sm text-slate-700">{billing.email}</p> : null}
          {billing.phone ? <p className="text-sm text-slate-700">{billing.phone}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Order details</p>
          <p className="mt-2 text-sm"><span className="font-semibold">Status:</span> {order?.status}</p>
          <p className="text-sm"><span className="font-semibold">Payment:</span> {order?.payment}</p>
          <p className="text-sm"><span className="font-semibold">Ordered:</span> {order?.date ? shortDate(order.date) : ""}</p>
          {order?.ingramOrderNumber ? <p className="text-sm"><span className="font-semibold">Ingram ref:</span> {order.ingramOrderNumber}</p> : null}
          {order?.tracking ? <p className="text-sm"><span className="font-semibold">Tracking:</span> {order.tracking}</p> : null}
          {order?.carrierName ? <p className="text-sm"><span className="font-semibold">Carrier:</span> {order.carrierName}</p> : null}
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-slate-900">
            <th className="py-2 pr-3 text-left font-bold">Item</th>
            <th className="py-2 px-3 text-right font-bold">Qty</th>
            <th className="py-2 px-3 text-right font-bold">Unit price</th>
            <th className="py-2 pl-3 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId || item._id || item.ingramPartNumber} className="border-b border-slate-300">
              <td className="py-2.5 pr-3 font-semibold">{item.name || item.productName}</td>
              <td className="py-2.5 px-3 text-right tabular-nums">{qty(item)}</td>
              <td className="py-2.5 px-3 text-right tabular-nums">{money(item.price)}</td>
              <td className="py-2.5 pl-3 text-right font-semibold tabular-nums">{money((Number(item.price) || 0) * qty(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 ml-auto w-64">
        <div className="flex justify-between py-1 text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold tabular-nums">{money(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="font-semibold tabular-nums">{money(shipping)}</span>
        </div>
        {discount ? (
          <div className="flex justify-between py-1 text-sm">
            <span className="text-slate-600">Discount</span>
            <span className="font-semibold tabular-nums">-{money(discount)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between border-t-2 border-slate-900 pt-2 text-lg font-extrabold">
          <span>Total</span>
          <span className="tabular-nums">{money(total)}</span>
        </div>
      </div>

      <div className="mt-12 border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Thank you for your order with ZoeLit.</p>
        <p className="mt-1">This invoice was generated automatically. For order queries contact support@zoelit.com</p>
      </div>
    </div>
  );
}