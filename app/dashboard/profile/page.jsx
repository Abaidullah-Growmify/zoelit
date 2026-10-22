"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, ChevronRight, Eye, EyeOff, LockKeyhole, MapPin, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card, Input, Label } from "@/components/ui";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";
import { ProfileSkeleton } from "@/components/skeletons";

const EMPTY_ADDRESS = { label: "Home", name: "", line1: "", city: "", region: "", postal: "" };
const TABS = [
  { id: "profile", label: "Profile Information", subtitle: "Name, email, phone", icon: UserRound },
  { id: "address", label: "Shipping Address", subtitle: "Delivery locations", icon: MapPin },
  { id: "security", label: "Security", subtitle: "Password", icon: LockKeyhole },
];
const DESCRIPTIONS = {
  profile: "Update your personal details.",
  address: "Save multiple delivery locations and choose a default.",
  security: "Keep your account secure with a strong password.",
};

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const activeTab = TABS.some((tab) => tab.id === requestedSection) ? requestedSection : "profile";
  const isMobileMenu = !requestedSection;
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [initialProfile, setInitialProfile] = useState({ name: "", phone: "" });
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordDirty, setPasswordDirty] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!token) return undefined;
    Promise.all([api.getProfile(token), api.getAddresses(token).catch(() => ({ addresses: [] }))])
      .then(([profileResult, addressResult]) => {
        if (!mounted) return;
        const user = profileResult.user || {};
        const nextProfile = { name: user.name || "", phone: user.phone || "" };
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
        setAddresses(addressResult.addresses || []);
        setLoading(false);
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({ name: profile.name, phone: profile.phone }, token);
      setInitialProfile(profile);
      toast.success("Profile changes saved");
    } catch (error) {
      toast.error(error.message || "Could not save profile");
    } finally { setSaving(false); }
  }

  async function saveAddress(event) {
    event.preventDefault();
    setSaving(true);
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
    } catch (error) {
      toast.error(error.message || "Could not save address");
    } finally { setSaving(false); }
  }

  async function makeDefault(id) {
    try {
      const result = await api.setDefaultAddress(id, token);
      setAddresses((current) => current.map((item) => ({ ...item, default: item._id === result.address._id })));
      toast.success("Default address updated");
    } catch (error) { toast.error(error.message || "Could not update default address"); }
  }

  async function confirmDeleteAddress() {
    if (!deleteTarget) return;
    try {
      await api.deleteAddress(deleteTarget._id, token);
      setAddresses((current) => current.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Address deleted");
    } catch (error) { toast.error(error.message || "Could not delete address"); }
  }

  function editAddress(item) {
    setEditingId(item._id);
    setAddressForm({ label: item.label || "Home", name: item.name || "", line1: item.line1 || "", city: item.city || "", region: item.region || "", postal: item.postal || "" });
  }

  function requestDelete(itemOrId) {
    const target = typeof itemOrId === "string" ? addresses.find((item) => item._id === itemOrId) : itemOrId;
    if (target) setDeleteTarget(target);
  }

  async function savePassword({ currentPassword, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) {
      setPasswordError({ title: "Passwords do not match", message: "Your new password and confirmation do not match. Please re-enter them." });
      return;
    }
    setSaving(true);
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
    } finally { setSaving(false); }
  }

  function hasUnsavedChanges() {
    if (activeTab === "profile") return profile.name !== initialProfile.name || profile.phone !== initialProfile.phone;
    if (activeTab === "address") return Boolean(editingId) || Object.keys(EMPTY_ADDRESS).some((key) => addressForm[key] !== EMPTY_ADDRESS[key]);
    return passwordDirty;
  }

  function goToMenu() {
    if (!hasUnsavedChanges() || window.confirm("Discard changes?")) router.push(pathname);
  }

  function goToSection(id) {
    if (id === activeTab || !hasUnsavedChanges() || window.confirm("Discard changes?")) router.push(`${pathname}?section=${id}`);
  }

  if (loading) return <ProfileSkeleton />;

  const currentTab = TABS.find((tab) => tab.id === activeTab);
  const bannerTitle = isMobileMenu ? "Account Settings" : currentTab.label;
  const bannerDescription = isMobileMenu ? "Manage your profile, addresses and security." : DESCRIPTIONS[activeTab];
  const sectionContent = activeTab === "profile" ? (
    <form id="profile-form" onSubmit={saveProfile} className="mt-7 grid min-w-0 gap-5 md:grid-cols-2">
      <Field label="Full name"><Input className="h-11 text-base scroll-mb-28" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required /></Field>
      <Field label="Phone"><Input className="h-11 text-base scroll-mb-28" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field>
      <div className="md:col-span-2"><Button disabled={saving} className="inline-flex w-full md:w-fit">{saving ? "Saving..." : "Save Changes"}</Button></div>
    </form>
  ) : activeTab === "address" ? (
    <AddressPanel addresses={addresses} form={addressForm} setForm={setAddressForm} editingId={editingId} setEditingId={setEditingId} onSubmit={saveAddress} onEdit={editAddress} onDefault={makeDefault} onDelete={requestDelete} saving={saving} />
  ) : (
    <PasswordForm onSubmit={savePassword} saving={saving} onDirty={setPasswordDirty} />
  );

  return (
    <section className="min-w-0">
      <DashboardSectionBanner eyebrow="Account / Settings" title={bannerTitle} description={bannerDescription} />

      {isMobileMenu ? <nav className="mt-6 space-y-3 md:hidden">{TABS.map(({ id, label, subtitle, icon: Icon }) => <Link key={id} href={`${pathname}?section=${id}`} className="flex min-h-[68px] min-w-0 items-center gap-3 rounded-xl border border-outline-variant bg-surface px-4 active:bg-slate-50"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-on-surface">{label}</span><span className="block truncate text-xs text-on-surface-variant">{subtitle}</span></span><ChevronRight className="size-4 shrink-0 text-on-surface-variant" /></Link>)}</nav> : null}

      <div className={`${isMobileMenu ? "hidden md:grid" : "grid"} mt-6 min-w-0 items-start gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-7`}>
        <aside className="profile-settings-nav hidden rounded-[14px] border border-outline-variant bg-surface p-2 md:sticky md:top-4 md:block lg:static"><nav className="space-y-1">{TABS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => goToSection(id)} className={`flex flex-row h-11 min-h-11 w-full min-w-0 items-center justify-start gap-1 rounded-[10px] px-3 text-left text-sm font-medium transition lg:px-4 lg:py-3 ${activeTab === id ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}><Icon className="order-first size-4 shrink-0" /><span className="min-w-0 flex-1 text-left">{label}</span></button>)}</nav></aside>
        <Card className="min-w-0 p-4 md:p-6 lg:p-9"><div className="mb-1 flex items-center gap-2 md:hidden"><button type="button" onClick={goToMenu} className="grid size-10 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low" aria-label="Back to account settings"><ArrowLeft className="size-5" /></button><h2 className="font-heading text-lg font-semibold text-on-surface">{currentTab.label}</h2></div><div className="min-w-0">{sectionContent}</div>{editingId ? <EditAddressModal form={addressForm} setForm={setAddressForm} onSubmit={saveAddress} saving={saving} onClose={() => { setEditingId(null); setAddressForm(EMPTY_ADDRESS); }} /> : null}{deleteTarget ? <DeleteAddressModal address={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDeleteAddress} /> : null}{passwordError ? <PasswordErrorModal error={passwordError} onClose={() => setPasswordError(null)} /> : null}</Card>
      </div>
    </section>
  );
}

function DeleteAddressModal({ address, onCancel, onConfirm }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div role="dialog" aria-modal="true" aria-labelledby="delete-address-title" className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl"><h2 id="delete-address-title" className="font-heading text-xl font-semibold text-on-surface">Delete address?</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">Are you sure you want to delete <strong>{address.label || address.name || "this address"}</strong>? This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="button" variant="danger" onClick={onConfirm}>Delete Address</Button></div></div></div>;
}

function EditAddressModal({ form, setForm, onSubmit, saving, onClose }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="edit-address-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-outline-variant bg-surface p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Edit mode</p><h2 id="edit-address-title" className="mt-1 font-heading text-xl font-semibold text-on-surface">Edit shipping address</h2><p className="mt-1 text-sm text-on-surface-variant">Update the saved address details below.</p></div><button type="button" onClick={onClose} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low">Cancel</button></div><form onSubmit={onSubmit} className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Label"><Input className="h-11 text-base" value={form.label} onChange={(event) => update("label", event.target.value)} required /></Field><Field label="Full name"><Input className="h-11 text-base" value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field><Field label="Address" className="md:col-span-2"><Input className="h-11 text-base" value={form.line1} onChange={(event) => update("line1", event.target.value)} required /></Field><Field label="City"><Input className="h-11 text-base" value={form.city} onChange={(event) => update("city", event.target.value)} required /></Field><Field label="State / Region"><Input className="h-11 text-base" value={form.region} onChange={(event) => update("region", event.target.value)} /></Field><Field label="Postal code"><Input className="h-11 text-base" value={form.postal} onChange={(event) => update("postal", event.target.value)} required /></Field><div className="flex justify-end gap-3 md:col-span-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button></div></form></div></div>;
}

function AddressPanel({ addresses, form, setForm, editingId, setEditingId, onSubmit, onEdit, onDefault, onDelete, saving }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="mt-7 min-w-0 space-y-7"><form id="address-form" onSubmit={onSubmit} className="grid min-w-0 gap-5 border-0 bg-transparent p-0 md:grid-cols-2 md:rounded-xl md:border md:border-outline-variant md:bg-surface-container-lowest md:p-5"><div className="flex min-w-0 items-center justify-between md:col-span-2"><h3 className="font-heading text-base font-semibold text-on-surface">{editingId ? "Edit address" : "Add address"}</h3>{editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_ADDRESS); }} className="min-h-11 text-xs font-semibold text-on-surface-variant underline">Cancel edit</button> : null}</div><Field label="Label"><Input className="h-11 text-base scroll-mb-28" value={form.label} onChange={(event) => update("label", event.target.value)} required /></Field><Field label="Full name"><Input className="h-11 text-base scroll-mb-28" value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field><Field label="Address" className="md:col-span-2"><Input className="h-11 text-base scroll-mb-28" value={form.line1} onChange={(event) => update("line1", event.target.value)} required /></Field><Field label="City"><Input className="h-11 text-base scroll-mb-28" value={form.city} onChange={(event) => update("city", event.target.value)} required /></Field><Field label="State / Region"><Input className="h-11 text-base scroll-mb-28" value={form.region} onChange={(event) => update("region", event.target.value)} /></Field><Field label="Postal code"><Input className="h-11 text-base scroll-mb-28" value={form.postal} onChange={(event) => update("postal", event.target.value)} required /></Field><div className="md:col-span-2"><Button disabled={saving} className="inline-flex w-full md:w-fit"><Plus className="size-4" />{saving ? "Saving..." : editingId ? "Save Changes" : "Add Address"}</Button></div></form><div><div className="mb-3 flex items-center justify-between"><h3 className="font-heading text-base font-semibold text-on-surface">Saved addresses</h3><span className="text-xs text-on-surface-variant">{addresses.length} saved</span></div>{addresses.length ? <div className="grid min-w-0 gap-4 md:grid-cols-2">{addresses.map((item) => <AddressCard key={item._id} address={item} onEdit={onEdit} onDefault={onDefault} onDelete={onDelete} />)}</div> : <div className="rounded-xl border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">No saved addresses yet.</div>}</div></div>;
}

function AddressCard({ address, onEdit, onDefault, onDelete }) { return <div className="min-w-0 rounded-xl border border-outline-variant bg-surface p-4 shadow-sm md:p-5"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0 text-on-surface-variant" /><h4 className="truncate font-semibold text-on-surface">{address.label || "Address"}</h4></div><p className="mt-3 text-sm font-medium text-on-surface">{address.name}</p><p className="mt-1 break-words text-sm leading-6 text-on-surface-variant">{address.line1}<br />{address.city}{address.region ? `, ${address.region}` : ""} {address.postal}</p></div>{address.default ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><Check className="size-3" />Default</span> : null}</div><div className="mt-5 flex flex-wrap gap-2 border-t border-outline-variant pt-4"><button type="button" onClick={() => onEdit(address)} className="min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface-variant hover:border-on-surface hover:text-on-surface"><Pencil className="size-3.5" />Edit</button>{!address.default ? <button type="button" onClick={() => onDefault(address._id)} className="min-h-11 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-container">Make default</button> : <span className="px-2 py-2 text-xs text-emerald-700">Default delivery address</span>}<button type="button" onClick={() => onDelete(address._id)} className="min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Delete</button></div></div>; }

function PasswordForm({ onSubmit, saving, onDirty }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const update = (setter) => (value) => { setter(value); onDirty(true); };
  return <form id="security-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ currentPassword, newPassword, confirmPassword }); }} className="mt-7 grid min-w-0 gap-5 md:grid-cols-2"><Field label="Current password" className="md:col-span-2"><PasswordInput name="currentPassword" autoComplete="current-password" value={currentPassword} onChange={update(setCurrentPassword)} show={showCurrent} onToggle={() => setShowCurrent((value) => !value)} placeholder="Enter your current password" /></Field><Field label="New password"><PasswordInput name="newPassword" autoComplete="new-password" value={newPassword} onChange={update(setNewPassword)} show={showNew} onToggle={() => setShowNew((value) => !value)} placeholder="Create a new password" /><p className="text-xs leading-5 text-on-surface-variant">8+ characters with at least one uppercase letter and one number.</p></Field><Field label="Confirm password"><PasswordInput name="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={update(setConfirmPassword)} show={showConfirm} onToggle={() => setShowConfirm((value) => !value)} placeholder="Confirm your new password" /></Field><div className="md:col-span-2"><Button disabled={saving} className="inline-flex w-full md:w-fit">{saving ? "Saving..." : "Update Password"}</Button></div></form>;
}

function PasswordInput({ name, autoComplete, value, onChange, show, onToggle, placeholder }) { return <div className="relative"><Input name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required minLength={8} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 pr-12 text-base scroll-mb-28" /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex h-11 w-11 items-center justify-center text-on-surface-variant transition hover:text-on-surface" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>; }

function PasswordErrorModal({ error, onClose }) { return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface shadow-2xl"><div className="flex items-start gap-4 p-6"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="size-5" /></span><div className="min-w-0 flex-1"><h2 className="font-heading text-lg font-semibold text-on-surface">{error.title}</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">{error.message}</p></div></div><div className="flex justify-end border-t border-outline-variant px-6 py-4"><Button type="button" onClick={onClose}>OK</Button></div></div></div>; }
function Field({ label, className = "", children }) { return <label className={`min-w-0 space-y-1.5 ${className}`}><Label className="mb-1.5 block">{label}</Label>{children}</label>; }
