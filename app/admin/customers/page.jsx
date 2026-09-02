"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Eye, EyeOff, Loader2, Plus, Search, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AdminTable } from "@/components/admin-table";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";
import { AdminCustomersSkeleton } from "@/components/skeletons";
import { createAdminCustomer, getAdminCustomers, updateAdminCustomerStatus } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 20;

const customerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add one uppercase letter").regex(/[0-9]/, "Add one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export default function AdminCustomersPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    let active = true;
    if (!token) return;
    getAdminCustomers({ page, limit: PAGE_SIZE, keyword: debouncedKeyword || undefined }, token)
      .then((data) => {
        if (!active) return;
        setRows(data.customers || []);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setTotalItems(data.pagination?.total ?? 0);
        setError("");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || "Could not load customers.");
        setRows([]);
      });
    return () => {
      active = false;
    };
  }, [token, page, debouncedKeyword, reloadKey]);

  function handleSearchChange(value) {
    setKeyword(value);
    setPage(1);
  }

  async function handleStatusChange(customer, status) {
    const previousRows = rows;
    setRows((current) => current.map((row) => row.id === customer.id ? { ...row, status } : row));

    try {
      await updateAdminCustomerStatus(customer.id, { status }, token);
      toast.success("Customer status updated");
    } catch (statusError) {
      setRows(previousRows);
      toast.error(statusError.message || "Could not update customer status");
    }
  }

  const tableRows = useMemo(() => (
    rows || []
  ).map((row, index) => ({
    ...row,
    serial: (page - 1) * PAGE_SIZE + index + 1,
  })), [rows, page]);

  const columns = [
    { key: "serial", header: "#", sortable: true, accessor: "serial", cellClassName: "font-semibold tabular-nums text-on-surface" },
    { key: "name", header: "Name", sortable: true, accessor: "name", cellClassName: "font-semibold text-on-surface" },
    { key: "email", header: "Email", sortable: true, accessor: "email", cellClassName: "text-on-surface-variant" },
    { key: "phone", header: "Phone", accessor: "phone", cellClassName: "text-on-surface-variant", render: (customer) => customer.phone || "—" },
    { key: "orders", header: "Orders", sortable: true, accessor: "orders", cellClassName: "tabular-nums" },
    { key: "totalSpent", header: "Spent", sortable: true, accessor: "totalSpent", cellClassName: "font-semibold tabular-nums text-on-surface", render: (customer) => money(customer.totalSpent) },
    { key: "joined", header: "Joined", sortable: true, accessor: "joined", render: (customer) => shortDate(customer.joined) },
    { key: "status", header: "Status", accessor: "status", render: (customer) => <CustomerStatusSelect customer={customer} onChange={handleStatusChange} /> },
  ];

  return (
    <div className="space-y-6">
      {rows === null && !error ? (
        <AdminCustomersSkeleton />
      ) : error ? (
        <Card className="p-8 text-center text-body font-regular text-rose-600">{error}</Card>
      ) : (
        <>
          <AdminTable
            title="Customers"
            description="All registered customers with their order history and lifetime spend."
            columns={columns}
            data={tableRows}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            totalItems={totalItems}
            wrapperClassName="customer-table-scroll"
            tableClassName="customer-table-compact"
            toolbar={(
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative min-w-[16rem] flex-1 sm:max-w-md lg:max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input value={keyword} onChange={(event) => handleSearchChange(event.target.value)} placeholder="Search customers" aria-label="Search customers" className="h-10 pl-10 shadow-sm" />
                </div>
                <Button type="button" onClick={() => setModalOpen(true)} className="ml-auto h-10 shrink-0">
                  <Plus className="size-4" /> New customer
                </Button>
              </div>
            )}
            hideSearch
            disableInitialSort
            rowActions={(customer) => [
              { label: `View ${customer.name}`, href: `/admin/customers/${customer.id}`, icon: Eye },
            ]}
          />
          <NewCustomerModal
            open={modalOpen}
            token={token}
            onClose={() => setModalOpen(false)}
            onCreated={() => {
              setModalOpen(false);
              setKeyword("");
              setDebouncedKeyword("");
              setPage(1);
              setReloadKey((value) => value + 1);
            }}
          />
        </>
      )}
    </div>
  );
}

function CustomerStatusSelect({ customer, onChange }) {
  const status = customer.status || "active";

  return (
    <span className="relative inline-flex w-fit items-center">
      <select
        value={status}
        onChange={(event) => onChange(customer, event.target.value)}
        aria-label={`Change status for ${customer.name}`}
        className={`h-7 w-fit max-w-full appearance-none rounded-md border-0 py-0 pl-2 pr-6 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-none outline-none ring-0 transition focus:ring-2 ${status === "active" ? "bg-emerald-100 text-emerald-700 focus:ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-rose-100 text-rose-700 focus:ring-rose-500/20 dark:bg-rose-950/50 dark:text-rose-300"}`}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 size-3 text-current" />
    </span>
  );
}

function NewCustomerModal({ open, token, onClose, onCreated }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  if (!open) return null;

  function closeModal() {
    form.reset();
    onClose();
  }

  async function onSubmit(values) {
    try {
      await createAdminCustomer(
        {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
        token
      );
      toast.success("Customer created successfully");
      form.reset();
      onCreated();
    } catch (createError) {
      toast.error(createError.message || "Could not create customer");
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-2xl dark:bg-surface-container">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/70 p-6">
          <div className="flex items-start gap-4">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-container/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">Add customer</h2>
              <p className="mt-1 text-body-md text-on-surface-variant">Create a login account.</p>
            </div>
          </div>
          <button type="button" onClick={closeModal} className="grid size-9 shrink-0 place-items-center rounded-sm border border-outline-variant text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface" aria-label="Close add customer modal">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 p-6" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" name="name" form={form} autoComplete="name" placeholder="John Doe" />
            <Field label="Email" name="email" type="email" form={form} autoComplete="email" placeholder="customer@example.com" />
          </div>

          <Field label="Phone" name="phone" type="tel" form={form} autoComplete="tel" placeholder="+1 (212) 555-0187" />

          <div className="grid gap-4 md:grid-cols-2">
            <PasswordField label="Password" name="password" form={form} autoComplete="new-password" placeholder="Create password" show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
            <PasswordField label="Confirm password" name="confirmPassword" form={form} autoComplete="new-password" placeholder="Confirm password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button disabled={form.formState.isSubmitting || !token}>
              {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Save customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", form, autoComplete, placeholder }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={Boolean(form.formState.errors[name])} {...form.register(name)} />
      <ErrorText>{form.formState.errors[name]?.message}</ErrorText>
    </div>
  );
}

function PasswordField({ label, name, form, autoComplete, placeholder, show, onToggle }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="pr-10" aria-invalid={Boolean(form.formState.errors[name])} {...form.register(name)} />
        <button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <ErrorText>{form.formState.errors[name]?.message}</ErrorText>
    </div>
  );
}
