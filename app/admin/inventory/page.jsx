import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Select } from "@/components/ui";
import { inventory } from "@/lib/admin-data";
import { shortDate } from "@/lib/utils";

export default function AdminInventoryPage() {
  return (
    <div>
      <AdminPageHeader title="Inventory" description="Track stock health, low-stock thresholds, SKU references, and quick adjustment controls." />
      <Card className="mt-8"><div className="mb-4"><h2 className="text-base font-bold">Inventory controls</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Monitor SKU health and identify products needing replenishment.</p></div><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search SKU or product" /><Select><option>All stock states</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></Select><Select><option>All categories</option></Select><Button variant="secondary">Reset</Button></div></Card>
      <AdminTable className="mt-6" columns={["Product", "SKU", "Category", "Stock", "Threshold", "Status", "Updated", ""]}>
        {inventory.map((item) => <AdminTableRow key={item.productId}><AdminTableCell className="font-bold text-slate-950 dark:text-white">{item.productName}</AdminTableCell><AdminTableCell>{item.sku}</AdminTableCell><AdminTableCell>{item.category}</AdminTableCell><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">{item.currentStock}</AdminTableCell><AdminTableCell className="tabular-nums">{item.threshold}</AdminTableCell><AdminTableCell><AdminStatusBadge>{item.status}</AdminStatusBadge></AdminTableCell><AdminTableCell>{shortDate(item.lastUpdated)}</AdminTableCell><AdminTableCell><Link aria-label={`Adjust ${item.productName}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/products/${item.productId}`}><Pencil className="size-4" /></Link></AdminTableCell></AdminTableRow>)}
      </AdminTable>
    </div>
  );
}
