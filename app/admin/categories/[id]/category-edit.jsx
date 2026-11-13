"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Card } from "@/components/ui";
import { getAdminCategories } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { CategoryForm } from "../category-form";

export function AdminCategoryEdit({ id }) {
  const token = useAdminAuthStore((state) => state.token);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    getAdminCategories(token)
      .then((data) => {
        const categories = Array.isArray(data?.categories) ? data.categories : Array.isArray(data) ? data : [];
        const decodedId = decodeURIComponent(String(id));
        const match = categories.find((item) => [item.id, item._id, item.slug, item.name].filter(Boolean).some((value) => String(value) === decodedId));
        if (!match) throw new Error("Category not found");
        if (String(match.source || "").toLowerCase() === "ingram" || match.isIngram === true) throw new Error("Ingram categories are read-only");
        setCategory(match);
      })
      .catch((loadError) => {
        setError(loadError.message || "Could not load category");
        toast.error(loadError.message || "Could not load category");
      });
  }, [id, token]);

  if (error) {
    return <div><AdminPageHeader title="Edit category" description="Create a storefront category for product grouping, navigation, and merchandising." /><Card className="mt-8 p-5 text-sm text-error">{error}</Card></div>;
  }

  if (!category) {
    return <div><AdminPageHeader title="Edit category" description="Create a storefront category for product grouping, navigation, and merchandising." /><Card className="mt-8 flex items-center gap-2 p-5 text-sm text-on-surface-variant"><Loader2 className="size-4 animate-spin" />Loading category...</Card></div>;
  }

  return (
    <div>
      <AdminPageHeader title="Edit category" description="Create a storefront category for product grouping, navigation, and merchandising." />
      <CategoryForm category={category} mode="edit" />
    </div>
  );
}
