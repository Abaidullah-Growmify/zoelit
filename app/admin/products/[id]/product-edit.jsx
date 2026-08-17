"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
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
    return (
      <div className="grid min-h-64 place-items-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2"><Loader2 className="size-5 animate-spin" />Loading product...</div>
      </div>
    );
  }

  if (notFound || !product) {
    return <AdminPageHeader title="Product not found" description="We could not find the product you are looking for." />;
  }

  return (
    <div>
      <AdminPageHeader title={`Edit ${product.description || product.ingramPartNumber}`} description={`Update catalog content, pricing, stock, and image for ${product.ingramPartNumber}.`} />
      <ProductForm product={product} mode="edit" />
    </div>
  );
}