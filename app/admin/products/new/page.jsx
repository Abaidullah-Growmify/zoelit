import { ProductForm } from "../product-form";
import { AdminPageHeader } from "@/components/admin-page-header";

export default function NewProductPage() {
  return <div><AdminPageHeader title="Add product" description="Create a new manual product with full catalog details." /><ProductForm mode="create" /></div>;
}
