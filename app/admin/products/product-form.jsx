import Image from "next/image";
import { Save } from "lucide-react";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { categories } from "@/lib/admin-data";

export function ProductForm({ product, mode }) {
  const preview = product?.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80";
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card><h2 className="text-h2 font-semibold">Basic information</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Keep the product title, URL, and display status clear for operators.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Product name"><Input defaultValue={product?.name || ""} placeholder="Luna Knit Sneaker" /></Field><Field label="Product ID / slug"><Input defaultValue={product?.id || ""} placeholder="luna-sneaker" /></Field><Field label="Category"><Select defaultValue={product?.category || categories[0]?.name}>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</Select></Field><Field label="Status"><Select defaultValue={product?.status || "Active"}><option>Active</option><option>Draft</option><option>Low Stock</option><option>Archived</option></Select></Field></div><Field className="mt-4" label="Description"><Textarea defaultValue={product?.description || ""} placeholder="Short product description" /></Field></Card>
        <Card><h2 className="text-h2 font-semibold">Pricing and stock</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Show commercial values in one compact decision area.</p><div className="mt-5 grid gap-4 md:grid-cols-3"><Field label="Price"><Input defaultValue={product?.price || ""} className="tabular-nums" /></Field><Field label="Compare-at price"><Input defaultValue={product?.compareAtPrice || ""} className="tabular-nums" /></Field><Field label="Stock quantity"><Input defaultValue={product?.stock || ""} className="tabular-nums" /></Field></div></Card>
        <Card><h2 className="text-h2 font-semibold">Product content</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Separate selling points from technical details for easier editing.</p><Field className="mt-5" label="Highlights"><Textarea className="min-h-32" defaultValue={product?.highlights?.join("\n") || ""} placeholder="One highlight per line" /></Field><Field className="mt-4" label="Details"><Textarea className="min-h-32" defaultValue={product?.details ? Object.entries(product.details).map(([key, value]) => `${key}: ${value}`).join("\n") : ""} placeholder="Material: Recycled knit" /></Field></Card>
      </div>
      <div className="space-y-6"><Card><h2 className="text-h2 font-semibold">Media preview</h2><p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Preview how the product image will feel in the catalog.</p><div className="mt-5 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"><Image src={preview} alt="Product preview" width={720} height={720} className="aspect-square w-full object-cover" /></div><Field className="mt-4" label="Image URL"><Input defaultValue={product?.image || ""} placeholder="https://..." /></Field></Card><Card className="sticky top-24"><h2 className="text-h2 font-semibold">Actions</h2><p className="mt-2 text-body font-regular text-slate-500 dark:text-slate-400">{mode === "create" ? "Add" : "Update"} product UI only. No backend request will run.</p><Button className="mt-5 w-full"><Save className="size-4" />{mode === "create" ? "Save product" : "Update product"}</Button><Button className="mt-3 w-full" variant="outline">Preview storefront</Button></Card></div>
    </div>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
