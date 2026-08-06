import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { adminProducts, getAdminProduct } from "@/lib/admin-data";
import { ProductForm } from "../product-form";

export function generateStaticParams() {
  return adminProducts.map((product) => ({ id: product.id }));
}

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = getAdminProduct(id);
  if (!product) notFound();
  return <div><AdminPageHeader title={`Edit ${product.name}`} description="Update catalog content, pricing, stock, image, highlights, and product details." /><ProductForm product={product} mode="edit" /></div>;
}
