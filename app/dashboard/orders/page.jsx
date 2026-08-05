"use client";

import { useState } from "react";
import { orders, statuses } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, Input, Select } from "@/components/ui";

export default function OrdersPage() {
  const [status, setStatus] = useState("All");
  const [from, setFrom] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 4;
  const filtered = orders.filter((order) => (status === "All" || order.status === status) && (!from || new Date(order.date) >= new Date(from)));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
  return <div><div><p className="font-bold text-blue-600">Orders</p><h1 className="text-4xl font-black">My Orders</h1></div><Card className="mt-8"><div className="mb-6 grid gap-3 md:grid-cols-3"><Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</Select><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /><Button variant="secondary" onClick={() => { setStatus("All"); setFrom(""); setPage(1); }}>Reset filters</Button></div>{pageItems.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-500 dark:text-slate-400"><tr><th className="py-3">Order Number</th><th>Date</th><th>Status</th><th>Total Amount</th><th></th></tr></thead><tbody>{pageItems.map((order) => <tr key={order.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-4 font-bold">#{order.id}</td><td>{shortDate(order.date)}</td><td><Badge>{order.status}</Badge></td><td className="font-bold">{money(order.total)}</td><td><Button asChild href={`/dashboard/orders/${order.id}`} size="sm" variant="outline">View Details</Button></td></tr>)}</tbody></table></div> : <EmptyState title="No orders found" description="Change your filters or place a new order to see it here." action={<Button asChild href="/products">Shop now</Button>} />}{filtered.length > perPage ? <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="secondary" disabled={page * perPage >= filtered.length} onClick={() => setPage(page + 1)}>Next</Button></div> : null}</Card></div>;
}
