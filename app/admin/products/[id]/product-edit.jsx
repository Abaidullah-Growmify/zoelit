"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Card } from "@/components/ui";
import { AdminProductEditSkeleton } from "@/components/skeletons";
import { getAdminProduct } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { ProductForm } from "../product-form";

export function AdminProductEdit({ id }) {
  const token = useAdminAuthStore((state) => state.token);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token || !id) return;
    getAdminProduct(id, token)
      .then((data) => {
        if (!active) return;
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setNotFound(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, token]);

  if (loading) {
    return <AdminProductEditSkeleton />;
  }

  if (notFound || !product) {
    return <AdminPageHeader title="Product not found" description="We could not find the product you are looking for." />;
  }

  const isIngram = product.source === "ingram";

  return (
    <Card className="p-5 sm:p-6">
      <AdminPageHeader title={`Edit ${product.name || product.description || product.ingramPartNumber}`} description={`${isIngram ? "This product is synced from Ingram Micro and cannot be edited manually." : "Update catalog content, pricing, stock, and image for "}${product.ingramPartNumber}.`} />
      {isIngram ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Ingram-synced products are read-only. You can activate, deactivate or delete them from the product list.
        </p>
      ) : null}
      <ProductForm product={product} mode="edit" readOnly={isIngram} />
    </Card>
  );
}
