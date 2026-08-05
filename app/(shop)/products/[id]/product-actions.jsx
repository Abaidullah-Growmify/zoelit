"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  return <Button className="mt-8" onClick={() => { addItem(product.id); toast.success(`${product.name} added to cart`); }}><ShoppingBag className="size-4" />Add to Cart</Button>;
}
