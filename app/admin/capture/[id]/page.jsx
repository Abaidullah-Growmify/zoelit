import { AdminCaptureDetail } from "./capture-detail";

export const dynamic = "force-dynamic";

export default async function AdminCaptureDetailPage({ params }) {
  const { id } = await params;
  return <AdminCaptureDetail id={id} />;
}
