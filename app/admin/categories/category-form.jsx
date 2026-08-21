import { Save } from "lucide-react";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";

export function CategoryForm({ category, mode }) {
  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Basic information</h2>
          <p className="mt-1 text-body-md font-normal text-on-surface-variant">Create the storefront grouping, URL slug, and admin-facing status.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Category name"><Input defaultValue={category?.name || ""} placeholder="Footwear" /></Field>
            <Field label="Slug"><Input defaultValue={category?.slug || ""} placeholder="footwear" /></Field>
            <Field label="Status"><Select defaultValue={category?.status || "Active"}><option>Active</option><option>Draft</option><option>Archived</option></Select></Field>
            <Field label="Display order"><Input defaultValue={category?.displayOrder || ""} className="tabular-nums" placeholder="1" /></Field>
          </div>
          <Field className="mt-4" label="Description"><Textarea defaultValue={category?.description || ""} placeholder="Short category description" /></Field>
        </Card>
        <Card>
          <h2 className="font-heading text-h2 font-semibold">Merchandising</h2>
          <p className="mt-1 text-body-md font-normal text-on-surface-variant">Optional content for collection pages and navigation placement.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Navigation label"><Input defaultValue={category?.name || ""} placeholder="Shop footwear" /></Field>
            <Field label="Hero image URL"><Input placeholder="https://..." /></Field>
          </div>
          <Field className="mt-4" label="SEO summary"><Textarea className="min-h-28" placeholder="Brief search-friendly summary" /></Field>
        </Card>
      </div>
      <Card className="sticky top-24 h-fit">
        <h2 className="font-heading text-h2 font-semibold">Actions</h2>
        <p className="mt-2 text-body-md font-normal text-on-surface-variant">{mode === "create" ? "Add" : "Update"} category UI only. No backend request will run.</p>
        <Button className="mt-5 w-full"><Save className="size-4" />{mode === "create" ? "Save category" : "Update category"}</Button>
        <Button asChild href="/admin/categories" className="mt-3 w-full" variant="outline">Back to categories</Button>
      </Card>
    </div>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
