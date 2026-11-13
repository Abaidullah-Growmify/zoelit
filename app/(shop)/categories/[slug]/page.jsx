import { notFound, redirect } from "next/navigation";
import { getProductCategories } from "@/lib/server-catalog";
import { slugify } from "@/lib/slugify";

async function findCategory(slug) {
  const categories = await getProductCategories();
  return categories.find((category) => slugify(category.name) === slug) || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return { title: "Category not found | ZoeLit", robots: { index: false, follow: false } };

  const description = category.description || `Browse ${category.name} products, pricing, availability, and specifications at ZoeLit.`;
  return {
    title: `${category.name} Products`,
    description,
    alternates: { canonical: `/products?category=${encodeURIComponent(category.name)}` },
    openGraph: {
      type: "website",
      title: `${category.name} Products | ZoeLit`,
      description,
      url: `/products?category=${encodeURIComponent(category.name)}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();
  redirect(`/products?category=${encodeURIComponent(category.name)}`);
}
