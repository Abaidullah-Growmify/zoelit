import { AdminOrderDetail } from "./order-detail";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  return <AdminOrderDetail id={id} />;
}