"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";
import { getPublicProductsByIds } from "@/lib/api";
import { mapProduct } from "@/lib/product-mapper";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const [liveProducts, setLiveProducts] = useState({});

  useEffect(() => {
    const ids = items.map((item) => item.productId).filter(Boolean);
    if (!ids.length) {
      return undefined;
    }
    let active = true;
    getPublicProductsByIds(ids)
      .then((data) => {
        if (!active) return;
        setLiveProducts(Object.fromEntries((data.products || []).map(mapProduct).filter(Boolean).map((product) => [product.id, product])));
      })
      .catch(() => {
        if (active) setLiveProducts({});
      });
    return () => { active = false; };
  }, [items]);

  const products = items.map((item) => {
    const snapshot = { ...item, id: item.productId };
    const live = liveProducts[item.productId];

    if (!live) return snapshot;

    return {
      ...snapshot,
      name: live.name || snapshot.name,
      image: live.image || snapshot.image,
      price: Number(live.price) || snapshot.price,
      category: live.category || snapshot.category,
      stock: Math.max(0, Math.floor(Number(live.stock) || 0)),
      description: live.description || snapshot.description,
    };
  });

  return (
    <div>
      <DashboardSectionBanner eyebrow="Account / Wishlist" title="Wishlist" description="Keep your favorite products saved for later." />
      <div className="mt-6">
        {products.length ? (
          <div className="product-grid grid-home grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart icon on any product card to save it here."
          />
        )}
      </div>
    </div>
  );
}
