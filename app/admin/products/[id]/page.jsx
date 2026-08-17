import { AdminProductEdit } from "./product-edit";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  return <AdminProductEdit id={id} />;
}