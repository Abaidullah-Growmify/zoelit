"use client";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product, className }) {
  const addItem = useCartStore((state) => state.addItem);
  return <Button className={cn("mt-8", className)} onClick={() => { addItem(product.id); toast.success(`${product.name} added to cart`); }}><ShoppingBag className="size-4" />Add to Cart</Button>;
}
