"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { getProductCategories, updateAdminProduct } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function ProductForm({ product, mode }) {
  const token = useAdminAuthStore((state) => state.token);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => ({
    name: product?.name || "",
    sku: product?.sku || product?.ingramPartNumber || "",
    category: product?.category || "",
    description: product?.description || "",
    price: product?.price != null ? String(product.price) : "",
    stock: product?.stock != null ? String(product.stock) : "",
    imageUrl: product?.imageUrl || product?.image || "",
    status: product?.isActive === false ? "Paused" : "Active",
  }));

  useEffect(() => {
    let active = true;
    getProductCategories()
      .then((data) => {
        if (!active) return;
        setCategories((data.categories || []).map((item) => item.name).filter(Boolean));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const data = await updateAdminProduct(values.sku, {
        name: values.name,
        description: values.description,
        category: values.category,
        price: values.price,
        stock: values.stock,
        imageUrl: values.imageUrl,
        isActive: values.status === "Active",
      }, token);
      toast.success(data.message || "Product updated");
    } catch (error) {
      toast.error(error.message || "Could not update product");
    } finally {
      setSaving(false);
    }
  }

  const preview = values.imageUrl || FALLBACK_IMAGE;

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Basic information</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Manage the product title, category, and display status.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Product name"><Input value={values.name} onChange={(event) => setValue("name", event.target.value)} placeholder="Product name" /></Field>
            <Field label="Ingram part number / SKU"><Input value={values.sku} disabled /></Field>
            <Field label="Category"><Select value={values.category} onChange={(event) => setValue("category", event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</Select></Field>
            <Field label="Status"><Select value={values.status} onChange={(event) => setValue("status", event.target.value)}><option>Active</option><option>Paused</option></Select></Field>
          </div>
          <Field className="mt-4" label="Description"><Textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} placeholder="Short product description" /></Field>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Pricing and stock</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Show commercial values in one compact decision area.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Price"><Input value={values.price} onChange={(event) => setValue("price", event.target.value)} className="tabular-nums" inputMode="decimal" /></Field>
            <Field label="Stock quantity"><Input value={values.stock} onChange={(event) => setValue("stock", event.target.value)} className="tabular-nums" inputMode="numeric" /></Field>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Media preview</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Preview how the product image will feel in the catalog.</p>
          <div className="mt-5 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <Image src={preview} alt="Product preview" width={720} height={720} className="aspect-square w-full object-cover" />
          </div>
          <Field className="mt-4" label="Image URL"><Input value={values.imageUrl} onChange={(event) => setValue("imageUrl", event.target.value)} placeholder="https://..." /></Field>
        </Card>
        <Card className="sticky top-24">
          <h2 className="font-heading text-h2 font-semibold">Actions</h2>
          <p className="mt-2 text-body font-regular text-slate-500 dark:text-slate-400">{mode === "create" ? "New products are added through the Ingram Micro catalog sync." : "Changes are saved to the live product catalog."}</p>
          <Button className="mt-5 w-full" onClick={handleSave} disabled={saving || mode === "create"}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{mode === "create" ? "Added via catalog sync" : "Update product"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
