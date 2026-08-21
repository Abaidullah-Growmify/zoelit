"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin-page-header";
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

  return (
    <div>
      <AdminPageHeader title={`Edit ${product.description || product.ingramPartNumber}`} description={`Update catalog content, pricing, stock, and image for ${product.ingramPartNumber}.`} />
      <ProductForm product={product} mode="edit" />
    </div>
  );
}
