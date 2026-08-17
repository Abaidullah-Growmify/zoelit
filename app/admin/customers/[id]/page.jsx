import { AdminCustomerDetail } from "./customer-detail";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }) {
  const { id } = await params;
  return <AdminCustomerDetail id={id} />;
}