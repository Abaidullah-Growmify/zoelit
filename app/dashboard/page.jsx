import Link from "next/link";
import { ArrowRight, Package, Clock, Wallet } from "lucide-react";
import { customer, orders } from "@/lib/data";
import { money, shortDate } from "@/lib/utils";
import { Badge, Button, Card, PageHeader } from "@/components/ui";

export default function DashboardPage() {
  const pending = orders.filter((order) => ["Pending", "Processing"].includes(order.status)).length;
  const spent = orders.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Customer panel"
        title={`Welcome back, ${customer.name.split(" ")[0]}`}
        description="Track orders, manage addresses, and keep checkout effortless."
        action={<Button asChild href="/products">Continue Shopping <ArrowRight className="size-4" /></Button>}
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Orders", value: orders.length, icon: Package },
          { label: "Pending Orders", value: pending, icon: Clock },
          { label: "Total Spent", value: money(spent), icon: Wallet },
        ].map((stat) => (
          <Card key={stat.label}>
            <stat.icon className="size-7 text-blue-600" />
            <p className="mt-5 text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold tabular-nums">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <Link href="/dashboard/orders" aria-label="Open all orders" className="grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3">Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-4 font-bold tabular-nums">#{order.id}</td>
                  <td>{shortDate(order.date)}</td>
                  <td><Badge>{order.status}</Badge></td>
                  <td className="font-bold tabular-nums">{money(order.total)}</td>
                  <td>
                    <Link aria-label={`Open order ${order.id}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/dashboard/orders/${order.id}`}>
                      <ArrowRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-slate-100 dark:border-slate-800">
                <td colSpan={5} className="py-4 text-center"><Button asChild href="/dashboard/orders" variant="secondary">View all orders</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
