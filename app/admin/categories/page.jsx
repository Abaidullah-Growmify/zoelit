import { Pencil, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable, AdminTableCell, AdminTableRow } from "@/components/admin-table";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { categories } from "@/lib/admin-data";

export default function AdminCategoriesPage() {
  return (
    <div>
      <AdminPageHeader title="Categories" description="Organize storefront products by collection, merchandising group, and shop navigation label." action={<Button><Plus className="size-4" />Add category</Button>} />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminTable columns={["Name", "Slug", "Products", "Status", ""]}>
          {categories.map((category) => <AdminTableRow key={category.id}><AdminTableCell className="font-black text-slate-950 dark:text-white">{category.name}</AdminTableCell><AdminTableCell>{category.slug}</AdminTableCell><AdminTableCell>{category.productCount}</AdminTableCell><AdminTableCell><AdminStatusBadge>{category.status}</AdminStatusBadge></AdminTableCell><AdminTableCell><button aria-label={`Edit ${category.name}`} className="inline-grid size-9 place-items-center rounded-lg text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10"><Pencil className="size-4" /></button></AdminTableCell></AdminTableRow>)}
        </AdminTable>
        <Card><h2 className="text-xl font-black">Category form</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create or update navigation-ready product groups.</p><div className="mt-5 space-y-4"><Field label="Category name"><Input placeholder="Footwear" /></Field><Field label="Slug"><Input placeholder="footwear" /></Field><Field label="Description"><Textarea placeholder="Short category description" /></Field><Button className="w-full">Save category</Button></div></Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
