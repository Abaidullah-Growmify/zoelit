"use client";

import { useEffect, useState } from "react";
import { Home, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { AddressSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

export default function AddressesPage() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const defaultAddress = items.find((item) => item.default);

  useEffect(() => {
    let active = true;
    if (!token) return;
    api
      .getAddresses(token)
      .then((res) => {
        if (active) {
          setItems(res.addresses);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  function setDefault(id) {
    api
      .setDefaultAddress(id, token)
      .then(({ address }) => {
        setItems((current) => current.map((item) => ({ ...item, default: item._id === address._id })));
        toast.success("Default address updated");
      })
      .catch((error) => toast.error(error.message || "Could not update default address"));
  }

  function remove(id) {
    api
      .deleteAddress(id, token)
      .then(() => {
        setItems((current) => current.filter((item) => item._id !== id));
        setConfirming(null);
        toast.info("Address deleted");
      })
      .catch((error) => toast.error(error.message || "Could not delete address"));
  }

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(address) {
    setEditing(address);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function submit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      label: formData.get("label"),
      name: formData.get("name"),
      line1: formData.get("line1"),
      city: formData.get("city"),
      region: formData.get("region"),
      postal: formData.get("postal"),
    };

    if (editing) {
      api
        .updateAddress(editing._id, payload, token)
        .then(({ address }) => {
          setItems((current) => current.map((item) => (item._id === editing._id ? { ...item, ...address } : item)));
          closeForm();
          toast.success("Address updated");
        })
        .catch((error) => toast.error(error.message || "Could not update address"));
    } else {
      api
        .createAddress(payload, token)
        .then(({ address }) => {
          setItems((current) => [...current, address]);
          closeForm();
          toast.success("Address added");
        })
        .catch((error) => toast.error(error.message || "Could not add address"));
    }
  }

  if (loading) return <AddressSkeleton />;

  return (
    <div className="section-fade-up">
      <DashboardPageHeader
        title="Saved Addresses"
        description="Manage saved delivery locations and checkout defaults."
        action={<Button onClick={openAdd}><Plus className="size-4" /> Add New Address</Button>}
      />
      <div className="mt-6 flex flex-wrap gap-2 text-meta">
        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{items.length} saved</span>
        <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Default: {defaultAddress?.label || "Not set"}</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((address) => (
          <Card key={address._id} className={cn("transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20", address.default && "border-blue-200 bg-blue-50/35 dark:border-blue-500/30 dark:bg-blue-500/5")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-11 place-items-center rounded-sm bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200", address.default && "bg-blue-600 text-white dark:bg-blue-500")}>
                  {address.label.toLowerCase().includes("home") ? <Home className="size-5" /> : <MapPin className="size-5" />}
                </span>
                <div>
                  <h2 className="font-heading text-h2 font-semibold text-slate-950 dark:text-white">{address.label}</h2>
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
              <Button size="sm" variant="secondary" aria-label={`Edit ${address.label} address`} onClick={() => openEdit(address)}><Pencil className="size-4" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => setDefault(address._id)} disabled={address.default}>{address.default ? "Default" : "Set Default"}</Button>
              <Button size="sm" variant="danger" onClick={() => setConfirming(address)}><Trash2 className="size-4" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center justify-center border-dashed py-14 text-center">
          <span className="grid size-16 place-items-center rounded-sm bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"><MapPin className="size-7" /></span>
          <h2 className="mt-5 font-heading text-h2 font-semibold text-slate-950 dark:text-white">No saved addresses</h2>
          <p className="mt-2 max-w-md text-body font-regular leading-6 text-slate-500 dark:text-slate-400">Add a delivery location now so checkout only takes a few clicks later.</p>
          <Button onClick={openAdd} className="mt-6"><Plus className="size-4" /> Add New Address</Button>
        </Card>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl shadow-2xl shadow-slate-950/25">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-h2 font-semibold text-slate-950 dark:text-white">{editing ? "Edit address" : "Add address"}</h2>
                <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">{editing ? "Update the details for this delivery location." : "Save another delivery location for faster checkout."}</p>
              </div>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
              <Field name="label" label="Label" defaultValue={editing?.label} />
              <Field name="name" label="Full name" defaultValue={editing?.name} />
              <Field name="line1" label="Address" className="md:col-span-2" defaultValue={editing?.line1} />
              <Field name="city" label="City" defaultValue={editing?.city} />
              <Field name="region" label="State" defaultValue={editing?.region} />
              <Field name="postal" label="Postal code" defaultValue={editing?.postal} />
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row md:col-span-2 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
                <Button>{editing ? <><Pencil className="size-4" /> Save Changes</> : <><Plus className="size-4" /> Add Address</>}</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 shadow-2xl shadow-slate-950/25">
            <h2 className="font-heading text-h2 font-semibold text-slate-950 dark:text-white">Delete address?</h2>
            <p className="mt-2 text-body font-regular leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <strong className="font-semibold text-slate-900 dark:text-white">{confirming.label}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setConfirming(null)}>Cancel</Button>
              <Button type="button" variant="danger" onClick={() => remove(confirming._id)}><Trash2 className="size-4" /> Delete address</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Field({ name, label, className, defaultValue }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input name={name} required defaultValue={defaultValue} />
    </div>
  );
}