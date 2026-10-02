"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { TransparentActionLoader } from "@/components/action-feedback";
import { updateAdminOrderDetails } from "@/lib/api";
import { cn, money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const orderEditSchema = z.object({
  firstName: z.string().max(120, "First name is too long"),
  lastName: z.string().max(120, "Last name is too long"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(60, "Phone number is too long"),
  address: z.string().max(240, "Address is too long"),
  city: z.string().max(120, "City is too long"),
  state: z.string().max(120, "State is too long"),
  postal: z.string().max(40, "Postal code is too long"),
  notes: z.string().max(2000, "Notes are too long"),
  tracking: z.string().max(120, "Tracking number is too long"),
  carrierName: z.string().max(120, "Carrier name is too long"),
  invoiceNumber: z.string().max(120, "Invoice number is too long"),
  shipDate: z.string(),
  shippingFee: z.coerce.number().min(0, "Shipping cannot be negative"),
  discount: z.coerce.number().min(0, "Discount cannot be negative"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
        price: z.coerce.number().min(0, "Price cannot be negative"),
      })
    )
    .min(1, "An order must keep at least one item"),
});

export function AdminOrderEditDialog({ order, onClose, onSaved }) {
  const token = useAdminAuthStore((state) => state.token);
  const billing = order?.billing || {};

  const form = useForm({
    resolver: zodResolver(orderEditSchema),
    defaultValues: {
      firstName: billing.firstName || "",
      lastName: billing.lastName || "",
      email: billing.email || "",
      phone: billing.phone || "",
      address: billing.address || "",
      city: billing.city || "",
      state: billing.state || "",
      postal: billing.postal || "",
      notes: order?.notes || "",
      tracking: order?.tracking || "",
      carrierName: order?.carrierName || "",
      invoiceNumber: order?.invoiceNumber || "",
      shipDate: order?.shipDate ? String(order.shipDate).slice(0, 10) : "",
      shippingFee: Number(order?.shippingFee || 0),
      discount: Number(order?.discount || 0),
      items: (order?.lineItems || order?.items || []).map((item) => ({
        productId: String(item.productId),
        name: item.name,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      })),
    },
  });

  const { fields, remove } = useFieldArray({ control: form.control, name: "items" });
  const [itemsValue, shippingFeeValue, discountValue] = useWatch({
    control: form.control,
    name: ["items", "shippingFee", "discount"],
  });
  const items = itemsValue || [];
  const shippingFee = Number(shippingFeeValue) || 0;
  const discount = Number(discountValue) || 0;

  useEffect(() => {
    function closeOnEscape(event) {
      if (form.formState.isSubmitting) return;
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [form.formState.isSubmitting, onClose]);

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );
  const total = Math.max(0, subtotal - discount + shippingFee);

  async function onSubmit(values) {
    try {
      const result = await updateAdminOrderDetails(
        order.id,
        {
          billing: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
            address: values.address,
            city: values.city,
            state: values.state,
            postal: values.postal,
          },
          notes: values.notes,
          tracking: values.tracking,
          carrierName: values.carrierName,
          invoiceNumber: values.invoiceNumber,
          shipDate: values.shipDate || null,
          shippingFee: values.shippingFee,
          discount: values.discount,
          items: values.items,
        },
        token
      );

      toast.success(result?.message || "Order updated successfully");
      onSaved?.(result?.order);
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Could not update order");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xl dark:bg-surface-container">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/70 p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-container/10 text-primary">
              <Pencil className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">
                Edit order {order?.publicOrderId || order?.orderNumber || order?.ingramOrderNumber || order?.id}
              </h2>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Update customer details, line items, shipping and fulfillment information.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit order modal"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 p-6" noValidate>
          <section className="grid gap-4">
            <h3 className="font-heading text-title-sm font-semibold text-on-surface">Customer details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name" name="firstName" form={form} autoComplete="given-name" />
              <Field label="Last name" name="lastName" form={form} autoComplete="family-name" />
              <Field label="Email" name="email" type="email" form={form} autoComplete="email" />
              <Field label="Phone" name="phone" type="tel" form={form} autoComplete="tel" />
            </div>
            <Field label="Address" name="address" form={form} autoComplete="street-address" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="City" name="city" form={form} autoComplete="address-level2" />
              <Field label="State" name="state" form={form} autoComplete="address-level1" />
              <Field label="Postal code" name="postal" form={form} autoComplete="postal-code" />
            </div>
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-heading text-title-sm font-semibold text-on-surface">Line items</h3>
              <span className="text-label-sm text-on-surface-variant">
                Subtotal {money(subtotal)} &middot; Total {money(total)}
              </span>
            </div>

            <div className="grid gap-3">
              {fields.map((field, index) => {
                const canRemove = fields.length > 1;
                return (
                  <div key={field.id} className="grid gap-3 rounded-md border border-outline-variant/70 p-3 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_auto] sm:items-end">
                    <div className="min-w-0">
                      <Label className="sr-only" htmlFor={`items.${index}.name`}>
                        Item name
                      </Label>
                      <p id={`items.${index}.name`} className="truncate text-body-md font-semibold text-on-surface" title={field.name}>
                        {field.name}
                      </p>
                      <p className="truncate text-label-sm text-on-surface-variant">{field.productId}</p>
                      <input type="hidden" {...form.register(`items.${index}.productId`)} />
                      <input type="hidden" {...form.register(`items.${index}.name`)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`items.${index}.quantity`} className="text-label-sm">
                        Qty
                      </Label>
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min={1}
                        step={1}
                        className="h-9"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.items?.[index]?.quantity ? (
                        <p className="text-label-sm text-error">{form.formState.errors.items[index].quantity.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`items.${index}.price`} className="text-label-sm">
                        Unit price
                      </Label>
                      <Input
                        id={`items.${index}.price`}
                        type="number"
                        min={0}
                        step={0.01}
                        className="h-9"
                        {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.items?.[index]?.price ? (
                        <p className="text-label-sm text-error">{form.formState.errors.items[index].price.message}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={!canRemove}
                      aria-label={`Remove ${field.name}`}
                      title={canRemove ? `Remove ${field.name}` : "An order must keep at least one item"}
                      className={cn(
                        "grid size-9 place-items-center rounded-md border border-outline-variant text-on-surface-variant transition hover:border-error/50 hover:text-error",
                        !canRemove && "cursor-not-allowed opacity-40"
                      )}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {form.formState.errors.items ? (
              <p className="text-label-sm text-error">{form.formState.errors.items.message}</p>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Shipping fee" name="shippingFee" type="number" step={0.01} form={form} />
              <Field label="Discount" name="discount" type="number" step={0.01} form={form} />
              <div className="flex items-end">
                <div className="w-full rounded-md border border-outline-variant/70 bg-surface-container-low px-3.5 py-2.5">
                  <Label className="text-label-sm">Order total</Label>
                  <p className="text-body-md font-bold tabular-nums text-on-surface">{money(total)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4">
            <h3 className="font-heading text-title-sm font-semibold text-on-surface">Fulfillment</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tracking number" name="tracking" form={form} />
              <Field label="Carrier name" name="carrierName" form={form} />
              <Field label="Invoice number" name="invoiceNumber" form={form} />
              <Field label="Ship date" name="shipDate" type="date" form={form} />
            </div>
          </section>

          <section className="grid gap-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
            {form.formState.errors.notes ? (
              <p className="text-label-sm text-error">{form.formState.errors.notes.message}</p>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 border-t border-outline-variant/70 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </div>
      <TransparentActionLoader open={form.formState.isSubmitting} />
    </div>
  );
}

function Field({ label, name, form, type = "text", step, autoComplete }) {
  const error = form.formState.errors[name];

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        step={step}
        min={type === "number" ? 0 : undefined}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : undefined}
        {...form.register(name, { valueAsNumber: type === "number" })}
      />
      {error ? <p className="text-label-sm text-error">{error.message}</p> : null}
    </div>
  );
}