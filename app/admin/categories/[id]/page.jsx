import { AdminCategoryEdit } from "./category-edit";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }) {
  const { id } = await params;
  return <AdminCategoryEdit id={id} />;
}
