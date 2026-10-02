"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { getProductCategories, updateAdminProduct, createManualProduct, uploadProductImage } from "@/lib/api";
import { FALLBACK_IMAGE } from "@/lib/product-mapper";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function ProductForm({ product, mode, readOnly = false }) {
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);
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
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const errField = (key) => (fieldErrors[key] ? "border-error shadow-[0_0_0_3px_rgba(244,63,94,0.22)]" : "");

  useEffect(() => {
    return () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  // Picking a file only stages it for a local preview. Nothing is uploaded
  // until the admin clicks Add/Update product, so a stray file never wastes a
  // Cloudinary slot and there is no upload toast to confuse the save feedback.
  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview(URL.createObjectURL(file));
    setPendingImage(file);
    setFieldErrors((prev) => {
      if (!("image" in prev)) return prev;
      const next = { ...prev };
      delete next.image;
      return next;
    });
  }

  function handleRemoveImage() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingImage(null);
    setPendingPreview("");
    setValue("imageUrl", "");
  }

  async function handleSave() {
    if (!token) return;

    // Required fields must be filled before anything is sent to the database
    // (or Cloudinary). Empty fields light up red and the first one is focused;
    // nothing is created or updated until every requirement passes.
    const requiredFields = [
      { key: "name", label: "Product name" },
      { key: "sku", label: "Part number / SKU" },
      { key: "category", label: "Category" },
      { key: "price", label: "Price" },
      { key: "upc", label: "UPC code" },
      { key: "warranty", label: "Warranty" },
      { key: "vendor", label: "Vendor name" },
      { key: "vendorPartNumber", label: "Vendor part number" },
      { key: "stock", label: "Stock quantity" },
    ];
    const missing = {};
    for (const field of requiredFields) {
      if (!String(values[field.key] ?? "").trim()) missing[field.key] = true;
    }
    if (!pendingImage && !String(values.imageUrl || "").trim()) missing.image = true;

    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      requestAnimationFrame(() => {
        const firstKey = requiredFields.find((field) => missing[field.key])?.key || "image";
        const first = document.getElementById(`pf-${firstKey}`);
        if (first) {
          first.focus();
          first.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
      return;
    }

    setSaving(true);
    try {
      // A staged image is sent to Cloudinary right before the product is
      // created/updated. If that fails the product is left untouched so we
      // never end up with a placeholder product or a broken image URL.
      let imageUrl = values.imageUrl;
      if (pendingImage) {
        try {
          const result = await uploadProductImage(pendingImage, token);
          imageUrl = result.url;
        } catch (uploadError) {
          toast.error(uploadError.message || "Could not upload the image; product was not saved");
          return;
        }
      }

      if (mode === "create") {
        const data = await createManualProduct({
          ingramPartNumber: values.sku.trim(),
          name: values.name,
          description: values.description,
          category: values.category,
          price: values.price,
          stock: values.stock,
          imageUrl,
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
          imageUrl,
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

  const preview = pendingPreview || values.imageUrl || FALLBACK_IMAGE;

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Basic information</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Manage the product title, category, and display status.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={<>Product name <span className="text-rose-500">*</span></>}><Input id="pf-name" value={values.name} onChange={(event) => setValue("name", event.target.value)} placeholder="Product name" disabled={readOnly} className={errField("name")} /></Field>
            <Field label={<>Part number / SKU <span className="text-rose-500">*</span></>}><Input id="pf-sku" value={values.sku} onChange={(event) => setValue("sku", event.target.value)} placeholder="Unique part number" disabled={readOnly || mode !== "create"} className={errField("sku")} /></Field>
            <Field label={<>Category <span className="text-rose-500">*</span></>}><Select id="pf-category" value={values.category} onChange={(event) => setValue("category", event.target.value)} disabled={readOnly} className={errField("category")}><option value="">Select category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</Select></Field>
            <Field label="Status"><Select value={values.status} onChange={(event) => setValue("status", event.target.value)} disabled={readOnly}><option>Active</option><option>Paused</option></Select></Field>
          </div>
          <Field className="mt-4" label="Description"><Textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} placeholder="Short product description" disabled={readOnly} /></Field>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Pricing and inventory</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Show commercial values in one compact decision area.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label={<>Price <span className="text-rose-500">*</span></>}><Input id="pf-price" value={values.price} onChange={(event) => setValue("price", event.target.value)} className={`tabular-nums ${errField("price")}`} inputMode="decimal" disabled={readOnly} /></Field>
            <Field label={<>Stock quantity <span className="text-rose-500">*</span></>}><Input id="pf-stock" value={values.stock} onChange={(event) => setValue("stock", event.target.value)} className={`tabular-nums ${errField("stock")}`} inputMode="numeric" disabled={readOnly} /></Field>
            <Field label="Availability"><Select value={values.availability} onChange={(event) => setValue("availability", event.target.value)} disabled={readOnly}><option value="">Select availability</option><option>In Stock</option><option>Out of Stock</option><option>Pre-Order</option></Select></Field>
          </div>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Product details</h2>
          <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Catalog identifiers that appear in the product information panel.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={<>Vendor <span className="text-rose-500">*</span></>}><Input id="pf-vendor" value={values.vendor} onChange={(event) => setValue("vendor", event.target.value)} placeholder="e.g. I-Tec" disabled={readOnly} className={errField("vendor")} /></Field>
            <Field label={<>Vendor part number <span className="text-rose-500">*</span></>}><Input id="pf-vendorPartNumber" value={values.vendorPartNumber} onChange={(event) => setValue("vendorPartNumber", event.target.value)} placeholder="e.g. U3METALGLAN" disabled={readOnly} className={errField("vendorPartNumber")} /></Field>
            <Field label={<>UPC <span className="text-rose-500">*</span></>}><Input id="pf-upc" value={values.upc} onChange={(event) => setValue("upc", event.target.value)} placeholder="e.g. 8595611701863" disabled={readOnly} className={errField("upc")} /></Field>
            <Field label="Subcategory"><Input value={values.subCategory} onChange={(event) => setValue("subCategory", event.target.value)} placeholder="e.g. Usb Cable" disabled={readOnly} /></Field>
            <Field label="Product type"><Input value={values.productType} onChange={(event) => setValue("productType", event.target.value)} placeholder="e.g. Gigabit Ethernet Card" disabled={readOnly} /></Field>
            <Field label={<>Warranty <span className="text-rose-500">*</span></>}><Input id="pf-warranty" value={values.warranty} onChange={(event) => setValue("warranty", event.target.value)} placeholder="e.g. Included" disabled={readOnly} className={errField("warranty")} /></Field>
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
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1 gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={saving || readOnly}>
              <Upload className="size-4" />{pendingImage ? "Change image" : "Upload image"}
            </Button>
            {(pendingImage || values.imageUrl) && !readOnly ? <Button type="button" variant="outline" onClick={handleRemoveImage} disabled={saving} className="shrink-0">Remove</Button> : null}
          </div>
          <Field className="mt-4" label={<>Image URL (from Cloudinary) <span className="text-rose-500">*</span></>}>
            <Input id="pf-image" value={values.imageUrl} onChange={(event) => setValue("imageUrl", event.target.value)} placeholder="https://res.cloudinary.com/.../zoelit/products/..." disabled={readOnly || Boolean(pendingImage)} className={errField("image")} />
          </Field>
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