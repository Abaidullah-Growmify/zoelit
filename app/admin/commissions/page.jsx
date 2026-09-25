"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle, ChevronDown, CircleOff, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import { AdminTable } from "@/components/admin-table";
import { getAdminCategories, getAdminProduct, getCategoryProducts, getCommissionRules, createCommissionRule, updateCommissionRule, deleteCommissionRule } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const empty = { type: "product", productId: "", category: "", valueType: "percentage", value: "", name: "", isActive: true };

export default function AdminCommissionsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategory, setProductCategory] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [ruleSearch, setRuleSearch] = useState("");
  const [ruleView, setRuleView] = useState("active");
  const [formReturnView, setFormReturnView] = useState("active");
  const [formOpen, setFormOpen] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [viewTarget, setViewTarget] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    const startedAt = Date.now();
    try {
      const [rulesData, categoryData] = await Promise.all([getCommissionRules(token), getAdminCategories(token)]);
      setRules(rulesData.rules || []);
      setCategories(categoryData.categories || []);
    } catch (error) { toast.error(error.message || "Could not load commissions"); }
    finally {
       const remaining = Math.max(0, 650 - (Date.now() - startedAt));
      window.setTimeout(() => setLoading(false), remaining);
    }
  }, [token]);
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (form.type !== "product" || !productCategory || !token) {
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setProductsLoading(true);
      getCategoryProducts(productCategory, { page: 1, limit: 200 }, token)
        .then((data) => { if (active) setCategoryProducts(data.products || []); })
        .catch((error) => { if (active) toast.error(error.message || "Could not load category products"); })
        .finally(() => { if (active) setProductsLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [form.type, productCategory, token]);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value, ...(key === "type" && value !== "product" ? { productId: "" } : {}) }));
    if (key === "type" && value !== "product") { setProductCategory(""); setProductSearch(""); }
  }
  async function edit(rule) {
    setFormReturnView(ruleView);
    setEditingId(rule._id);
    setForm({ ...empty, ...rule, valueType: rule.valueType || "percentage", value: rule.value ?? rule.rate ?? "" });
    setProductCategory(rule.type === "category" ? "" : rule.category || "");
    setProductSearch(rule.type === "product" ? rule.productId || "" : "");
    setRuleView("all");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (rule.type === "product" && rule.productId) {
      try {
        const data = await getAdminProduct(rule.productId, token);
        const product = data.product || {};
        setProductCategory(product.category || "");
        setProductSearch(`${product.name || product.description || "Unnamed product"} · ${product.ingramPartNumber || rule.productId}`);
      } catch {
        setProductSearch(rule.productId);
      }
    }
  }
  async function changeRuleStatus(rule, isActive) {
    setStatusSavingId(rule._id);
    try {
      const result = await updateCommissionRule(rule._id, { ...rule, isActive }, token);
      setRules((items) => items.map((item) => item._id === result.rule._id ? result.rule : item));
      if (isActive) { setRuleView("active"); setFormOpen(false); }
      toast.success(`Commission ${isActive ? "activated" : "deactivated"}`);
    } catch (error) { toast.error(error.message || "Could not update commission status"); }
    finally { setStatusSavingId(""); }
  }
  function requestStatusChange(rule) { setStatusTarget(rule); }
  async function confirmStatusChange() {
    if (!statusTarget) return;
    const rule = statusTarget;
    setStatusTarget(null);
    await changeRuleStatus(rule, rule.isActive === false);
  }
  function reset() { setEditingId(""); setForm(empty); setProductCategory(""); setProductSearch(""); setCategoryProducts([]); setProductOpen(false); }
  function openAddForm() {
    reset();
    setFormReturnView("all");
    setRuleView("all");
    setFormOpen(true);
  }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value), rate: form.valueType === "percentage" ? Number(form.value) : 0 };
      if (editingId) await updateCommissionRule(editingId, payload, token); else await createCommissionRule(payload, token);
      toast.success(editingId ? "Commission updated" : "Commission created"); const nextView = form.isActive ? "active" : "all"; reset(); setRuleView(nextView); setFormOpen(false); await load();
    } catch (error) {
      if (error.code === "DUPLICATE_COMMISSION_RULE") setDuplicateMessage(error.message);
      else toast.error(error.message || "Could not save commission");
    }
    finally { setSaving(false); }
  }
  async function remove(id) {
    const rule = rules.find((item) => item._id === id);
    if (rule) setDeleteTarget(rule);
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteCommissionRule(deleteTarget._id, token); toast.success("Commission deleted"); setDeleteTarget(null); await load(); } catch (error) { toast.error(error.message || "Could not delete commission"); }
    finally { setDeleting(false); }
  }

  const matchingProducts = categoryProducts.filter((product) => {
    const query = productOpen && form.productId ? "" : productSearch.trim().toLowerCase();
    return !query || `${product.name || product.description || ""} ${product.ingramPartNumber}`.toLowerCase().includes(query);
  });
  const filteredRules = rules.filter((rule) => {
    const query = ruleSearch.trim().toLowerCase();
    if (!query) return true;
    return `${rule.type} ${rule.name || ""} ${rule.productId || ""} ${rule.category || ""} ${rule.minOrderAmount || ""} ${rule.maxOrderAmount || ""}`.toLowerCase().includes(query);
  });
  const visibleRules = (ruleView === "active" ? filteredRules.filter((rule) => rule.isActive !== false) : filteredRules).map((rule, index) => ({ ...rule, serial: index + 1 }));

  if (loading) return <CommissionSkeleton />;
  if (ruleView === "active") return <ActiveCommissionRules rules={visibleRules} search={ruleSearch} onSearch={setRuleSearch} onAdd={openAddForm} onAll={() => { setRuleView("all"); setFormOpen(false); }} onView={setViewTarget} onEdit={edit} onDelete={remove} onStatusChange={changeRuleStatus} statusSavingId={statusSavingId} deleteTarget={deleteTarget} deleting={deleting} onCancelDelete={() => setDeleteTarget(null)} onConfirmDelete={confirmDelete} viewTarget={viewTarget} onCloseView={() => setViewTarget(null)} />;

  return <div className="space-y-6">
     <Card className="overflow-visible p-0">
      <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
         <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h1 className="font-heading text-2xl font-semibold text-on-surface">Commissions</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">Create and manage product, category, and general commission rules.</p></div><CommissionControls search={ruleSearch} onSearch={setRuleSearch} onAdd={openAddForm} /></div>
         <div className="mt-5 flex gap-1 border-b border-outline-variant/80"><button type="button" onClick={() => { setRuleView("active"); setEditingId(""); setFormOpen(false); }} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${ruleView === "active" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}>Active commissions</button><button type="button" onClick={() => { setRuleView("all"); setEditingId(""); reset(); setFormOpen(false); }} className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${ruleView === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}>All commissions</button></div>
      </div>
        {formOpen ? <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-inverse-surface/50 px-4 py-6 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-2xl border border-outline-variant bg-surface shadow-2xl"><div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-heading text-xl font-semibold text-on-surface">{editingId ? "Edit commission rule" : "Add commission rule"}</h2><button type="button" onClick={() => { reset(); setRuleView(formReturnView); setFormOpen(false); }} className="grid size-9 shrink-0 place-items-center rounded-xl border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface" aria-label="Close commission form"><X className="size-5" /></button></div>
        <form onSubmit={save} className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-low/20 p-4"><div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-on-surface">Rule type<select value={form.type} onChange={(e) => change("type", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm"><option value="product">Specific product</option><option value="category">Category</option><option value="global">General / all products</option></select></label>
            {form.type === "category" ? <label className="text-sm font-medium text-on-surface">Category<select required value={form.category} onChange={(e) => change("category", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm"><option value="">Choose category</option>{categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label> : null}
            {form.type === "product" ? <div className="sm:col-span-2"><ProductPicker categories={categories} category={productCategory} onCategoryChange={(value) => { setProductCategory(value); setProductSearch(""); setProductOpen(false); setForm((current) => ({ ...current, productId: "" })); }} value={productSearch} onChange={(value) => { setProductSearch(value); setProductOpen(true); setForm((current) => ({ ...current, productId: "" })); }} products={matchingProducts} loading={productsLoading} open={productOpen} onOpenChange={setProductOpen} onOutside={() => { const product = categoryProducts.find((item) => item.ingramPartNumber === form.productId); if (product) setProductSearch(`${product.name || product.description || "Unnamed product"} · ${product.ingramPartNumber}`); }} onSelect={(product) => { setForm((current) => ({ ...current, productId: product.ingramPartNumber })); setProductSearch(`${product.name || product.description || "Unnamed product"} · ${product.ingramPartNumber}`); setProductOpen(false); }} currentSku={editingId && !productCategory ? form.productId : ""} /></div> : null}
          </div><div className="mt-4 border-t border-outline-variant pt-4"><div className="grid gap-4 sm:grid-cols-2">
             <label className="text-sm font-medium text-on-surface">{form.valueType === "fixed" ? "Fixed commission per unit" : "Commission percentage"}<div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-outline-variant bg-surface transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"><input required type="number" min="0" max={form.valueType === "percentage" ? "100" : undefined} step={form.valueType === "percentage" ? "1" : "0.01"} inputMode="decimal" value={form.value} onChange={(e) => change("value", e.target.value)} placeholder={form.valueType === "percentage" ? "e.g. 5" : "e.g. 10.00 per unit"} className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm outline-none" /><select value={form.valueType} onChange={(e) => change("valueType", e.target.value)} aria-label="Commission value type" className="w-28 shrink-0 border-0 border-l border-outline-variant bg-surface-container-low px-2 text-center text-sm font-semibold text-on-surface outline-none"><option value="percentage">% Percentage</option><option value="fixed">$ Fixed amount</option></select></div></label>
            <label className="text-sm font-medium text-on-surface">Rule name<input value={form.name} onChange={(e) => change("name", e.target.value)} placeholder="Optional internal name" className="mt-2 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm" /></label>
            <label className="text-sm font-medium text-on-surface sm:col-span-2">Rule status<select value={form.isActive ? "active" : "inactive"} onChange={(e) => change("isActive", e.target.value === "active")} className="mt-2 h-11 w-full rounded-xl border border-outline-variant bg-surface px-3 text-sm sm:w-1/2"><option value="active">Active rule</option><option value="inactive">Inactive rule</option></select></label>
          </div></div></div>
          <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => { reset(); setRuleView(formReturnView); setFormOpen(false); }}>Cancel</Button><Button disabled={saving} type="submit" className="min-w-36 gap-2"><Plus className="size-4" />{saving ? "Saving..." : editingId ? "Update rule" : "Add rule"}</Button></div>
       </form>
        </div></div></div> : null}
        {ruleView === "all" && !formOpen ? <div><AllCommissionRules rules={rules} search={ruleSearch} onSearch={setRuleSearch} onAdd={openAddForm} onEdit={edit} onDelete={remove} onStatusChange={requestStatusChange} /></div> : null}
      {ruleView === "active" ? <div className="border-t border-outline-variant">
          <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low/25 px-5 py-5 sm:px-7 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="font-heading text-lg font-semibold text-on-surface">Active commission rules</h2><p className="mt-1 text-sm text-on-surface-variant">Active rules are applied automatically to new orders.</p></div><div className="relative w-full sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={ruleSearch} onChange={(event) => setRuleSearch(event.target.value)} placeholder="Search rules" aria-label="Search commission rules" className="h-10 pl-10" /></div></div>
         {loading ? <p className="p-6 text-sm text-on-surface-variant">Loading...</p> : rules.length === 0 ? <p className="p-6 text-sm text-on-surface-variant">No commission rules configured.</p> : visibleRules.length === 0 ? <p className="p-6 text-sm text-on-surface-variant">No rules match your search.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-outline-variant bg-surface-container-low/20 text-xs uppercase tracking-wide text-on-surface-variant"><tr><th className="px-5 py-3 font-semibold sm:px-7">Type</th><th className="px-5 py-3 font-semibold">Applies to</th><th className="px-5 py-3 font-semibold">Rate</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold sm:px-7">Actions</th></tr></thead><tbody className="divide-y divide-outline-variant">{visibleRules.map((rule) => <tr key={rule._id} className="transition-colors hover:bg-surface-container-low/30"><td className="px-5 py-4 sm:px-7"><span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{ruleTypeLabel(rule.type)}</span></td><td className="max-w-sm px-5 py-4 font-semibold text-on-surface">{ruleTargetLabel(rule)}{rule.name ? <span className="mt-1 block text-xs font-normal text-on-surface-variant">{rule.name}</span> : null}</td><td className="px-5 py-4 font-semibold tabular-nums text-on-surface">{rule.rate}%</td><td className="px-5 py-4"><select value={rule.isActive === false ? "inactive" : "active"} disabled={statusSavingId === rule._id} onChange={(event) => changeRuleStatus(rule, event.target.value === "active")} className={`h-8 rounded-lg border px-2 text-xs font-semibold ${rule.isActive === false ? "border-slate-300 bg-slate-50 text-slate-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}><option value="active">Active</option><option value="inactive">Inactive</option></select></td><td className="px-5 py-4 sm:px-7"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => edit(rule)} aria-label="Edit rule"><Pencil className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => remove(rule._id)} aria-label="Delete rule"><Trash2 className="size-4 text-error" /></Button></div></td></tr>)}</tbody></table></div>}
       </div> : null}
     </Card>
      <DeleteCommissionModal rule={deleteTarget} deleting={deleting} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
      <StatusCommissionModal rule={statusTarget} saving={Boolean(statusSavingId)} onCancel={() => setStatusTarget(null)} onConfirm={confirmStatusChange} />
      <DuplicateCommissionModal message={duplicateMessage} onClose={() => setDuplicateMessage("")} />
    </div>;
}

function DuplicateCommissionModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-on-surface">Commission already exists</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{message.replace(" Edit the existing rule instead of creating another one.", "")}</p>
            <p className="mt-2 text-xs text-on-surface-variant">Edit the existing rule instead of creating a duplicate.</p>
          </div>
        </div>
        <div className="flex justify-end border-t border-outline-variant px-6 py-4">
          <Button type="button" onClick={onClose}>OK</Button>
        </div>
      </div>
    </div>
  );
}

function ruleTypeLabel(type) {
  if (type === "product") return "Product";
  if (type === "category") return "Category";
  if (type === "global") return "General / all products";
  return "Unknown";
}

function ruleTargetLabel(rule) {
  if (rule.type === "product") return `Product SKU: ${rule.productId}`;
  if (rule.type === "category") return `Category: ${rule.category}`;
  if (rule.type === "global") return "All products and categories";
  return "General / all products";
}

function commissionValueLabel(rule) {
  const value = rule.value ?? rule.rate ?? 0;
  return rule.valueType === "fixed" ? `$${Number(value).toFixed(2)}` : `${value}%`;
}

function CommissionControls({ search, onSearch, onAdd }) {
  return <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto"><div className="relative min-w-0 flex-1 sm:w-72 lg:w-80"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search commission rules" aria-label="Search commission rules" className="h-10 pl-10" /></div><Button type="button" onClick={onAdd} className="h-10 shrink-0 gap-2"><Plus className="size-4" />Add commission</Button></div>;
}

function CommissionSkeleton() {
  const headerWidths = ["w-8", "w-20", "w-32", "w-24", "w-16", "w-20", "w-20"];
  const rowWidths = ["w-8", "w-20", "w-40", "w-24", "w-20", "w-20", "w-8"];

  return <div className="space-y-6"><Card className="overflow-hidden p-0"><div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="w-full max-w-2xl"><Skeleton className="h-9 w-48 rounded-sm" /><Skeleton className="mt-3 h-5 w-full max-w-xl rounded-sm" /></div><div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"><Skeleton className="h-10 w-full sm:w-72" /><Skeleton className="h-10 w-full sm:w-40" /></div></div><div className="mt-6 flex gap-6 border-b border-outline-variant/80"><Skeleton className="h-10 w-40 rounded-t-md" /><Skeleton className="h-10 w-32 rounded-t-md" /></div></div><div className="border-b border-outline-variant px-5 py-5 sm:px-7"><Skeleton className="h-7 w-56 rounded-sm" /><Skeleton className="mt-3 h-4 w-full max-w-md rounded-sm" /></div><div className="overflow-x-auto"><div className="flex min-w-[760px] gap-6 border-b border-outline-variant bg-surface-container-low/40 px-5 py-4 sm:px-7">{headerWidths.map((width, index) => <Skeleton key={`header-${index}`} className={`h-3 ${width} shrink-0 rounded-sm`} />)}</div>{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex min-w-[760px] items-center gap-6 border-b border-outline-variant/60 px-5 py-5 sm:px-7">{rowWidths.map((width, cellIndex) => <Skeleton key={cellIndex} className={`h-4 ${width} shrink-0 rounded-sm`} />)}</div>)}</div></Card></div>;
}

function AllCommissionRules({ rules, search, onSearch, onAdd, onEdit, onDelete, onStatusChange }) {
  const visibleRules = rules.filter((rule) => {
    const query = search.trim().toLowerCase();
    return !query || `${rule.type} ${rule.name || ""} ${rule.productId || ""} ${rule.category || ""} ${rule.value ?? rule.rate ?? ""}`.toLowerCase().includes(query);
  });

  return (
    <div className="border-t border-outline-variant">
      <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low/25 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-on-surface">All commission rules</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Review and manage every commission rule.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search rules" className="h-10 pl-10" />
          </div>
          <Button onClick={onAdd} className="gap-2"><Plus className="size-4" />Add commission</Button>
        </div>
      </div>
      {visibleRules.length === 0 ? <p className="p-7 text-sm text-on-surface-variant">{rules.length === 0 ? "No commission rules configured." : "No rules match your search."}</p> : <CommissionCardGrid rules={visibleRules} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />}
    </div>
  );
}

function CommissionCardGrid({ rules, onEdit, onDelete, onStatusChange }) {
  return <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">{rules.map((rule) => <div key={rule._id} className="flex min-h-56 flex-col justify-between rounded-xl border border-outline-variant bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"><div><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{ruleTypeLabel(rule.type)}</span></div><h3 className="mt-5 line-clamp-2 font-heading text-lg font-semibold text-on-surface">{ruleTargetLabel(rule)}</h3><p className="mt-2 text-sm text-on-surface-variant">{rule.name || "No rule name"}</p></div><div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4"><div className="shrink-0"><p className="text-xs uppercase tracking-wide text-on-surface-variant">Commission</p><p className="mt-1 font-semibold tabular-nums leading-none text-on-surface">{commissionValueLabel(rule)}</p></div><div className="flex shrink-0 items-center gap-1 self-center"><Button type="button" size="sm" variant="outline" onClick={() => onStatusChange(rule)} aria-label={`${rule.isActive === false ? "Activate" : "Deactivate"} commission`} title={`Click to ${rule.isActive === false ? "activate" : "deactivate"} this commission`} className={`inline-flex h-9 min-w-[7rem] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border text-center font-semibold leading-none shadow-sm transition hover:-translate-y-px hover:shadow ${rule.isActive === false ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200" : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{rule.isActive === false ? <CircleOff className="size-3.5 shrink-0" /> : <CheckCircle className="size-3.5 shrink-0" />}{rule.isActive === false ? "Inactive" : "Active"}</Button><Button variant="ghost" size="sm" onClick={() => onEdit(rule)} aria-label="Edit rule"><Pencil className="size-4" /></Button><Button variant="ghost" size="sm" onClick={() => onDelete(rule._id)} aria-label="Delete rule"><Trash2 className="size-4 text-error" /></Button></div></div></div>)}</div>;
}

function ActiveCommissionRules({ rules, search, onSearch, onAdd, onAll, onView, onEdit, onDelete, onStatusChange, statusSavingId, deleteTarget, deleting, onCancelDelete, onConfirmDelete, viewTarget, onCloseView }) {
  const columns = [
    { key: "serial", header: "#", accessor: "serial", sortable: true, cellClassName: "w-16 font-semibold tabular-nums text-on-surface" },
    { key: "type", header: "Type", accessor: (rule) => ruleTypeLabel(rule.type), sortable: true, render: (rule) => <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">{ruleTypeLabel(rule.type)}</span> },
    { key: "target", header: "Applies to", accessor: (rule) => ruleTargetLabel(rule), sortable: true, render: (rule) => <p className="max-w-sm font-semibold text-on-surface">{ruleTargetLabel(rule)}</p> },
    { key: "name", header: "Rule name", accessor: "name", sortable: true, render: (rule) => <span className="text-on-surface-variant">{rule.name || "-"}</span> },
    { key: "rate", header: "Value", accessor: (rule) => rule.value ?? rule.rate, sortable: true, render: (rule) => <span className="font-semibold tabular-nums text-on-surface">{commissionValueLabel(rule)}</span> },
    { key: "status", header: "Status", accessor: (rule) => rule.isActive === false ? "Inactive" : "Active", render: (rule) => <select value={rule.isActive === false ? "inactive" : "active"} disabled={statusSavingId === rule._id} onChange={(event) => onStatusChange(rule, event.target.value === "active")} className="h-8 rounded-lg border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700"><option value="active">Active</option><option value="inactive">Inactive</option></select> },
  ];

  if (Array.isArray(rules)) return <ActiveCommissionLayout rules={rules} columns={columns} search={search} onSearch={onSearch} onAdd={onAdd} onAll={onAll} onView={onView} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} deleteTarget={deleteTarget} deleting={deleting} onCancelDelete={onCancelDelete} onConfirmDelete={onConfirmDelete} viewTarget={viewTarget} onCloseView={onCloseView} />;

  return <div className="space-y-4"><Card className="overflow-visible p-0"><div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7"><h1 className="font-heading text-2xl font-semibold text-on-surface">Commissions</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">Create and manage product, category, and general commission rules.</p><div className="mt-5 flex gap-1 border-b border-outline-variant/80"><button type="button" className="border-b-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary">Active commissions</button><button type="button" onClick={onAll} className="border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface">All commissions</button></div></div><AdminTable title="Active commission rules" description="Only active rules are applied automatically to new orders." columns={columns} data={rules} searchPlaceholder="Search active rules" searchKeys={["type", "productId", "category", "name", "rate"]} action={<div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative min-w-[16rem] sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" /><Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search active rules" aria-label="Search active rules" className="h-10 pl-10" /></div><Button type="button" onClick={onAdd} className="h-10 shrink-0 gap-2"><Plus className="size-4" />Add commission</Button></div>} hideSearch rowActions={(rule) => [{ label: "View", icon: Eye, onClick: () => onView(rule) }, { label: "Edit rule", icon: Pencil, onClick: () => onEdit(rule) }, { label: "Delete rule", icon: Trash2, onClick: () => onDelete(rule._id), tone: "danger" }]} /></Card><DeleteCommissionModal rule={deleteTarget} deleting={deleting} onCancel={onCancelDelete} onConfirm={onConfirmDelete} /><CommissionViewModal rule={viewTarget} onClose={onCloseView} /></div>;
}

function ActiveCommissionLayout({ rules, columns, search, onSearch, onAdd, onAll, onView, onEdit, onDelete, deleteTarget, deleting, onCancelDelete, onConfirmDelete, viewTarget, onCloseView }) {
  return <div className="space-y-4"><Card className="overflow-visible p-0"><div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7"><div className="flex items-start justify-between gap-6"><div><h1 className="font-heading text-2xl font-semibold text-on-surface">Commissions</h1><p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">Create and manage product, category, and general commission rules.</p></div><CommissionControls search={search} onSearch={onSearch} onAdd={onAdd} /></div><div className="mt-5 flex gap-1 border-b border-outline-variant/80"><button type="button" className="border-b-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary">Active commissions</button><button type="button" onClick={onAll} className="border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface">All commissions</button></div></div><AdminTable title="Active commission rules" description="Only active rules are applied automatically to new orders." columns={columns} data={rules} searchKeys={["type", "productId", "category", "name", "rate"]} hideSearch rowActions={(rule) => [{ label: "View", icon: Eye, onClick: () => onView(rule) }, { label: "Edit rule", icon: Pencil, onClick: () => onEdit(rule) }, { label: "Delete rule", icon: Trash2, onClick: () => onDelete(rule._id), tone: "danger" }]} /></Card><DeleteCommissionModal rule={deleteTarget} deleting={deleting} onCancel={onCancelDelete} onConfirm={onConfirmDelete} /><CommissionViewModal rule={viewTarget} onClose={onCloseView} /></div>;
}

function CommissionViewModal({ rule, onClose }) {
  if (!rule) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/50 px-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface p-6 shadow-2xl" role="dialog" aria-modal="true"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Commission rule</p><h2 className="mt-1 font-heading text-xl font-semibold text-on-surface">{ruleTypeLabel(rule.type)}</h2></div><button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low" aria-label="Close commission details"><X className="size-4" /></button></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><span className="text-on-surface-variant">Applies to</span><strong className="text-right text-on-surface">{ruleTargetLabel(rule)}</strong></div><div className="flex justify-between gap-4"><span className="text-on-surface-variant">Value</span><strong className="text-on-surface">{commissionValueLabel(rule)}</strong></div><div className="flex justify-between gap-4"><span className="text-on-surface-variant">Status</span><strong className="text-emerald-700">{rule.isActive === false ? "Inactive" : "Active"}</strong></div>{rule.name ? <div className="flex justify-between gap-4"><span className="text-on-surface-variant">Rule name</span><strong className="text-right text-on-surface">{rule.name}</strong></div> : null}</div><div className="mt-6 flex justify-end border-t border-outline-variant pt-4"><Button type="button" onClick={onClose}>Close</Button></div></div></div>;
}

function StatusCommissionModal({ rule, saving, onCancel, onConfirm }) {
  if (!rule) return null;
  const activating = rule.isActive === false;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/50 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onCancel(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="status-commission-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl">
      <div className="flex items-start gap-4 border-b border-outline-variant px-5 py-5"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{activating ? <Check className="size-5" /> : <AlertTriangle className="size-5" />}</span><div className="min-w-0 flex-1"><h2 id="status-commission-title" className="font-heading text-lg font-semibold text-on-surface">Are you sure?</h2><p className="mt-1 text-sm leading-5 text-on-surface-variant">Are you sure you want to {activating ? "activate" : "deactivate"} this commission rule?</p></div><button type="button" onClick={onCancel} disabled={saving} className="grid size-8 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface" aria-label="Close dialog"><X className="size-4" /></button></div>
       <div className="flex flex-col-reverse gap-2 border-t border-outline-variant px-5 py-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button><Button onClick={onConfirm} disabled={saving}>{saving ? "Updating..." : "OK"}</Button></div>
    </div>
  </div>;
}

function DeleteCommissionModal({ rule, deleting, onCancel, onConfirm }) {
  if (!rule) return null;
  const target = rule.type === "product" ? rule.productId : rule.type === "category" ? rule.category : "all products";
  return <div className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/50 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="delete-commission-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-2xl">
      <div className="flex items-start gap-4 border-b border-outline-variant px-5 py-5"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-error-container text-error"><AlertTriangle className="size-5" /></span><div className="min-w-0 flex-1"><h2 id="delete-commission-title" className="font-heading text-lg font-semibold text-on-surface">Delete commission rule?</h2><p className="mt-1 text-sm leading-5 text-on-surface-variant">This rule for <strong className="text-on-surface">{target}</strong> will be permanently removed.</p></div><button type="button" onClick={onCancel} disabled={deleting} className="grid size-8 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface" aria-label="Close dialog"><X className="size-4" /></button></div>
       <div className="flex flex-col-reverse gap-2 border-t border-outline-variant px-5 py-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={onCancel} disabled={deleting}>Cancel</Button><Button variant="danger" onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting..." : "Delete rule"}</Button></div>
    </div>
  </div>;
}

function ProductPicker({ categories, category, onCategoryChange, value, onChange, products, loading, open, onOpenChange, onOutside, onSelect, currentSku }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event) {
      if (!pickerRef.current?.contains(event.target)) { onOutside(); onOpenChange(false); }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open, onOpenChange, onOutside]);

  return <div className="space-y-5">
    <label className="block text-sm font-medium text-on-surface">Product category
      <select value={category} onChange={(event) => onCategoryChange(event.target.value)} title={category} className="mt-1.5 h-10 w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-outline-variant bg-surface px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
        <option value="">Choose a category first</option>
        {categories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
      </select>
    </label>
    <label className="block text-sm font-medium text-on-surface">Product
      <div ref={pickerRef} className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
        <div className="overflow-hidden rounded-md border border-outline-variant bg-surface transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <input required={!currentSku} value={value} disabled={!category || loading} onFocus={() => onOpenChange(true)} onChange={(event) => onChange(event.target.value)} placeholder={category ? "Search product name or SKU..." : "Select a category first"} title={value} className="h-10 w-full overflow-hidden text-ellipsis whitespace-nowrap border-0 bg-transparent pl-10 pr-10 text-sm outline-none placeholder:text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-60" />
        </div>
        <button type="button" disabled={!category || loading} onMouseDown={(event) => event.preventDefault()} onClick={() => onOpenChange(!open)} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50" aria-label={open ? "Close product options" : "Open product options"}>
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && category && !loading ? <div className="absolute left-0 right-0 top-full z-20 max-h-72 overflow-y-auto rounded-b-md border border-t-0 border-outline-variant bg-surface p-1.5 shadow-xl">
          {products.length ? products.slice(0, 50).map((product) => <button type="button" key={product.ingramPartNumber} onClick={() => onSelect(product)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-surface-container-low"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-on-surface">{product.name || product.description || "Unnamed product"}</span><span className="block truncate text-xs text-on-surface-variant">{product.ingramPartNumber}</span></span>{value.includes(product.ingramPartNumber) ? <Check className="size-4 shrink-0 text-primary" /> : null}</button>) : <p className="px-3 py-6 text-center text-sm text-on-surface-variant">No matching products found</p>}
        </div> : null}
      </div>
    </label>
    {currentSku ? <p className="text-xs text-on-surface-variant">Selected product: <strong className="text-on-surface">{currentSku}</strong>. Choose a category to change it.</p> : null}
  </div>;
}
