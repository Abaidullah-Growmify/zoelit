"use client";

import { X, Upload, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button, Input, Textarea } from "@/components/ui";
import { getCategoryIconOptions } from "@/lib/category-icons";

function compressImage(file, maxWidth = 400, quality = 0.6) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w);
          w = maxWidth;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-label-md font-bold uppercase tracking-wide text-on-surface-variant">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </h3>
  );
}

export function AddItemModal({ open, onClose, type, categories = [], onSubmit, submitting }) {
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);
const [form, setForm] = useState({
    name: "", sku: "", description: "", category: "", icon: "Package", price: "", stock: "",
    status: "active",
    vendor: "", vendorPartNumber: "", upc: "", subCategory: "", productType: "",
    availability: "", warranty: "", details: "",
  });
  const categoryIconOptions = getCategoryIconOptions(form.name);

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => {
        setImagePreview("");
        setImageUrlInput("");
        setForm({
          name: "", sku: "", description: "", category: "", icon: "Package", price: "", stock: "",
          status: "active",
          vendor: "", vendorPartNumber: "", upc: "", subCategory: "", productType: "",
          availability: "", warranty: "", details: "",
        });
      }, 0);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 0.6);
      setImagePreview(compressed);
      setImageUrlInput("");
    } catch {
      toast.error("Failed to process image");
    }
    e.target.value = "";
  }

  function handleRemoveImage() {
    setImagePreview("");
    setImageUrlInput("");
  }

  async function handleCreate() {
    const imageUrl = imagePreview || imageUrlInput.trim();
    const isActive = form.status === "active";

    if (type === "category") {
      if (!form.name.trim()) {
        toast.error("Category name is required");
        return;
      }
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        isActive,
        stock: Number(form.stock) || 0,
      });
      resetForm();
    } else {
      if (!form.sku.trim()) {
        toast.error("Product SKU is required");
        return;
      }
      if (!form.category.trim()) {
        toast.error("Please select a category");
        return;
      }
await onSubmit({
        ingramPartNumber: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        imageUrl,
        isActive,
        vendorName: form.vendor.trim(),
        vendorPartNumber: form.vendorPartNumber.trim(),
        upcCode: form.upc.trim(),
        subCategory: form.subCategory.trim(),
        productType: form.productType.trim(),
        availability: form.availability.trim(),
        warranty: form.warranty.trim(),
        details: form.details.trim(),
      });
      resetForm();
    }
  }

  function resetForm() {
    setImagePreview("");
    setImageUrlInput("");
    setForm({
      name: "", sku: "", description: "", category: "", icon: "Package", price: "", stock: "",
      status: "active",
      vendor: "", vendorPartNumber: "", upc: "", subCategory: "", productType: "",
      availability: "", warranty: "", details: "",
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 flex w-full ${type === "category" ? "max-w-lg" : "max-w-2xl"} max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl`}>

        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-on-surface">
            {type === "category" ? "Add New Category" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="icon-btn size-8">
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-6 py-5">
          {type === "category" ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Category Name *</label>
                <Input
                  value={form.name}
                   onChange={(e) => { const name = e.target.value; const options = getCategoryIconOptions(name); setForm({ ...form, name, icon: options.some((item) => item.value === form.icon) ? form.icon : options[0].value }); }}
                  placeholder="Enter category name"
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Category description (optional)"
                  className="h-10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Stock</label>
                <Input
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  type="number"
className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Status</label>
                  <span className="relative inline-flex w-full">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={`h-10 w-full appearance-none rounded-xl border px-3 pr-8 text-sm font-medium transition-colors ${
                        form.status === "active"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-rose-300 bg-rose-50 text-rose-700"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 ${form.status === "active" ? "text-emerald-600" : "text-rose-600"}`} />
                  </span>
                </div>
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Category icon</label>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="h-10 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm font-medium text-on-surface">
                    {categoryIconOptions.map((icon) => <option key={icon.value} value={icon.value}>{icon.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
) : (
            <div className="flex flex-col gap-4">
              <div>
                <SectionTitle>Basic information</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">SKU *</label>
                    <Input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="Part Number"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Product Name *</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Product name"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Category</label>
                    <span className="relative inline-flex w-full">
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="h-10 w-full appearance-none rounded-xl border border-outline-variant bg-surface px-3 pr-8 text-sm font-medium text-on-surface"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    </span>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Status</label>
                    <span className="relative inline-flex w-full">
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className={`h-10 w-full appearance-none rounded-xl border px-3 pr-8 text-sm font-medium transition-colors ${
                          form.status === "active"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-rose-300 bg-rose-50 text-rose-700"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 ${form.status === "active" ? "text-emerald-600" : "text-rose-600"}`} />
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle>Pricing &amp; inventory</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Price ($)</label>
                    <Input
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Stock</label>
                    <Input
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="0"
                      type="number"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Availability</label>
                    <span className="relative inline-flex w-full">
                      <select
                        value={form.availability}
                        onChange={(e) => setForm({ ...form, availability: e.target.value })}
                        className="h-10 w-full appearance-none rounded-xl border border-outline-variant bg-surface px-3 pr-8 text-sm font-medium text-on-surface"
                      >
                        <option value="">Select availability</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Pre-Order">Pre-Order</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle>Vendor &amp; product details</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Vendor</label>
                    <Input
                      value={form.vendor}
                      onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                      placeholder="e.g. I-Tec"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Vendor part number</label>
                    <Input
                      value={form.vendorPartNumber}
                      onChange={(e) => setForm({ ...form, vendorPartNumber: e.target.value })}
                      placeholder="e.g. U3METALGLAN"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">UPC</label>
                    <Input
                      value={form.upc}
                      onChange={(e) => setForm({ ...form, upc: e.target.value })}
                      placeholder="e.g. 8595611701863"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Subcategory</label>
                    <Input
                      value={form.subCategory}
                      onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                      placeholder="e.g. Usb Cable"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Product type</label>
                    <Input
                      value={form.productType}
                      onChange={(e) => setForm({ ...form, productType: e.target.value })}
                      placeholder="e.g. Gigabit Ethernet Card"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Warranty</label>
                    <Input
                      value={form.warranty}
                      onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                      placeholder="e.g. Included"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle>Media &amp; description</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Image</label>
                    <div className="flex gap-2">
                      <Input
                        value={imageUrlInput}
                        onChange={(e) => { setImageUrlInput(e.target.value); setImagePreview(""); }}
                        placeholder="URL or upload"
                        className="h-10 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="icon-btn h-10 w-10 shrink-0"
                      >
                        <Upload className="size-4" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </div>
                    {imagePreview ? (
                      <div className="relative h-36 overflow-hidden rounded-lg ring-1 ring-outline-variant">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-36 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-outline-variant text-on-surface-variant transition hover:border-primary/60 hover:bg-surface-container-low"
                      >
                        <Upload className="size-5" />
                        <span className="text-label-md font-semibold">Upload image</span>
                        <span className="text-meta font-normal">or paste a URL above</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Details</label>
                    <Textarea
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      placeholder="Full product details shown in the product page"
                      rows={4}
                      className="h-[8.5rem] w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-outline-variant px-6 py-4">
          <Button variant="ghost" onClick={onClose} className="h-11 px-5">Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting} className="h-11 px-6">
            {submitting ? "Creating..." : type === "category" ? "Create Category" : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
