"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import { createManualCategory, updateAdminCategory } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function CategoryForm({ category, mode }) {
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(() => ({
    name: category?.name || "",
    slug: category?.slug || "",
    status: category?.status || (category?.isActive === false ? "Archived" : "Active"),
    displayOrder: category?.displayOrder || "",
    description: category?.description || "",
    navigationLabel: category?.navigationLabel || category?.name || "",
    heroImageUrl: category?.heroImageUrl || "",
    seoSummary: category?.seoSummary || "",
  }));

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    const name = values.name.trim();
    if (name.length < 2) {
      toast.error("Category name must be at least 2 characters");
      return;
    }
    if (!token) return;

    setSaving(true);
    try {
      const payload = {
        name,
        description: values.description.trim(),
        icon: "Package",
        isActive: values.status === "Active",
        stock: 0,
      };
      if (mode === "create") await createManualCategory(payload, token);
      else await updateAdminCategory(category.name, payload, token);
      toast.success(mode === "create" ? "Category created" : "Category updated");
      router.push("/admin/categories");
    } catch (error) {
      toast.error(error.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Basic information</h2>
          <p className="mt-1 text-body-md font-normal text-on-surface-variant">Create the storefront grouping, URL slug, and admin-facing status.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Category name"><Input value={values.name} onChange={(event) => setValue("name", event.target.value)} placeholder="Footwear" required /></Field>
            <Field label="Slug"><Input value={values.slug} onChange={(event) => setValue("slug", event.target.value)} placeholder="footwear" /></Field>
            <Field label="Status"><Select value={values.status} onChange={(event) => setValue("status", event.target.value)}><option>Active</option><option>Draft</option><option>Archived</option></Select></Field>
            <Field label="Display order"><Input value={values.displayOrder} onChange={(event) => setValue("displayOrder", event.target.value)} className="tabular-nums" placeholder="1" /></Field>
          </div>
          <Field className="mt-4" label="Description"><Textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} placeholder="Short category description" /></Field>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Merchandising</h2>
          <p className="mt-1 text-body-md font-normal text-on-surface-variant">Optional content for collection pages and navigation placement.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Navigation label"><Input value={values.navigationLabel} onChange={(event) => setValue("navigationLabel", event.target.value)} placeholder="Shop footwear" /></Field>
            <Field label="Hero image URL"><Input value={values.heroImageUrl} onChange={(event) => setValue("heroImageUrl", event.target.value)} placeholder="https://..." /></Field>
          </div>
          <Field className="mt-4" label="SEO summary"><Textarea value={values.seoSummary} onChange={(event) => setValue("seoSummary", event.target.value)} className="min-h-28" placeholder="Brief search-friendly summary" /></Field>
        </Card>
      </div>
      <Card className="sticky top-24 h-fit">
        <h2 className="font-heading text-h2 font-semibold">Actions</h2>
        <p className="mt-2 text-body-md font-normal text-on-surface-variant">Save category details to the database.</p>
        <Button type="submit" disabled={saving} className="mt-5 w-full"><Save className="size-4" />{saving ? "Saving..." : mode === "create" ? "Save category" : "Update category"}</Button>
        <Button asChild href="/admin/categories" className="mt-3 w-full" variant="outline">Back to categories</Button>
      </Card>
    </form>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
