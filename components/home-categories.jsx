import Link from "next/link";
import { Cable, Camera, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Mouse, Package, Printer, Router, Server, Smartphone, Tablet, Watch, Wifi } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

const icons = { Cable, Camera, Gamepad2, Headphones, Keyboard, Laptop, Monitor, Mouse, Package, Printer, Router, Server, Smartphone, Tablet, Watch, Wifi };

export function HomeCategories({ categories = [] }) {
  const tiles = Array.isArray(categories) ? categories.filter((category) => category && category.name).slice(0, 6) : [];

  return (
    <div className="category-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((category) => {
        const requested = category.icon === "Package" ? "" : category.icon || "";
        const iconName = getCategoryIcon(category.name, requested);
        const Icon = icons[iconName] || Package;
        return (
          <Link
            href={`/products?category=${encodeURIComponent(category.name)}`}
            key={category.name}
            className="group flex min-h-[116px] flex-col items-center justify-center overflow-hidden rounded-[16px] border border-[#e0eaff] bg-[#f4f8ff] px-3 py-5 text-center transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_24px_rgba(17,24,39,.06)]"
          >
            <Icon className="mb-2 size-11 rounded-full border border-[#cfe2fb] bg-[#eef6ff] p-2.5 text-[#0e68e8] transition-transform duration-200 group-hover:scale-105" />
            <strong className="line-clamp-2 break-words text-sm font-semibold text-on-surface">{category.name}</strong>
          </Link>
        );
      })}
    </div>
  );
}
