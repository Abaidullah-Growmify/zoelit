"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { addresses as initialAddresses } from "@/lib/data";
import { Badge, Button, Card, Input, Label, PageHeader } from "@/components/ui";

export default function AddressesPage() {
  const [items, setItems] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);

  function setDefault(id) {
    setItems(items.map((item) => ({ ...item, default: item.id === id })));
    toast.success("Default address updated");
  }

  function remove(id) {
    setItems(items.filter((item) => item.id !== id));
    toast.info("Address deleted");
  }

  function add(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setItems([
      ...items,
      {
        id: String(Date.now()),
        label: form.get("label"),
        name: form.get("name"),
        line1: form.get("line1"),
        city: form.get("city"),
        region: form.get("region"),
        postal: form.get("postal"),
        country: "United States",
        default: items.length === 0,
      },
    ]);
    setShowForm(false);
    toast.success("Address added");
  }

  return (
    <div>
      <PageHeader eyebrow="Shipping" title="Addresses" description="Manage saved delivery locations and choose your default shipping address." action={<Button onClick={() => setShowForm(true)}>Add New Address</Button>} />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((address) => (
          <Card key={address.id}>
            <div className="flex justify-between gap-3">
              <h2 className="text-xl font-black">{address.label}</h2>
              {address.default ? <Badge tone="slate">Default</Badge> : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {address.name}<br />
              {address.line1}<br />
              {address.city}, {address.region} {address.postal}<br />
              {address.country}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" aria-label={`Edit ${address.label} address`} onClick={() => toast.info("Edit address UI ready")}><Pencil className="size-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setDefault(address.id)}>Set Default</Button>
              <Button size="sm" variant="danger" onClick={() => remove(address.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <Card className="w-full max-w-xl">
            <h2 className="text-2xl font-black">Add address</h2>
            <form onSubmit={add} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field name="label" label="Label" />
              <Field name="name" label="Full name" />
              <Field name="line1" label="Address" className="md:col-span-2" />
              <Field name="city" label="City" />
              <Field name="region" label="State" />
              <Field name="postal" label="Postal code" />
              <div className="flex gap-2 md:col-span-2">
                <Button>Add Address</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Field({ name, label, className }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input name={name} required />
    </div>
  );
}
