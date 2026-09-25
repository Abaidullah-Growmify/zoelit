"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { getProductCategories, updateAdminProduct, createManualProduct } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function ProductForm({ product, mode, readOnly = false }) {
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => ({
    name: product?.name || "",
    sku: product?.sku || product?.ingramPartNumber || "",
    category: product?.category || "",
    description: product?.description || "",
    price: product?.price != null ? String(product.price) : "",
    stock: product?.stock != null ? String(product.stock) : "",
    status: product?.isActive === false ? "Paused" : "Active",
    imageUrl: product?.imageUrl || product?.image || "",
    vendor: product?.vendorName || "",
    vendorPartNumber: product?.vendorPartNumber || "",
    upc: product?.upcCode || "",
    subCategory: product?.subCategory || "",
    productType: product?.productType || "",
    availability: product?.availability || "",
    warranty: product?.hasWarranty ? "Included" : "",
    details: product?.extraDescription || "",
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
    if (mode === "create") {
      if (!values.sku.trim()) {
        toast.error("Part number / SKU is required");
        return;
      }
      if (!values.name.trim()) {
        toast.error("Product name is required");
        return;
      }
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const data = await createManualProduct({
          ingramPartNumber: values.sku.trim(),
          name: values.name,
          description: values.description,
          category: values.category,
          price: values.price,
          stock: values.stock,
          imageUrl: values.imageUrl,
          isActive: values.status === "Active",
          vendorName: values.vendor,
          vendorPartNumber: values.vendorPartNumber,
          upcCode: values.upc,
          subCategory: values.subCategory,
          productType: values.productType,
          availability: values.availability,
          warranty: values.warranty,
          details: values.details,
        }, token);
        toast.success(data.message || "Product created");
        router.push("/admin/products");
      } else {
        const data = await updateAdminProduct(values.sku, {
          name: values.name,
          description: values.description,
          category: values.category,
          price: values.price,
          stock: values.stock,
          imageUrl: values.imageUrl,
          isActive: values.status === "Active",
          vendorName: values.vendor,
          vendorPartNumber: values.vendorPartNumber,
          upcCode: values.upc,
          subCategory: values.subCategory,
          productType: values.productType,
          availability: values.availability,
          warranty: values.warranty,
          details: values.details,
        }, token);
        toast.success(data.message || "Product updated");
      }
    } catch (error) {
      toast.error(error.message || mode === "create" ? "Could not create product" : "Could not update product");
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
            <Field label="Product name"><Input value={values.name} onChange={(event) => setValue("name", event.target.value)} placeholder="Product name" disabled={readOnly} /></Field>
            <Field label="Part number / SKU"><Input value={values.sku} onChange={(event) => setValue("sku", event.target.value)} placeholder="Unique part number" disabled={readOnly || mode !== "create"} /></Field>
            <Field label="Category"><Select value={values.category} onChange={(event) => setValue("category", event.target.value)} disabled={readOnly}><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</Select></Field>
            <Field label="Status"><Select value={values.status} onChange={(event) => setValue("status", event.target.value)} disabled={readOnly}><option>Active</option><option>Paused</option></Select></Field>
          </div>
          <Field className="mt-4" label="Description"><Textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} placeholder="Short product description" disabled={readOnly} /></Field>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Pricing and inventory</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Show commercial values in one compact decision area.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Price"><Input value={values.price} onChange={(event) => setValue("price", event.target.value)} className="tabular-nums" inputMode="decimal" disabled={readOnly} /></Field>
            <Field label="Stock quantity"><Input value={values.stock} onChange={(event) => setValue("stock", event.target.value)} className="tabular-nums" inputMode="numeric" disabled={readOnly} /></Field>
            <Field label="Availability"><Select value={values.availability} onChange={(event) => setValue("availability", event.target.value)} disabled={readOnly}><option value="">Select availability</option><option>In Stock</option><option>Out of Stock</option><option>Pre-Order</option></Select></Field>
          </div>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Product details</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Catalog identifiers that appear in the product information panel.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Vendor"><Input value={values.vendor} onChange={(event) => setValue("vendor", event.target.value)} placeholder="e.g. I-Tec" disabled={readOnly} /></Field>
            <Field label="Vendor part number"><Input value={values.vendorPartNumber} onChange={(event) => setValue("vendorPartNumber", event.target.value)} placeholder="e.g. U3METALGLAN" disabled={readOnly} /></Field>
            <Field label="UPC"><Input value={values.upc} onChange={(event) => setValue("upc", event.target.value)} placeholder="e.g. 8595611701863" disabled={readOnly} /></Field>
            <Field label="Subcategory"><Input value={values.subCategory} onChange={(event) => setValue("subCategory", event.target.value)} placeholder="e.g. Usb Cable" disabled={readOnly} /></Field>
            <Field label="Product type"><Input value={values.productType} onChange={(event) => setValue("productType", event.target.value)} placeholder="e.g. Gigabit Ethernet Card" disabled={readOnly} /></Field>
            <Field label="Warranty"><Input value={values.warranty} onChange={(event) => setValue("warranty", event.target.value)} placeholder="e.g. Included" disabled={readOnly} /></Field>
          </div>
          <Field className="mt-4" label="Details"><Textarea value={values.details} onChange={(event) => setValue("details", event.target.value)} placeholder="Full product details shown in the product page" disabled={readOnly} /></Field>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Media preview</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Preview how the product image will feel in the catalog.</p>
          <div className="mt-5 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            <Image src={preview} alt="Product preview" width={720} height={720} className="aspect-square w-full object-cover" />
          </div>
          <Field className="mt-4" label="Image URL"><Input value={values.imageUrl} onChange={(event) => setValue("imageUrl", event.target.value)} placeholder="https://..." disabled={readOnly} /></Field>
        </Card>
        <Card className="sticky top-24">
          <h2 className="font-heading text-h2 font-semibold">Actions</h2>
          <p className="mt-2 text-body font-regular text-slate-500 dark:text-slate-400">{readOnly ? "This product is synced from Ingram Micro. Its data can only be changed by a new catalog sync." : mode === "create" ? "The product is added to the live catalog as a manual product." : "Changes are saved to the live product catalog."}</p>
          <Button className="mt-5 w-full" onClick={handleSave} disabled={saving || readOnly} title={readOnly ? "Ingram data cannot be edited" : undefined}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{readOnly ? "Ingram — read only" : mode === "create" ? "Add product" : "Update product"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}