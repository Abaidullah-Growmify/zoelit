"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminCaptureDetailSkeleton } from "@/components/skeletons";
import { Badge, Card, ErrorText } from "@/components/ui";
import { getAdminCaptureRecord } from "@/lib/api";
import { minimumLoadingDelay, money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const STEP_LABELS = {
  arrived: "Opened the checkout page",
  form: "Started filling in their details",
  stripe: "Continued to payment",
  stripe_cancelled: "Came back from payment",
  payment_failed: "Payment did not go through",
  left: "Left the checkout page",
  paid: "Completed the order",
};

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-0.5 break-words text-sm text-on-surface">{value || "—"}</p>
    </div>
  );
}

function Summary({ label, value, strong = false }) {
  const tone = strong ? "font-semibold text-on-surface" : "text-on-surface-variant";
  return (
    <div className="flex justify-between text-sm">
      <span className={tone}>{label}</span>
      <span className={`${tone} tabular-nums`}>{value}</span>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <Card>
      <h2 className="font-heading text-h2 font-semibold text-on-surface">{title}</h2>
      {subtitle ? <p className="mt-1 text-body font-regular text-on-surface-variant">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function AdminCaptureDetail({ id }) {
  const token = useAdminAuthStore((state) => state.token);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setError("");
    try {
      const data = await getAdminCaptureRecord(id, token);
      setRecord(data.record);
    } catch (loadError) {
      setError(loadError.message || "Could not load this record.");
    }
  }, [id, token]);

  useEffect(() => {
    const startedAt = Date.now();
    minimumLoadingDelay(startedAt).then(load);
  }, [load]);

  if (record === null && !error) {
    return <AdminCaptureDetailSkeleton />;
  }

  if (error) {
    return (
      <Card className="space-y-4 p-6">
        <AdminPageHeader title="Checkout visit" description="We could not load this checkout visit." />
        <ErrorText>{error}</ErrorText>
      </Card>
    );
  }

  const converted = Boolean(record.converted);
  const address = [record.address, record.city, record.state, record.postal].filter(Boolean).join(", ");
  const orderRef = record.orderNumber || record.order?.orderNumber || record.order?.publicOrderId || record.id;

  return (
    <Card className="space-y-6 p-6">
      <AdminPageHeader
        title={record.customerName || record.email || "Checkout visit"}
        description={
          converted
            ? `Completed payment on ${shortDate(record.lastSeen)} and became order ${orderRef}.`
            : `No order was placed. Captured ${shortDate(record.firstSeen)} with a ${money(record.estimatedTotal)} cart.`
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={converted ? "Active" : "Pending"}>{converted ? "Converted" : "Not converted"}</Badge>
        <Badge tone="slate">{STEP_LABELS[record.lastStep] || record.lastStep}</Badge>
        <Badge tone="slate">{record.visitorType === "member" ? "Member" : "Guest"}</Badge>
        <Badge tone="slate">{record.itemsCount} item(s)</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Contact details" subtitle="What the customer typed into the checkout form.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={record.customerName} />
              <Field label="Email" value={record.email} />
              <Field label="Phone" value={record.phone} />
              <Field label="Visitor" value={record.visitorType === "member" ? "Logged in member" : "Guest"} />
              <Field label="Address" value={address} />
              <Field label="Notes" value={record.notes} />
            </div>
          </Section>

          <Section title="Cart snapshot" subtitle="Priced by the server from the catalog, with commission applied.">
            <div className="space-y-3">
              {record.products.map((item) => (
                <div key={item.productId} className="flex items-start justify-between gap-3 rounded-md border border-outline-variant/70 bg-surface-container-low/40 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">{item.productId} · {money(item.price)} each</p>
                  </div>
                  <p className="shrink-0 whitespace-nowrap text-sm tabular-nums text-on-surface">×{item.quantity} · {money(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2 border-t border-outline-variant/70 pt-4">
              <Summary label="Subtotal" value={money(record.estimatedSubtotal)} />
              <Summary label="Shipping" value={money(record.estimatedShipping)} />
              <Summary label="Estimated total" value={money(record.estimatedTotal)} strong />
            </div>
            {record.priceMismatch ? (
              <p className="mt-4 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                The page showed {money(record.clientEstimatedTotal)} for this cart, the catalog said {money(record.estimatedTotal)}. The catalog value was recorded.
              </p>
            ) : null}
            {record.warnings?.length ? (
              <ul className="mt-4 space-y-1 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                {record.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Timeline" subtitle="How far the customer got, step by step.">
            <ol className="space-y-4">
              {(record.steps || []).map((entry, index) => (
                <li key={`${entry.step}-${entry.at}-${index}`} className="flex items-start gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface">{STEP_LABELS[entry.step] || entry.step}</p>
                    <p className="text-xs text-on-surface-variant">{shortDate(entry.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 grid gap-3 border-t border-outline-variant/70 pt-4 sm:grid-cols-2">
              <Field label="First seen" value={shortDate(record.firstSeen)} />
              <Field label="Last seen" value={shortDate(record.lastSeen)} />
              <Field label="Cart session" value={record.checkoutSessionKey} />
              <Field label="Stripe session" value={record.stripeSessionId} />
            </div>
          </Section>

          {record.order ? (
            <Section title="Linked order" subtitle="The order this visit became.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Order number" value={record.order.orderNumber || record.order.publicOrderId} />
                <Field label="Status" value={record.order.status} />
                <Field label="Payment" value={record.order.payment} />
                <Field label="Total" value={money(record.order.total)} />
              </div>
            </Section>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
