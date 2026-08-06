import { ProductForm } from "../product-form";
import { AdminPageHeader } from "@/components/admin-page-header";

export default function NewProductPage() {
  return <div><AdminPageHeader title="Add product" description="Create a polished product entry. This form is visual only until backend storage is added." /><ProductForm mode="create" /></div>;
}
