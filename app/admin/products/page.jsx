import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Select } from "@/components/ui";
import { adminProducts, categories } from "@/lib/admin-data";
import { money } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <div>
      <AdminPageHeader title="Products" description="Design-only product management for catalog items, pricing, images, ratings, and stock levels." action={<Button asChild href="/admin/products/new"><Plus className="size-4" />New product</Button>} />
      <Card className="mt-8"><div className="mb-4"><h2 className="text-base font-bold">Catalog filters</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quickly narrow products by category and stock health.</p></div><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search products" /><Select><option>All categories</option>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</Select><Select><option>All stock</option><option>In stock</option><option>Low stock</option></Select><Button variant="secondary">Reset filters</Button></div></Card>
      <AdminTable className="mt-6" columns={["Product", "Category", "Price", "Stock", "Rating", "Status", ""]}>
        {adminProducts.map((product) => <AdminTableRow key={product.id}><AdminTableCell><div className="flex items-center gap-3"><Image src={product.image} alt={product.name} width={56} height={56} className="size-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800" /><div><p className="font-bold text-slate-950 dark:text-white">{product.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{product.sku}</p></div></div></AdminTableCell><AdminTableCell>{product.category}</AdminTableCell><AdminTableCell className="font-bold tabular-nums text-slate-950 dark:text-white">{money(product.price)}</AdminTableCell><AdminTableCell className="tabular-nums">{product.stock}</AdminTableCell><AdminTableCell className="tabular-nums">{product.rating}</AdminTableCell><AdminTableCell><AdminStatusBadge>{product.status}</AdminStatusBadge></AdminTableCell><AdminTableCell><Link aria-label={`Edit ${product.name}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10" href={`/admin/products/${product.id}`}><Pencil className="size-4" /></Link></AdminTableCell></AdminTableRow>)}
      </AdminTable>
    </div>
  );
}
