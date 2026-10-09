"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, CheckCircle, ChevronDown, CircleOff, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, Input, Skeleton } from "@/components/ui";
import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminCategories,
  getAdminProducts,
  getAdminProductsByIds,
  getAdminVouchers,
  updateAdminVoucher,
  updateAdminVoucherStatus,
} from "@/lib/api";
import { money } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const CODE_MAX_LENGTH = 40;
const NAME_MAX_LENGTH = 60;

const emptyForm = {
  code: "",
  name: "",
  // Kept in the payload but no longer edited: existing descriptions survive a
  // save, and new vouchers simply have none.
  description: "",
  discountType: "percentage",
  discountValue: "",
  appliesTo: "all",
  categoryIds: [],
  usageLimit: "",
  usageLimitPerCustomer: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  isActive: true,
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function isoToInputDate(iso) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
}

function isoToInputTime(iso) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
}

// A date + time pair typed in the admin's own timezone is converted to an ISO
// instant here, so the server never has to guess which timezone the form was
// filled in. An empty date means the voucher has no window bound.
function toIso(dateValue, timeValue) {
  const date = String(dateValue || "").trim();
  if (!date) return "";
  const time = String(timeValue || "").trim() || "00:00";
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

// Mirrors the server's normalizeVoucher rules so the admin sees the problem
// beside the field instead of only after a round trip. The server still runs
// every rule again, so this is purely the fast feedback path - the messages
// are kept word for word identical to keep the two sides in step.
function validateVoucherForm(form, selectedProductIds) {
  const errors = {};

  const code = String(form.code || "").trim();
  if (!code) errors.code = "Voucher code is required.";
  else if (code.length > CODE_MAX_LENGTH) errors.code = `Voucher code cannot exceed ${CODE_MAX_LENGTH} characters`;

  const name = String(form.name || "").trim();
  if (!name) errors.name = "Voucher name is required.";
  else if (name.length > NAME_MAX_LENGTH) errors.name = `Voucher name cannot exceed ${NAME_MAX_LENGTH} characters`;

  const discountValueRaw = String(form.discountValue ?? "").trim();
  const discountValue = Number(discountValueRaw);
  if (discountValueRaw === "") {
    errors.discountValue = "Discount value is required.";
  } else if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discountValue = "Discount value must be greater than 0";
  } else if (form.discountType === "percentage" && discountValue > 100) {
    errors.discountValue = "Percentage discount cannot exceed 100";
  }

if (form.appliesTo === "products" && !selectedProductIds.length) {
    errors.productIds = "Please select at least one product.";
  }
  if (form.appliesTo === "categories" && (!form.categoryIds || !form.categoryIds.length)) {
    errors.categoryIds = "Please select at least one category.";
  }

  const usageLimit = String(form.usageLimit ?? "").trim();
  if (usageLimit !== "" && (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 1)) {
    errors.usageLimit = "Total usage limit must be a whole number of at least 1";
  }

  const usageLimitPerCustomer = String(form.usageLimitPerCustomer ?? "").trim();
  if (usageLimitPerCustomer !== "" && (!Number.isInteger(Number(usageLimitPerCustomer)) || Number(usageLimitPerCustomer) < 1)) {
    errors.usageLimitPerCustomer = "Per-customer limit must be a whole number of at least 1";
  }

  if (!String(form.startDate || "").trim()) errors.startDate = "Start date is required.";
  if (!String(form.endDate || "").trim()) errors.endDate = "End date is required.";

  const startsAt = toIso(form.startDate, form.startTime);
  const expiresAt = toIso(form.endDate, form.endTime);
  if (startsAt && expiresAt && new Date(expiresAt).getTime() <= new Date(startsAt).getTime()) {
    errors.endDate = "End date and time must be after the start date and time";
  }

  return errors;
}

// Date *and* clock time, in the admin's own timezone - a date alone reads as
// "expires all day" and then the status flips to Expired at an hour nobody can
// see, which is exactly how expiry looks "wrong".
function formatDateTime(iso) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const date = parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const time = parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

function discountLabel(voucher) {
  const value = Number(voucher.discountValue) || 0;
  const base = voucher.discountType === "fixed" ? money(value) : `${value}%`;
  const cap = voucher.discountType === "percentage" && Number(voucher.maximumDiscountAmount) > 0;
  return cap ? `${base} · max ${money(Number(voucher.maximumDiscountAmount))}` : base;
}

function appliesToLabel(voucher, productNames = {}, categories = []) {
  if (voucher.appliesTo === "products") {
    const ids = (voucher.productIds || []).filter(Boolean);
    const names = ids.map((id) => productNames[String(id)] || String(id)).filter(Boolean);
    if (!names.length) return "Product";
    return `${names.length === 1 ? "Product" : "Products"}: ${names.join(", ")}`;
  }
  if (voucher.appliesTo === "categories") {
    const names = (voucher.categoryIds || [])
      .filter(Boolean)
      .map((id) => categories.find((category) => String(category._id) === String(id))?.name || String(id))
      .filter(Boolean);
    if (!names.length) return "Category";
    return `${names.length === 1 ? "Category" : "Categories"}: ${names.join(", ")}`;
  }
  return "All products";
}

function usageLabel(voucher) {
  const used = Number(voucher.usageCount) || 0;
  const limit = voucher.usageLimit == null ? null : Number(voucher.usageLimit);
  return limit == null ? `${used} / ∞` : `${used} / ${limit}`;
}

// Just the expiry, date and clock time in the admin's own timezone - a start
// date alongside it only made the column wide enough to push Actions off screen.
function periodLabel(voucher) {
  return formatDateTime(voucher.expiresAt) || "No expiry";
}

// Resolves raw product ids (In-gram part numbers) to display names so the view
// modal can label each product instead of only showing its id.
async function fetchProductNames(ids, token) {
  const unique = [...new Set((ids || []).map((id) => String(id).trim()).filter(Boolean))];
  if (!unique.length) return {};
  const data = await getAdminProductsByIds(unique, token);
  const names = {};
  (data.products || []).forEach((product) => {
    names[String(product.ingramPartNumber)] =
      product.name || product.description || String(product.ingramPartNumber);
  });
  return names;
}

export default function AdminVouchersPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [vouchers, setVouchers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  // The results remember which query produced them, so a query that has not
  // come back yet simply reads as "Searching" instead of keeping a flag.
  const [productResults, setProductResults] = useState({ keyword: "", items: [] });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState("");
  // Two tabs, one search box: `view` flips between the enabled table and the
  // disabled card grid, `voucherSearch` filters whichever tab is open.
  const [view, setView] = useState("active");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [statusTarget, setStatusTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [productNames, setProductNames] = useState({});
  // Field errors surface once the field has been blurred, once it holds an
  // obviously bad value, or once Save was pressed - never before the admin
  // has had a chance to type.
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [voucherData, categoryData] = await Promise.all([getAdminVouchers(token), getAdminCategories(token)]);
      const loadedVouchers = voucherData.vouchers || [];
      setVouchers(loadedVouchers);
      setCategories(categoryData.categories || []);
      // Resolve every referenced product id once so the "Applies to" column can
      // show product names instead of a bare count.
      const productIds = [...new Set(loadedVouchers.flatMap((voucher) => (voucher.productIds || []).map((id) => String(id))))];
      try {
        setProductNames(await fetchProductNames(productIds, token));
      } catch {
        setProductNames({});
      }
    } catch (error) {
      toast.error(error.message || "Could not load vouchers");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  // Vouchers are also edited straight in the database, so the list picks those
  // changes up instead of showing a stale record until the next reload.
  useEffect(() => {
    if (!token) return undefined;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load, token]);

  useEffect(() => {
    if (!formOpen || form.appliesTo !== "products" || !token) return undefined;
    const keyword = productSearch.trim();
    const hasCategory = !!form.productCategory;
    // Fetch when a category is selected (even without a long keyword) so the
    // dropdown can show products from that category.
    if (!keyword && !hasCategory) return undefined;
    if (keyword.length < 2 && !hasCategory) return undefined;

    let active = true;
    const timer = window.setTimeout(() => {
      getAdminProducts(
        { keyword: keyword || undefined, limit: 20, category: form.productCategory || undefined },
        token
      )
        .then((data) => {
          if (active) setProductResults({ keyword, items: data.products || [] });
        })
        .catch(() => {
          if (active) setProductResults({ keyword, items: [] });
        });
    }, 50);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.appliesTo, formOpen, productSearch, form.productCategory, token]);

  function change(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  }

  const selectedProductIds = selectedProducts.map((entry) => entry.id);
  const fieldErrors = validateVoucherForm(form, selectedProductIds);
  const hasErrors = Object.keys(fieldErrors).length > 0;

  function touch(key) {
    setTouched((current) => (current[key] ? current : { ...current, [key]: true }));
  }

function err(key, raw = form[key]) {
    const message = fieldErrors[key];
    if (!message) return "";
    // Scope problems sit inside the section they belong to, so they are always
    // shown there; everything else waits for a blur, a bad value, or Save.
    if (key === "productIds" || key === "categoryIds") {
      return showErrors || touched[key] || !!(raw == null || String(raw).trim() === "") ? message : "";
    }
    const empty = raw == null || String(raw).trim() === "";
    return showErrors || touched[key] || !empty ? message : "";
  }

  const errField = (key, raw) => (err(key, raw) ? "border-error shadow-[0_0_0_3px_rgba(244,63,94,0.22)]" : "");

  function reset() {
    setEditingId("");
    setForm(emptyForm);
    setFormError("");
    setTouched({});
    setShowErrors(false);
    setProductSearch("");
    setProductResults({ keyword: "", items: [] });
    setSelectedProducts([]);
  }

  function openAddForm() {
    reset();
    setFormOpen(true);
  }

  function closeForm() {
    reset();
    setFormOpen(false);
  }

  function addProduct(product) {
    const id = String(product?.ingramPartNumber || product?.id || product?.productId || "").trim();
    if (!id) return;
    // Single product selection only
    setSelectedProducts([{ id, name: product.name || product.description || id }]);
    setProductSearch(`${product.name || product.description || id}`);
    setProductResults({ keyword: "", items: [] });
    setProductDropdownOpen(false);
    setForm((current) => ({ ...current, productId: id }));
    setFormError("");
  }

  function removeProduct(id) {
    setSelectedProducts((current) => current.filter((item) => item.id !== id));
    setProductSearch("");
    setProductResults({ keyword: "", items: [] });
    setForm((current) => ({ ...current, productId: "" }));
    setFormError("");
  }

  // Opens the read-only view. Product names are already resolved with the list.
  function openView(voucher) {
    setViewTarget(voucher);
  }

async function edit(voucher) {
    reset();
    setEditingId(voucher._id || voucher.id);
    setForm({
      code: voucher.code || "",
      name: voucher.name || "",
      description: voucher.description || "",
      discountType: voucher.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: voucher.discountValue ?? "",
      appliesTo: voucher.appliesTo || "all",
      // Ensure categoryIds are stored as strings (ObjectId.toString())
      categoryIds: (voucher.categoryIds || []).map((id) => id ? String(id) : ""),
      usageLimit: voucher.usageLimit == null ? "" : String(voucher.usageLimit),
      usageLimitPerCustomer: voucher.usageLimitPerCustomer == null ? "" : String(voucher.usageLimitPerCustomer),
      startDate: isoToInputDate(voucher.startsAt),
      startTime: isoToInputTime(voucher.startsAt),
      endDate: isoToInputDate(voucher.expiresAt),
      endTime: isoToInputTime(voucher.expiresAt),
      isActive: voucher.isActive !== false,
    });
    const ids = (voucher.productIds || []).map((id) => String(id).trim()).filter(Boolean);
    setSelectedProducts(ids.map((id) => ({ id, name: id })));
    setFormOpen(true);

    if (ids.length) {
      try {
        const data = await getAdminProductsByIds(ids, token);
        const names = new Map(
          (data.products || []).map((product) => [
            String(product.ingramPartNumber),
            product.name || product.description || product.ingramPartNumber,
          ])
        );
        setSelectedProducts((current) =>
          current.map((entry) => ({ ...entry, name: names.get(entry.id) || entry.name }))
        );
      } catch {
        // The raw ids are kept as the label, so an unresolvable product can
        // still be saved back without being dropped from the voucher.
      }
    }
  }

function buildPayload() {
    // Every rule lives in validateVoucherForm (and again on the server), so
    // this only converts what the form holds into the payload shape.
    const productIds = form.appliesTo === "products" ? selectedProductIds : [];
    const categoryIds = form.appliesTo === "categories" ? form.categoryIds.filter(Boolean) : [];
    const usageLimit = String(form.usageLimit ?? "").trim();
    const usageLimitPerCustomer = String(form.usageLimitPerCustomer ?? "").trim();

    return {
      code: form.code.trim(),
      name: form.name.trim(),
      description: String(form.description ?? "").trim(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      appliesTo: form.appliesTo,
      productIds,
      categoryIds,
      usageLimit: usageLimit === "" ? "" : Number(usageLimit),
      usageLimitPerCustomer: usageLimitPerCustomer === "" ? "" : Number(usageLimitPerCustomer),
      startsAt: toIso(form.startDate, form.startTime),
      expiresAt: toIso(form.endDate, form.endTime),
      isActive: form.isActive,
    };
  }

async function save(event) {
    event.preventDefault();
    setFormError("");
    setShowErrors(true);

    if (hasErrors) return;

    const payload = buildPayload();

    setSaving(true);
    try {
      if (editingId) await updateAdminVoucher(editingId, payload, token);
      else await createAdminVoucher(payload, token);
      toast.success(editingId ? "Voucher updated" : "Voucher created");
      closeForm();
      await load();
    } catch (error) {
      if (error.code === "DUPLICATE_VOUCHER_CODE" || error.code === "OVERLAP_VOUCHER") {
        setDuplicateMessage(error.message || "A voucher for this scope is already active.");
      } else if (error.status === 400 || error.status === 409 || error.code === "USAGE_LIMIT_TOO_LOW") {
        setFormError(error.message || "Could not save voucher");
      } else {
        toast.error(error.message || "Could not save voucher");
      }
    } finally {
      setSaving(false);
    }
  }

  // Activating/disabling is a two-step action: a click opens the confirmation
  // dialog, only the dialog's confirm button mutates the voucher.
  function requestStatusChange(voucher) {
    setStatusTarget(voucher);
  }

  async function confirmStatusChange() {
    const target = statusTarget;
    if (!target) return;
    const nextActive = target.isActive === false;
    setStatusTarget(null);
    setStatusSavingId(target._id || target.id);
    try {
      const result = await updateAdminVoucherStatus(target._id || target.id, nextActive, token);
      const updated = result.voucher;
      setVouchers((items) =>
        items.map((item) => (item._id === updated._id ? { ...item, ...updated } : item))
      );
      toast.success(nextActive ? "Voucher activated" : "Voucher deactivated");
    } catch (error) {
      toast.error(error.message || "Could not update voucher status");
    } finally {
      setStatusSavingId("");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminVoucher(deleteTarget._id || deleteTarget.id, token);
      toast.success("Voucher deleted");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast.error(error.message || "Could not delete voucher");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "serial", header: "#", accessor: (row) => row.serial, sortable: true, cellClassName: "w-14 font-semibold tabular-nums text-on-surface" },
    {
      key: "code",
      header: "Code",
      accessor: "code",
      sortable: true,
      render: (voucher) => (
        <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
          {voucher.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (voucher) => (
        <div className="max-w-[11rem]">
          <p className="truncate font-semibold text-on-surface">{voucher.name || "-"}</p>
          {voucher.description ? (
            <p className="mt-0.5 truncate text-xs text-on-surface-variant" title={voucher.description}>
              {voucher.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      accessor: discountLabel,
      sortable: true,
      render: (voucher) => (
        <div className="max-w-[9rem]">
          <p className="font-semibold tabular-nums text-on-surface">{discountLabel(voucher)}</p>
        </div>
      ),
    },
    {
      key: "appliesTo",
      header: "Applies to",
      accessor: (voucher) => appliesToLabel(voucher, productNames, categories),
      sortable: true,
      render: (voucher) => {
        const label = appliesToLabel(voucher, productNames, categories);
        return (
          <span className="block max-w-[12rem] truncate text-xs font-semibold text-on-surface-variant" title={label}>
            {label}
          </span>
        );
      },
    },
    {
      key: "usage",
      header: "Usage",
      accessor: (voucher) => Number(voucher.usageCount) || 0,
      sortable: true,
      render: (voucher) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-on-surface" title={voucher.usageLimitPerCustomer ? `Limit per customer: ${voucher.usageLimitPerCustomer}` : undefined}>
          {usageLabel(voucher)}
        </span>
      ),
    },
    {
      key: "period",
      header: "Period",
      accessor: (voucher) => voucher.expiresAt || "",
      sortable: true,
      render: (voucher) => <span className="whitespace-nowrap text-xs text-on-surface-variant">{periodLabel(voucher)}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      // The status badge itself is the toggle, so the Actions menu can stay
      // View / Edit / Delete - clicking asks for confirmation before changing.
      render: (voucher) => (
        <button
          type="button"
          onClick={() => requestStatusChange(voucher)}
          className="inline-flex cursor-pointer rounded-md transition hover:opacity-75"
          title="Click to disable this voucher"
          aria-label={`Disable voucher ${voucher.code}`}
        >
          <AdminStatusBadge>{voucher.status}</AdminStatusBadge>
        </button>
      ),
    },
  ];

  if (loading) return <VoucherSkeleton />;

  // One search box, shared by both tabs - AdminTable's own search is hidden.
  const query = voucherSearch.trim().toLowerCase();
  const matchedVouchers = !query
    ? vouchers
    : vouchers.filter((voucher) =>
        `${voucher.code} ${voucher.name || ""} ${voucher.description || ""} ${voucher.status} ${discountLabel(voucher)} ${appliesToLabel(voucher, productNames, categories)}`
          .toLowerCase()
          .includes(query)
      );
  const activeRows = matchedVouchers
    .filter((voucher) => voucher.isActive !== false)
    .map((voucher, index) => ({ ...voucher, serial: index + 1 }));
  const inactiveVouchers = matchedVouchers.filter((voucher) => voucher.isActive === false);
  // The banner prefers the "fix the fields" nudge while the form is known to
  // be invalid, and falls back to whatever the server said otherwise.
  const banner = showErrors && hasErrors ? "Please fix the highlighted fields before saving." : formError;
  const productQuery = productSearch.trim();
  const showProductResults = productQuery.length >= 2;
  // Results that belong to a different query are treated as pending, which is
  // exactly what the reader sees while the debounced request is still running.
  const matchedProducts = productResults.keyword === productQuery ? productResults.items : [];
  const productsSearching = showProductResults && productResults.keyword !== productQuery;

  return (
    <div className="space-y-6">
      <Card className="overflow-visible p-0">
        <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
          <h1 className="font-heading text-2xl font-semibold text-on-surface">Vouchers</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Create and manage discount codes shown at checkout. Usage is only recorded once an order is paid.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-outline-variant/80">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setView("active")}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${view === "active" ? "border-primary text-primary" : "border-transparent text-on-surface-variant transition hover:text-on-surface"}`}
              >
                Active vouchers
              </button>
              <button
                type="button"
                onClick={() => setView("inactive")}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold ${view === "inactive" ? "border-primary text-primary" : "border-transparent text-on-surface-variant transition hover:text-on-surface"}`}
              >
                Inactive vouchers
              </button>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative min-w-0 sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={voucherSearch}
                  onChange={(event) => setVoucherSearch(event.target.value)}
                  placeholder="Search vouchers"
                  aria-label="Search vouchers"
                  className="h-9 pl-10 shadow-sm"
                />
              </div>
              <Button type="button" onClick={openAddForm} className="h-9 shrink-0 gap-2">
                <Plus className="size-4" />
                Add voucher
              </Button>
            </div>
          </div>
        </div>

        {view === "active" ? (
          <AdminTable
            title="Active vouchers"
            description="Enabled vouchers that checkout will accept."
            columns={columns}
            data={activeRows}
            searchPlaceholder="Search vouchers"
            hideSearch
            pageSize={10}
            disableInitialSort
            rowActions={(voucher) => [
              { label: "View", icon: Eye, onClick: () => openView(voucher) },
              { label: "Edit", icon: Pencil, onClick: () => edit(voucher) },
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => setDeleteTarget(voucher),
                tone: "danger",
                disabled: (Number(voucher.usageCount) || 0) > 0,
                disabledTitle: "A used voucher cannot be deleted. Disable it instead.",
              },
            ]}
          />
        ) : (
          <InactiveVoucherGrid
            vouchers={inactiveVouchers}
            totalCount={vouchers.length}
            search={voucherSearch}
            onStatusChange={requestStatusChange}
            onEdit={edit}
            onDelete={(voucher) => setDeleteTarget(voucher)}
            statusSavingId={statusSavingId}
            productNames={productNames}
            categories={categories}
          />
        )}
      </Card>

      {formOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-inverse-surface/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-lg border border-outline-variant bg-surface shadow-2xl">
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-on-surface">
                    {editingId ? "Edit voucher" : "Add voucher"}
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    The cart is re-checked against these rules every time checkout runs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="grid size-9 shrink-0 place-items-center rounded-md border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                  aria-label="Close voucher form"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={save} className="space-y-4">
                <div className="rounded-lg border border-outline-variant bg-surface-container-low/20 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    Voucher details
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-on-surface">
                      Voucher code <span className="text-rose-500">*</span>
                      <input
                        required
                        value={form.code}
                        onChange={(event) => change("code", event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                        onBlur={() => touch("code")}
                        maxLength={CODE_MAX_LENGTH}
                        placeholder="e.g. SAVE20"
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={Boolean(err("code"))}
                        className={`mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm uppercase ${errField("code")}`}
                      />
                      <FieldError message={err("code")} />
                    </label>
                    <label className="text-sm font-medium text-on-surface">
                      Voucher name <span className="text-rose-500">*</span>
                      <input
                        value={form.name}
                        onChange={(event) => change("name", event.target.value)}
                        onBlur={() => touch("name")}
                        maxLength={NAME_MAX_LENGTH}
                        placeholder="Shown to the customer"
                        aria-invalid={Boolean(err("name"))}
                        className={`mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm ${errField("name")}`}
                      />
                      <FieldError message={err("name")} />
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium text-on-surface">
                        Discount value <span className="text-rose-500">*</span>
                        <div className={`mt-2 flex h-11 overflow-hidden rounded-md border border-outline-variant bg-surface transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${errField("discountValue")}`}>
                          <input
                            required
                            type="number"
                            min="0"
                            max={form.discountType === "percentage" ? "100" : undefined}
                            step={form.discountType === "percentage" ? "1" : "0.01"}
                            inputMode="decimal"
                            value={form.discountValue}
                            onChange={(event) => change("discountValue", event.target.value)}
                            onBlur={() => touch("discountValue")}
                            placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 10.00"}
                            aria-invalid={Boolean(err("discountValue"))}
                            className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-sm outline-none"
                          />
                          <select
                            value={form.discountType}
                            onChange={(event) => change("discountType", event.target.value)}
                            aria-label="Discount type"
                            className="w-28 shrink-0 border-0 border-l border-outline-variant bg-surface-container-low px-2 text-center text-sm font-semibold text-on-surface outline-none"
                          >
                            <option value="percentage">% Percentage</option>
                            <option value="fixed">$ Fixed amount</option>
                          </select>
                        </div>
                        <FieldError message={err("discountValue")} />
                      </label>
                      <label className="text-sm font-medium text-on-surface">
                        Applies to <span className="text-rose-500">*</span>
                        <select
                          value={form.appliesTo}
                          onChange={(event) => {
                            change("appliesTo", event.target.value);
                            setProductSearch("");
                            setProductResults({ keyword: "", items: [] });
                          }}
                          onBlur={() => touch("appliesTo")}
                          aria-invalid={Boolean(err("appliesTo"))}
                          className={`mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3 text-sm ${errField("appliesTo")}`}
                        >
                          <option value="all">All products</option>
                          <option value="products">Specific products</option>
                          <option value="categories">Specific categories</option>
                        </select>
                        <FieldError message={err("appliesTo")} />
                      </label>
                    </div>
                  </div>

                  {form.appliesTo === "products" ? (
                    <div className="mt-4 space-y-5">
                      <label className="block text-sm font-medium text-on-surface">Product category</label>
                      <select
                        value={form.productCategory || ""}
                        onChange={(event) => {
                          setForm((current) => ({ ...current, productCategory: event.target.value }));
                          setProductResults({ keyword: "", items: [] });
                          setProductDropdownOpen(true);
                        }}
                        className="mt-1.5 h-10 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      >
                        <option value="">Choose a category first</option>
                        {categories.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.name}
                          </option>
                        ))}
                      </select>

                      <label className="block text-sm font-medium text-on-surface">
                        Product
                        <div className="relative mt-2">
                          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-on-surface-variant" />
                          <div className={`flex h-11 w-full items-center overflow-hidden rounded-md border border-outline-variant bg-surface pl-10 pr-10 text-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${form.productCategory ? "" : "opacity-60"}`}>
                            {selectedProducts.length ? (
                              selectedProducts.map((entry) => (
                                <span
                                  key={entry.id}
                                  className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                                >
                                  <span className="max-w-56 truncate" title={`${entry.name} · ${entry.id}`}>
                                    {entry.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeProduct(entry.id)}
                                    className="rounded-md transition hover:text-on-surface"
                                    aria-label={`Remove ${entry.name}`}
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <input
                                id="voucher-product-search"
                                value={productSearch}
                                onChange={(event) => setProductSearch(event.target.value)}
                                disabled={!form.productCategory}
                                placeholder={form.productCategory ? "Search product name or SKU..." : "Select a category first"}
                                autoComplete="off"
                                spellCheck={false}
                                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={!form.productCategory || !!selectedProducts.length}
                            onClick={() => setProductDropdownOpen((current) => !current)}
                            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Toggle product options"
                          >
                            <ChevronDown className={`size-4 transition-transform ${productDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                        {productDropdownOpen && form.productCategory ? (
                          <div className="relative z-50 mt-2">
                            <div className="absolute left-0 right-0 top-full max-h-72 overflow-y-auto rounded-md border border-outline-variant bg-surface p-1.5 shadow-2xl ring-1 ring-black/5">
                          {productsSearching ? (
                            <p className="px-3 py-4 text-center text-sm text-on-surface-variant">Searching...</p>
                           ) : matchedProducts.length ? (
                             matchedProducts.map((product) => {
                              const id = String(product.ingramPartNumber || "");
                              const alreadySelected = selectedProducts.some((entry) => entry.id === id);
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  disabled={alreadySelected}
                                  onMouseDown={(event) => event.preventDefault()}
                              onClick={() => { addProduct(product); setProductDropdownOpen(false); }}
                                  className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition enabled:hover:bg-surface-container-low disabled:opacity-50"
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-on-surface">
                                      {product.name || product.description || "Unnamed product"}
                                    </span>
                                    <span className="block truncate text-xs text-on-surface-variant">{id}</span>
                                  </span>
                                  {alreadySelected ? <CheckCircle className="size-4 shrink-0 text-primary" /> : null}
                                </button>
                              );
                            })
                          ) : (form.productCategory && !matchedProducts.length ? (
                            <p className="px-3 py-6 text-center text-sm text-on-surface-variant">Finding products...</p>
                          ) : (
                            <p className="px-3 py-6 text-center text-sm text-on-surface-variant">No matching products found</p>
                          ))}
                        </div>
                      </div>
                    ) : null}

                      <FieldError message={err("productIds")} />
                      </label>
                    </div>
                  ) : null}

                  {form.appliesTo === "categories" ? (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-on-surface">Category</label>
                        <select
                        id="voucher-category-select"
                        value={form.categoryIds?.[0] || ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          setForm((current) => ({ ...current, categoryIds: value ? [value] : [] }));
                          setShowErrors(false);
                          setTouched((t) => ({ ...t, categoryIds: false }));
                        }}
                        className="mt-1.5 h-10 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      >
                        <option value="">Select a category</option>
{categories.map((item) => {
                          const id = String(item._id);
                          return (
                            <option key={id} value={id}>
                              {item.name}
                            </option>
                          );
                        })}
                      </select>
                      <FieldError message={err("categoryIds")} />
                    </div>
                  ) : null}
                </div>

                <div className="rounded-lg border border-outline-variant bg-surface-container-low/20 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                    Limits & schedule
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-on-surface">
                      Total usage limit <span className="font-normal text-on-surface-variant">(optional)</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={form.usageLimit}
                        onChange={(event) => change("usageLimit", event.target.value)}
                        onBlur={() => touch("usageLimit")}
                        placeholder="Unlimited"
                        aria-invalid={Boolean(err("usageLimit"))}
                        className={`mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm ${errField("usageLimit")}`}
                      />
                      <FieldError message={err("usageLimit")} />
                    </label>
                    <label className="text-sm font-medium text-on-surface">
                      Limit per customer <span className="font-normal text-on-surface-variant">(optional)</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={form.usageLimitPerCustomer}
                        onChange={(event) => change("usageLimitPerCustomer", event.target.value)}
                        onBlur={() => touch("usageLimitPerCustomer")}
                        placeholder="Unlimited"
                        aria-invalid={Boolean(err("usageLimitPerCustomer"))}
                        className={`mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3.5 text-sm ${errField("usageLimitPerCustomer")}`}
                      />
                      <FieldError message={err("usageLimitPerCustomer")} />
                    </label>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        Starts at <span className="text-rose-500">*</span>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(event) => change("startDate", event.target.value)}
                          onBlur={() => touch("startDate")}
                          aria-invalid={Boolean(err("startDate"))}
                          className={`h-11 w-full min-w-0 rounded-md border border-outline-variant bg-surface px-3 text-sm ${errField("startDate")}`}
                        />
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(event) => change("startTime", event.target.value)}
                          className="h-11 w-32 shrink-0 rounded-md border border-outline-variant bg-surface px-3 text-sm"
                        />
                      </div>
                      <FieldError message={err("startDate")} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        Expires at <span className="text-rose-500">*</span>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(event) => change("endDate", event.target.value)}
                          onBlur={() => touch("endDate")}
                          aria-invalid={Boolean(err("endDate"))}
                          className={`h-11 w-full min-w-0 rounded-md border border-outline-variant bg-surface px-3 text-sm ${errField("endDate")}`}
                        />
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(event) => change("endTime", event.target.value)}
                          className="h-11 w-32 shrink-0 rounded-md border border-outline-variant bg-surface px-3 text-sm"
                        />
                      </div>
                      <FieldError message={err("endDate")} />
                    </div>
                    <label className="text-sm font-medium text-on-surface">
                      Voucher status
                      <select
                        value={form.isActive ? "active" : "inactive"}
                        onChange={(event) => change("isActive", event.target.value === "active")}
                        className="mt-2 h-11 w-full rounded-md border border-outline-variant bg-surface px-3 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Disabled</option>
                      </select>
                    </label>
                  </div>
                </div>

                {banner ? (
                  <p className="rounded-md border border-error/30 bg-error-container/40 px-3.5 py-2.5 text-sm font-semibold text-error" role="alert">
                    {banner}
                  </p>
                ) : null}

                <div className="flex flex-col-reverse gap-2 border-t border-outline-variant pt-4 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || (showErrors && hasErrors)}
                    className="min-w-40 gap-2"
                  >
                    <Plus className="size-4" />
                    {saving ? "Saving..." : editingId ? "Update voucher" : "Add voucher"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/50 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-voucher-title"
            className="w-full max-w-md overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl"
          >
            <div className="flex items-start gap-4 border-b border-outline-variant px-5 py-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-error-container text-error">
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="delete-voucher-title" className="font-heading text-lg font-semibold text-on-surface">
                  Delete voucher?
                </h2>
                <p className="mt-1 text-sm leading-5 text-on-surface-variant">
                  <strong className="text-on-surface">{deleteTarget.code}</strong> will be permanently removed. This
                  cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="grid size-8 shrink-0 place-items-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-outline-variant px-5 py-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete voucher"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <DuplicateVoucherModal message={duplicateMessage} onClose={() => setDuplicateMessage("")} />

      <StatusVoucherModal
        voucher={statusTarget}
        saving={Boolean(statusSavingId)}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
      />

      <VoucherViewModal
        voucher={viewTarget}
        categories={categories}
        productNames={productNames}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  // A span (not a <p>) so it can sit inside the <label> wrappers used above.
  return <span className="mt-1.5 block text-xs font-semibold text-error">{message}</span>;
}

// Disabled vouchers live in a card grid, so a tap on the status pill asks for
// confirmation before anything is written - same two-step flow as commissions.
function StatusVoucherModal({ voucher, saving, onCancel, onConfirm }) {
  if (!voucher) return null;
  const activating = voucher.isActive === false;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/50 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-voucher-title"
        className="w-full max-w-md overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl"
      >
        <div className="flex items-start gap-4 border-b border-outline-variant px-5 py-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            {activating ? <Check className="size-5" /> : <AlertTriangle className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="status-voucher-title" className="font-heading text-lg font-semibold text-on-surface">
              Are you sure?
            </h2>
            <p className="mt-1 text-sm leading-5 text-on-surface-variant">
              Are you sure you want to {activating ? "activate" : "deactivate"} the voucher{" "}
              <strong className="text-on-surface">{voucher.code}</strong>?
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="grid size-8 shrink-0 place-items-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-outline-variant px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={saving}>
            {saving ? "Updating..." : "OK"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Read-only detail view of one voucher, opened from the row action's View.
function VoucherViewModal({ voucher, categories, productNames, onClose }) {
  if (!voucher) return null;
  const productIds = (voucher.productIds || []).filter(Boolean);
  const categoryNames = (voucher.categoryIds || []).map((id) => {
    const match = categories.find((category) => String(category._id || "") === String(id));
    return match?.name || String(id);
  });

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-inverse-surface/50 px-4 py-6 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-voucher-title"
        className="w-full max-w-lg overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {voucher.code}
              </span>
              <AdminStatusBadge>{voucher.status}</AdminStatusBadge>
            </div>
            <h2 id="view-voucher-title" className="mt-3 break-words font-heading text-xl font-semibold text-on-surface">
              {voucher.name || "-"}
            </h2>
            {voucher.description ? (
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{voucher.description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-md text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Close voucher details"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5 text-sm">
          <VoucherViewRow label="Discount" value={discountLabel(voucher)} />
          <VoucherViewRow label="Applies to" value={appliesToLabel(voucher, productNames, categories)} />
          {productIds.length ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
              <span className="shrink-0 text-on-surface-variant">Products</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {productIds.map((id) => (
                  <span key={id} className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-on-surface">
                    {productNames?.[String(id)] || String(id)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {categoryNames.length ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
              <span className="shrink-0 text-on-surface-variant">Categories</span>
              <div className="flex flex-wrap justify-end gap-1.5">
                {categoryNames.map((name) => (
                  <span key={name} className="rounded-md bg-surface-container-low px-2 py-0.5 text-xs font-semibold text-on-surface">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <VoucherViewRow label="Total usage" value={usageLabel(voucher)} />
          <VoucherViewRow
            label="Limit per customer"
            value={voucher.usageLimitPerCustomer == null ? "Unlimited" : String(voucher.usageLimitPerCustomer)}
          />
          <VoucherViewRow label="Starts" value={formatDateTime(voucher.startsAt) || "No start"} />
          <VoucherViewRow label="Expires" value={formatDateTime(voucher.expiresAt) || "No expiry"} />
          {voucher.createdAt ? <VoucherViewRow label="Created" value={formatDateTime(voucher.createdAt)} /> : null}
        </div>

        <div className="flex justify-end border-t border-outline-variant px-5 py-4">
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function VoucherViewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-on-surface-variant">{label}</span>
      <strong className="break-words text-right font-semibold text-on-surface">{value}</strong>
    </div>
  );
}

function InactiveVoucherGrid({ vouchers, totalCount, search, onStatusChange, onEdit, onDelete, statusSavingId, productNames = {}, categories = [] }) {
  if (!vouchers.length) {
    return (
      <p className="p-7 text-sm text-on-surface-variant">
        {totalCount === 0
          ? "No inactive vouchers."
          : search.trim()
            ? "No vouchers match your search."
            : "Every voucher is active."}
      </p>
    );
  }

  return (
    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
      {vouchers.map((voucher) => {
        const id = voucher._id || voucher.id;
        const saving = statusSavingId === id;

        return (
          <div
            key={id}
            className="flex min-h-56 flex-col justify-between rounded-lg border border-outline-variant bg-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                  {voucher.code}
                </span>
                <AdminStatusBadge>{voucher.status}</AdminStatusBadge>
              </div>
              <h3 className="mt-5 line-clamp-2 font-heading text-lg font-semibold text-on-surface">
                {voucher.name || "-"}
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {discountLabel(voucher)} · {appliesToLabel(voucher, productNames, categories)}
              </p>
              {voucher.description ? (
                <p className="mt-1.5 line-clamp-2 text-xs text-on-surface-variant">{voucher.description}</p>
              ) : null}
              <dl className="mt-3 space-y-1 text-xs text-on-surface-variant">
                {Number(voucher.usageLimit) > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt>Usage limit</dt>
                    <dd className="font-semibold tabular-nums text-on-surface">{voucher.usageLimit}</dd>
                  </div>
                ) : null}
                {Number(voucher.usageLimitPerCustomer) > 0 ? (
                  <div className="flex justify-between gap-3">
                    <dt>Per customer</dt>
                    <dd className="font-semibold tabular-nums text-on-surface">{voucher.usageLimitPerCustomer}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <dt>Period</dt>
                  <dd className="text-right font-semibold text-on-surface">{periodLabel(voucher)}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4">
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(voucher)}
                  className="grid size-9 place-items-center rounded-md border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
                  aria-label="Edit voucher"
                  title="Edit voucher"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(voucher)}
                  disabled={(Number(voucher.usageCount) || 0) > 0 || saving}
                  className="grid size-9 place-items-center rounded-md border border-outline-variant text-on-surface-variant transition hover:border-error/40 hover:bg-error-container/40 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Delete voucher"
                  title={
                    (Number(voucher.usageCount) || 0) > 0
                      ? "A used voucher cannot be deleted. Activate it instead."
                      : "Delete voucher"
                  }
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => onStatusChange(voucher)}
                aria-label="Activate voucher"
                title="Click to activate this voucher"
                className="inline-flex h-9 min-w-[7rem] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border border-slate-300 bg-slate-100 text-center text-sm font-semibold leading-none text-slate-700 shadow-sm transition hover:-translate-y-px hover:bg-slate-200 hover:shadow"
              >
                <CircleOff className="size-3.5 shrink-0" />
                {saving ? "Updating..." : "Inactive"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VoucherSkeleton() {
  const headerWidths = ["w-8", "w-24", "w-32", "w-32", "w-24", "w-20", "w-32", "w-24"];
  const rowWidths = ["w-8", "w-24", "w-40", "w-32", "w-24", "w-20", "w-40", "w-24"];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="w-full max-w-2xl">
              <Skeleton className="h-9 w-48 rounded-md" />
              <Skeleton className="mt-3 h-5 w-full max-w-xl rounded-md" />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <Skeleton className="h-10 w-full sm:w-72" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex min-w-[900px] gap-6 border-b border-outline-variant bg-surface-container-low/40 px-5 py-4 sm:px-7">
            {headerWidths.map((width, index) => (
              <Skeleton key={`header-${index}`} className={`h-3 ${width} shrink-0 rounded-md`} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex min-w-[900px] items-center gap-6 border-b border-outline-variant/60 px-5 py-5 sm:px-7">
              {rowWidths.map((width, cellIndex) => (
                <Skeleton key={cellIndex} className={`h-4 ${width} shrink-0 rounded-md`} />
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function DuplicateVoucherModal({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl">
        <div className="flex items-start gap-4 p-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="size-5" /></span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-on-surface">Voucher already exists</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{message}</p>
          </div>
        </div>
        <div className="flex justify-end border-t border-outline-variant px-6 py-4"><Button type="button" onClick={onClose}>OK</Button></div>
      </div>
    </div>
  );
}
