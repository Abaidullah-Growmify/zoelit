"use client";

import Link from "next/link";
import { Cable, Camera, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Mouse, Package, Printer, Router, Server, Smartphone, Tablet, Watch, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductCategories } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";

const icons = { Cable, Camera, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Mouse, Package, Printer, Router, Server, Smartphone, Tablet, Watch, Wifi };
const fallback = [
  { name: "Electronics", icon: "Smartphone" },
  { name: "Audio", icon: "Headphones" },
  { name: "Computers", icon: "Laptop" },
  { name: "Accessories", icon: "Package" },
  { name: "Wearables", icon: "Watch" },
  { name: "Cameras", icon: "Camera" },
];

export function HomeCategories() {
  const [categories, setCategories] = useState(fallback);
  useEffect(() => { getProductCategories().then((result) => { const items = (result.categories || []).filter((item) => item.name).map((item) => ({ name: item.name, icon: getCategoryIcon(item.name, item.icon === "Package" ? "" : item.icon) })); if (items.length) setCategories(items); }).catch(() => {}); }, []);
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.slice(0, 6).map((category) => { const Icon = icons[getCategoryIcon(category.name, category.icon)] || Package; return <Link href={`/products?category=${encodeURIComponent(category.name)}`} key={category.name} className="group flex min-h-[116px] flex-col items-center justify-center rounded-[14px] border border-outline-variant bg-surface px-3 py-5 text-center transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_24px_rgba(17,24,39,.06)]"><Icon className="mb-3 size-7 text-on-surface transition-transform duration-200 group-hover:scale-105" /><strong className="text-sm font-semibold text-on-surface">{category.name}</strong><span className="mt-1 text-xs text-on-surface-variant">Browse items</span></Link>; })}</div>;
}
