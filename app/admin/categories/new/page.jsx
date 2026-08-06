import { AdminPageHeader } from "@/components/admin-page-header";
import { CategoryForm } from "../category-form";

export default function NewCategoryPage() {
  return <div><AdminPageHeader title="Add category" description="Create a storefront category for product grouping, navigation, and merchandising." /><CategoryForm mode="create" /></div>;
}
