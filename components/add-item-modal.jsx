"use client";

import { X, Upload, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Button, Input } from "@/components/ui";

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

export function AddItemModal({ open, onClose, type, categories = [], onSubmit, submitting }) {
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "", sku: "", description: "", category: "", price: "", stock: "",
    status: "active",
  });

  useEffect(() => {
    if (open) {
      setImagePreview("");
      setImageUrlInput("");
      setForm({
        name: "", sku: "", description: "", category: "", price: "", stock: "",
        status: "active",
      });
    }
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
        imageUrl,
        isActive,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
      });
      resetForm();
    } else {
      if (!form.sku.trim()) {
        toast.error("Product SKU is required");
        return;
      }
      await onSubmit({
        ingramPartNumber: form.sku.trim(),
        description: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        imageUrl,
        isActive,
      });
      resetForm();
    }
  }

  function resetForm() {
    setImagePreview("");
    setImageUrlInput("");
    setForm({
      name: "", sku: "", description: "", category: "", price: "", stock: "",
      status: "active",
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-lg border border-outline-variant bg-surface-container-lowest shadow-lg overflow-hidden">

        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="font-heading text-headline-sm font-semibold text-on-surface">
            {type === "category" ? "Add New Category" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {type === "category" ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Category Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter category name"
                  className="h-12"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Category description (optional)"
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Price ($)</label>
                  <Input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Stock</label>
                  <Input
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    type="number"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Status</label>
                  <span className="relative inline-flex w-full">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={`h-12 w-full appearance-none rounded-sm border px-3 pr-8 text-label-md font-semibold transition-colors ${
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
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Image</label>
                  <div className="flex gap-2">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => { setImageUrlInput(e.target.value); setImagePreview(""); }}
                      placeholder="URL or upload"
                      className="h-12 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-12 shrink-0 items-center gap-1.5 rounded-sm border border-outline-variant bg-surface-container-lowest px-3 text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                    >
                      <Upload className="size-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </div>
                </div>
              </div>
              {imagePreview && (
                <div className="relative inline-block self-start">
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md object-cover ring-1 ring-outline-variant" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">SKU *</label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Part Number"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Product Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Product name"
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Category</label>
                  <span className="relative inline-flex w-full">
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="h-12 w-full appearance-none rounded-sm border border-outline-variant bg-surface-container-lowest px-3 pr-8 text-label-md font-semibold text-on-surface"
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
                      className={`h-12 w-full appearance-none rounded-sm border px-3 pr-8 text-label-md font-semibold transition-colors ${
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Price ($)</label>
                  <Input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Stock</label>
                  <Input
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    type="number"
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-label-md font-semibold text-on-surface-variant">Image</label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => { setImageUrlInput(e.target.value); setImagePreview(""); }}
                    placeholder="URL or upload"
                    className="h-12 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-12 shrink-0 items-center gap-1.5 rounded-sm border border-outline-variant bg-surface-container-lowest px-3 text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                  >
                    <Upload className="size-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
              </div>
              {imagePreview && (
                <div className="relative inline-block self-start">
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md object-cover ring-1 ring-outline-variant" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
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
