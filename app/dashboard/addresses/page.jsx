"use client";

import { useState } from "react";
import { Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addresses as initialAddresses } from "@/lib/data";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const [items, setItems] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const defaultAddress = items.find((item) => item.default);

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
    <div className="section-fade-up">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body font-regular text-slate-500 dark:text-slate-400">Manage saved delivery locations and checkout defaults.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-meta">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{items.length} saved</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Default: {defaultAddress?.label || "Not set"}</span>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="rounded-sm">
            <Plus className="size-4" /> Add New Address
          </Button>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((address) => (
          <Card key={address.id} className={cn("transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20", address.default && "border-blue-200 bg-blue-50/35 dark:border-blue-500/30 dark:bg-blue-500/5")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-11 place-items-center rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200", address.default && "bg-blue-600 text-white dark:bg-blue-500")}>
                  {address.label.toLowerCase().includes("home") ? <Home className="size-5" /> : <MapPin className="size-5" />}
                </span>
                <div>
                  <h2 className="text-h2 font-semibold text-slate-950 dark:text-white">{address.label}</h2>
                  <p className="mt-1 text-meta font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">{address.default ? "Primary shipping address" : "Saved address"}</p>
                </div>
              </div>
              {address.default ? <Badge tone="slate">Default</Badge> : null}
            </div>
            <p className="mt-5 text-body font-regular leading-6 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">{address.name}</span><br />
              {address.line1}<br />
              {address.city}, {address.region} {address.postal}<br />
              {address.country}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
              <Button size="sm" variant="secondary" aria-label={`Edit ${address.label} address`} onClick={() => toast.info("Edit address UI ready")} className="rounded-sm"><Pencil className="size-4" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => setDefault(address.id)} disabled={address.default} className="rounded-sm">{address.default ? "Default" : "Set Default"}</Button>
              <Button size="sm" variant="danger" onClick={() => remove(address.id)} className="rounded-sm"><Trash2 className="size-4" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center justify-center border-dashed py-14 text-center">
          <span className="grid size-16 place-items-center rounded-sm bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"><MapPin className="size-7" /></span>
          <h2 className="mt-5 text-h2 font-semibold text-slate-950 dark:text-white">No saved addresses</h2>
          <p className="mt-2 max-w-md text-body font-regular leading-6 text-slate-500 dark:text-slate-400">Add a delivery location now so checkout only takes a few clicks later.</p>
          <Button onClick={() => setShowForm(true)} className="mt-6 rounded-sm"><Plus className="size-4" /> Add New Address</Button>
        </Card>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl shadow-2xl shadow-slate-950/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-h2 font-semibold text-slate-950 dark:text-white">Add address</h2>
                <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">Save another delivery location for faster checkout.</p>
              </div>
              <span className="grid size-11 place-items-center rounded-sm bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><MapPin className="size-5" /></span>
            </div>
            <form onSubmit={add} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field name="label" label="Label" />
              <Field name="name" label="Full name" />
              <Field name="line1" label="Address" className="md:col-span-2" />
              <Field name="city" label="City" />
              <Field name="region" label="State" />
              <Field name="postal" label="Postal code" />
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row md:col-span-2 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="rounded-sm">Cancel</Button>
                <Button className="rounded-sm"><Plus className="size-4" /> Add Address</Button>
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
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input name={name} required />
    </div>
  );
}
