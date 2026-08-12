import { OrderDetail } from "./order-detail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
