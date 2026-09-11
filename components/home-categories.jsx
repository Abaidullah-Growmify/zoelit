"use client";

import Link from "next/link";
import { BriefcaseBusiness, Camera, Headphones, Layers3, Monitor, Package, Smartphone, Watch } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductCategories } from "@/lib/api";

const icons = [Smartphone, Headphones, BriefcaseBusiness, Package, Watch, Camera, Monitor, Layers3];
const fallback = ["Electronics", "Audio", "Bags", "Accessories", "Wearables", "Cameras"];

export function HomeCategories() {
  const [categories, setCategories] = useState(fallback);
  useEffect(() => { getProductCategories().then((result) => { const names = (result.categories || []).map((item) => item.name).filter(Boolean); if (names.length) setCategories(names); }).catch(() => {}); }, []);
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.slice(0, 6).map((label, index) => { const Icon = icons[index % icons.length]; return <Link href={`/products?category=${encodeURIComponent(label)}`} key={label} className="group flex min-h-[116px] flex-col items-center justify-center rounded-[14px] border border-outline-variant bg-surface px-3 py-5 text-center transition duration-200 hover:-translate-y-1 hover:border-on-surface hover:shadow-[0_8px_24px_rgba(17,24,39,.06)]"><Icon className="mb-3 size-7 text-on-surface transition-transform duration-200 group-hover:scale-105" /><strong className="text-sm font-semibold text-on-surface">{label}</strong><span className="mt-1 text-xs text-on-surface-variant">Browse items</span></Link>; })}</div>;
}
