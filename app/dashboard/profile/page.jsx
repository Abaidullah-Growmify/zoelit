"use client";

import { Check, LockKeyhole, MapPin, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card, Input, Label } from "@/components/ui";
import { ProfileSkeleton } from "@/components/skeletons";

const EMPTY_ADDRESS = { label: "Home", name: "", line1: "", city: "", region: "", postal: "" };
const TABS = [
  { id: "profile", label: "Profile Information", icon: UserRound },
  { id: "address", label: "Shipping Address", icon: MapPin },
  { id: "security", label: "Security", icon: LockKeyhole },
];

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    Promise.all([api.getProfile(token), api.getAddresses(token).catch(() => ({ addresses: [] }))]).then(([profileResult, addressResult]) => {
      if (!active) return;
      const nextUser = profileResult.user || {};
      setProfile({ name: nextUser.name || "", email: nextUser.email || "", phone: nextUser.phone || "" });
      setAddresses(addressResult.addresses || []);
      setLoading(false);
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function saveProfile(event) {
    event.preventDefault();
    try { await api.updateProfile(profile, token); toast.success("Profile changes saved"); } catch (error) { toast.error(error.message || "Could not save profile"); }
  }

  async function saveAddress(event) {
    event.preventDefault();
    try {
      const payload = { ...addressForm, name: addressForm.name || profile.name };
      if (editingId) {
        const result = await api.updateAddress(editingId, payload, token);
        setAddresses((current) => current.map((item) => item._id === editingId ? { ...item, ...result.address } : item));
      } else {
        const result = await api.createAddress(payload, token);
        setAddresses((current) => [...current, result.address]);
      }
      setEditingId(null);
      setAddressForm(EMPTY_ADDRESS);
      toast.success(editingId ? "Address updated" : "Address added");
    } catch (error) { toast.error(error.message || "Could not save address"); }
  }

  async function makeDefault(id) {
    try { const result = await api.setDefaultAddress(id, token); setAddresses((current) => current.map((item) => ({ ...item, default: item._id === result.address._id }))); toast.success("Default address updated"); } catch (error) { toast.error(error.message || "Could not update default address"); }
  }

  async function deleteAddress(id) {
    try { await api.deleteAddress(id, token); setAddresses((current) => current.filter((item) => item._id !== id)); toast.success("Address deleted"); } catch (error) { toast.error(error.message || "Could not delete address"); }
  }

  function editAddress(item) {
    setEditingId(item._id);
    setAddressForm({ label: item.label || "Home", name: item.name || "", line1: item.line1 || "", city: item.city || "", region: item.region || "", postal: item.postal || "" });
  }

  async function savePassword(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (values.get("newPassword") !== values.get("confirmPassword")) { toast.error("Passwords do not match"); return; }
    try { await api.updatePassword({ currentPassword: values.get("currentPassword"), newPassword: values.get("newPassword") }, token); event.currentTarget.reset(); toast.success("Password updated"); } catch (error) { toast.error(error.message || "Could not update password"); }
  }

  if (loading) return <ProfileSkeleton />;
  const currentTab = TABS.find((tab) => tab.id === activeTab);

  return <section>
    <div className="mb-7"><h1 className="font-heading text-3xl font-bold tracking-[-0.03em] text-on-surface">Account Settings</h1><p className="mt-2 text-sm text-on-surface-variant">Manage your profile, addresses and security.</p></div>
    <div className="grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[14px] border border-outline-variant bg-surface p-2"><nav className="space-y-1">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-[10px] px-4 py-3 text-left text-sm font-medium transition ${activeTab === id ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}><Icon className="size-4" />{label}</button>)}</nav></aside>
      <Card className="p-7 sm:p-9"><h2 className="font-heading text-xl font-bold tracking-tight text-on-surface">{currentTab.label}</h2><p className="mt-1 text-sm text-on-surface-variant">{activeTab === "profile" ? "Update your personal details." : activeTab === "address" ? "Save multiple delivery locations and choose a default." : "Keep your account secure with a strong password."}</p>
        {activeTab === "profile" ? <form onSubmit={saveProfile} className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Full name"><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></Field><Field label="Phone"><Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field><Field label="Email address" className="sm:col-span-2"><Input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></Field><div className="sm:col-span-2"><Button className="w-fit">Save Changes</Button></div></form> : null}
        {activeTab === "address" ? <AddressPanel addresses={addresses} form={addressForm} setForm={setAddressForm} editingId={editingId} setEditingId={setEditingId} onSubmit={saveAddress} onEdit={editAddress} onDefault={makeDefault} onDelete={deleteAddress} /> : null}
        {activeTab === "security" ? <PasswordForm onSubmit={savePassword} /> : null}
      </Card>
    </div>
  </section>;
}

function AddressPanel({ addresses, form, setForm, editingId, setEditingId, onSubmit, onEdit, onDefault, onDelete }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="mt-7 space-y-7"><form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="font-heading text-base font-semibold text-on-surface">{editingId ? "Edit address" : "Add address"}</h3>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_ADDRESS); }} className="text-xs font-semibold text-on-surface-variant underline">Cancel edit</button> : null}</div><Field label="Label"><Input value={form.label} onChange={(event) => update("label", event.target.value)} required /></Field><Field label="Full name"><Input value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field><Field label="Address" className="sm:col-span-2"><Input value={form.line1} onChange={(event) => update("line1", event.target.value)} required /></Field><Field label="City"><Input value={form.city} onChange={(event) => update("city", event.target.value)} required /></Field><Field label="State / Region"><Input value={form.region} onChange={(event) => update("region", event.target.value)} /></Field><Field label="Postal code"><Input value={form.postal} onChange={(event) => update("postal", event.target.value)} required /></Field><div className="sm:col-span-2"><Button className="w-fit"><Plus className="size-4" />{editingId ? "Save Changes" : "Add Address"}</Button></div></form><div><div className="mb-3 flex items-center justify-between"><h3 className="font-heading text-base font-semibold text-on-surface">Saved addresses</h3><span className="text-xs text-on-surface-variant">{addresses.length} saved</span></div>{addresses.length ? <div className="grid gap-4 md:grid-cols-2">{addresses.map((item) => <AddressCard key={item._id} address={item} onEdit={onEdit} onDefault={onDefault} onDelete={onDelete} />)}</div> : <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">No saved addresses yet. Add your first delivery address above.</div>}</div></div>;
}

function AddressCard({ address, onEdit, onDefault, onDelete }) { return <div className="rounded-xl border border-outline-variant bg-surface p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MapPin className="size-4 text-on-surface-variant" /><h4 className="font-semibold text-on-surface">{address.label || "Address"}</h4></div><p className="mt-3 text-sm font-medium text-on-surface">{address.name}</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">{address.line1}<br />{address.city}{address.region ? `, ${address.region}` : ""} {address.postal}</p></div>{address.default ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><Check className="size-3" />Default</span> : null}</div><div className="mt-5 flex flex-wrap gap-2 border-t border-outline-variant pt-4"><button type="button" onClick={() => onEdit(address)} className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-on-surface hover:text-on-surface"><Pencil className="size-3.5" />Edit</button>{!address.default ? <button type="button" onClick={() => onDefault(address._id)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-container">Make default</button> : <span className="px-2 py-2 text-xs text-emerald-700">Default delivery address</span>}<button type="button" onClick={() => onDelete(address._id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button></div></div>; }

function PasswordForm({ onSubmit }) { return <form onSubmit={onSubmit} className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Current password" className="sm:col-span-2"><Input name="currentPassword" type="password" required /></Field><Field label="New password"><Input name="newPassword" type="password" minLength={8} required /></Field><Field label="Confirm password"><Input name="confirmPassword" type="password" minLength={8} required /></Field><div className="sm:col-span-2"><Button className="w-fit">Update Password</Button></div></form>; }
function Field({ label, className = "", children }) { return <label className={`space-y-2 ${className}`}><Label>{label}</Label>{children}</label>; }
