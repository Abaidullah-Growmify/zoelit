import Link from "next/link";
import { getProductCategories } from "@/lib/server-catalog";

export const metadata = {
  title: "Product Categories | ZoeLit",
  description: "Browse ZoeLit products by category, including networking, software, cables, accessories, mobility, and printers.",
  alternates: { canonical: "/categories" },
  openGraph: {
    type: "website",
    title: "Product Categories | ZoeLit",
    description: "Browse ZoeLit products by category.",
    url: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getProductCategories();

  return (
    <section className="container-page py-10 md:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Browse</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">Product Categories</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
        Explore ZoeLit products by category and find the right technology for your needs.
      </p>

      {categories.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="rounded-xl border border-outline-variant/80 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
            >
              <h2 className="font-heading text-lg font-semibold text-on-surface">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {category.description || `Explore ${category.name.toLowerCase()} products.`}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-outline-variant bg-surface p-8 text-center text-sm text-on-surface-variant">
          Categories are not available right now.
        </p>
      )}
    </section>
  );
}
