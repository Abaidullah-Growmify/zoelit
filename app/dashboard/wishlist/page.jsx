"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <div>
      <div className="mt-4">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.productId} product={{ ...product, id: product.productId }} />
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
