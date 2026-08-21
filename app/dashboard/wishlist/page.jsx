"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useProductStore } from "@/store/product-store";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const getById = useProductStore((state) => state.getById);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts().catch(() => {});
  }, [fetchProducts]);

  const products = items.map((item) => {
    const snapshot = { ...item, id: item.productId };
    const live = getById(item.productId);

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
      <div className="mt-4">
        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
