"use client";

import { AlertTriangle, Check, Eye, EyeOff, LockKeyhole, MapPin, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card, Input, Label } from "@/components/ui";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";
import { ProfileSkeleton } from "@/components/skeletons";

const EMPTY_ADDRESS = { label: "Home", name: "", line1: "", city: "", region: "", postal: "" };
const TABS = [
  { id: "profile", label: "Profile Information", icon: UserRound },
  { id: "address", label: "Shipping Address", icon: MapPin },
  { id: "security", label: "Security", icon: LockKeyhole },
];

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    Promise.all([api.getProfile(token), api.getAddresses(token).catch(() => ({ addresses: [] }))]).then(([profileResult, addressResult]) => {
      if (!active) return;
      const nextUser = profileResult.user || {};
       setProfile({ name: nextUser.name || "", phone: nextUser.phone || "" });
      setAddresses(addressResult.addresses || []);
      setLoading(false);
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function saveProfile(event) {
    event.preventDefault();
    try { await api.updateProfile({ name: profile.name, phone: profile.phone }, token); toast.success("Profile changes saved"); } catch (error) { toast.error(error.message || "Could not save profile"); }
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

  async function savePassword({ currentPassword, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) {
      setPasswordError({ title: "Passwords do not match", message: "Your new password and confirmation do not match. Please re-enter them." });
      return;
    }
    try {
      await api.updatePassword({ currentPassword, newPassword }, token);
      toast.success("Password updated — please sign in with your new password");
      clearSession();
      router.replace("/login?password=updated");
    } catch (error) {
      if (error.code === "INVALID_CURRENT_PASSWORD" || (error.status === 400 && /current password/i.test(error.message))) {
        setPasswordError({ title: "Invalid current password", message: "The current password you entered is incorrect. Provide the correct current password to change your password." });
      } else {
        setPasswordError({ title: "Could not update password", message: error.message || "Please try again." });
      }
    }
  }

  if (loading) return <ProfileSkeleton />;
  const currentTab = TABS.find((tab) => tab.id === activeTab);

  return <section>
    <DashboardSectionBanner eyebrow="Account / Settings" title={currentTab.label} description={activeTab === "profile" ? "Update your personal details." : activeTab === "address" ? "Save multiple delivery locations and choose a default." : "Keep your account secure with a strong password."} />
    <div className="mt-6 grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[14px] border border-outline-variant bg-surface p-2"><nav className="space-y-1">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex w-full items-center gap-3 rounded-[10px] px-4 py-3 text-left text-sm font-medium transition ${activeTab === id ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}><Icon className="size-4" />{label}</button>)}</nav></aside>
      <Card className="p-7 sm:p-9">
         {activeTab === "profile" ? <form onSubmit={saveProfile} className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Full name"><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></Field><Field label="Phone"><Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field><div className="sm:col-span-2"><Button className="w-fit">Save Changes</Button></div></form> : null}
        {activeTab === "address" ? <AddressPanel addresses={addresses} form={addressForm} setForm={setAddressForm} editingId={editingId} setEditingId={setEditingId} onSubmit={saveAddress} onEdit={editAddress} onDefault={makeDefault} onDelete={deleteAddress} /> : null}
        {activeTab === "security" ? <PasswordForm onSubmit={savePassword} /> : null}
        {passwordError ? <PasswordErrorModal error={passwordError} onClose={() => setPasswordError(null)} /> : null}
      </Card>
    </div>
  </section>;
}

function AddressPanel({ addresses, form, setForm, editingId, setEditingId, onSubmit, onEdit, onDefault, onDelete }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="mt-7 space-y-7"><form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="font-heading text-base font-semibold text-on-surface">{editingId ? "Edit address" : "Add address"}</h3>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_ADDRESS); }} className="text-xs font-semibold text-on-surface-variant underline">Cancel edit</button> : null}</div><Field label="Label"><Input value={form.label} onChange={(event) => update("label", event.target.value)} required /></Field><Field label="Full name"><Input value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field><Field label="Address" className="sm:col-span-2"><Input value={form.line1} onChange={(event) => update("line1", event.target.value)} required /></Field><Field label="City"><Input value={form.city} onChange={(event) => update("city", event.target.value)} required /></Field><Field label="State / Region"><Input value={form.region} onChange={(event) => update("region", event.target.value)} /></Field><Field label="Postal code"><Input value={form.postal} onChange={(event) => update("postal", event.target.value)} required /></Field><div className="sm:col-span-2"><Button className="w-fit"><Plus className="size-4" />{editingId ? "Save Changes" : "Add Address"}</Button></div></form><div><div className="mb-3 flex items-center justify-between"><h3 className="font-heading text-base font-semibold text-on-surface">Saved addresses</h3><span className="text-xs text-on-surface-variant">{addresses.length} saved</span></div>{addresses.length ? <div className="grid gap-4 md:grid-cols-2">{addresses.map((item) => <AddressCard key={item._id} address={item} onEdit={onEdit} onDefault={onDefault} onDelete={onDelete} />)}</div> : <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">No saved addresses yet. Add your first delivery address above.</div>}</div></div>;
}

function AddressCard({ address, onEdit, onDefault, onDelete }) { return <div className="rounded-xl border border-outline-variant bg-surface p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MapPin className="size-4 text-on-surface-variant" /><h4 className="font-semibold text-on-surface">{address.label || "Address"}</h4></div><p className="mt-3 text-sm font-medium text-on-surface">{address.name}</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">{address.line1}<br />{address.city}{address.region ? `, ${address.region}` : ""} {address.postal}</p></div>{address.default ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><Check className="size-3" />Default</span> : null}</div><div className="mt-5 flex flex-wrap gap-2 border-t border-outline-variant pt-4"><button type="button" onClick={() => onEdit(address)} className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-on-surface hover:text-on-surface"><Pencil className="size-3.5" />Edit</button>{!address.default ? <button type="button" onClick={() => onDefault(address._id)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-container">Make default</button> : <span className="px-2 py-2 text-xs text-emerald-700">Default delivery address</span>}<button type="button" onClick={() => onDelete(address._id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button></div></div>; }

function PasswordForm({ onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return <form onSubmit={(event) => { event.preventDefault(); onSubmit({ currentPassword, newPassword, confirmPassword }); }} className="mt-7 grid gap-5 sm:grid-cols-2">
    <Field label="Current password" className="sm:col-span-2">
      <PasswordInput name="currentPassword" autoComplete="current-password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent((value) => !value)} placeholder="Enter your current password" />
    </Field>
    <Field label="New password">
      <PasswordInput name="newPassword" autoComplete="new-password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew((value) => !value)} placeholder="Create a new password" />
      <p className="text-xs leading-5 text-on-surface-variant">8+ characters with at least one uppercase letter and one number.</p>
    </Field>
    <Field label="Confirm password">
      <PasswordInput name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm((value) => !value)} placeholder="Confirm your new password" />
    </Field>
    <div className="sm:col-span-2"><Button className="w-fit">Update Password</Button></div>
  </form>;
}

function PasswordInput({ name, autoComplete, value, onChange, show, onToggle, placeholder }) {
  return <div className="relative">
    <Input name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required minLength={8} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pr-11" />
    <button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition hover:text-on-surface" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
  </div>;
}

function PasswordErrorModal({ error, onClose }) {
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface shadow-2xl">
      <div className="flex items-start gap-4 p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="size-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-on-surface">{error.title}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{error.message}</p>
        </div>
      </div>
      <div className="flex justify-end border-t border-outline-variant px-6 py-4"><Button type="button" onClick={onClose}>OK</Button></div>
    </div>
  </div>;
}
function Field({ label, className = "", children }) { return <label className={`space-y-2 ${className}`}><Label>{label}</Label>{children}</label>; }
