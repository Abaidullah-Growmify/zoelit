"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Percent,
  RefreshCw,
  RotateCcw,
  Save,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Select, Skeleton } from "@/components/ui";
import { getAdminSettings, updateAdminSettings } from "@/lib/api";
import { TransparentActionLoader } from "@/components/action-feedback";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "BDT", label: "BDT — Bangladeshi Taka" },
  { value: "BRL", label: "BRL — Brazilian Real" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "CZK", label: "CZK — Czech Koruna" },
  { value: "DKK", label: "DKK — Danish Krone" },
  { value: "EGP", label: "EGP — Egyptian Pound" },
  { value: "HKD", label: "HKD — Hong Kong Dollar" },
  { value: "IDR", label: "IDR — Indonesian Rupiah" },
  { value: "ILS", label: "ILS — Israeli Shekel" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "KRW", label: "KRW — South Korean Won" },
  { value: "LKR", label: "LKR — Sri Lankan Rupee" },
  { value: "MAD", label: "MAD — Moroccan Dirham" },
  { value: "MXN", label: "MXN — Mexican Peso" },
  { value: "MYR", label: "MYR — Malaysian Ringgit" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "NOK", label: "NOK — Norwegian Krone" },
  { value: "NZD", label: "NZD — New Zealand Dollar" },
  { value: "PHP", label: "PHP — Philippine Peso" },
  { value: "PLN", label: "PLN — Polish Zloty" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "SEK", label: "SEK — Swedish Krona" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "THB", label: "THB — Thai Baht" },
  { value: "TRY", label: "TRY — Turkish Lira" },
  { value: "TWD", label: "TWD — New Taiwan Dollar" },
  { value: "VND", label: "VND — Vietnamese Dong" },
  { value: "ZAR", label: "ZAR — South African Rand" },
];

const INGRAM_ENVS = [
  { value: "sandbox", label: "Sandbox" },
  { value: "production", label: "Production" },
];

const SECRET_SENTINEL = "__SET__";
const SECRET_KEYS = new Set([
  "ingram.clientId",
  "ingram.clientSecret",
  "ingram.stockWebhookSecret",
  "ingram.orderWebhookSecret",
  "stripe.secretKey",
  "stripe.webhookSecret",
  "email.smtpPassword",
]);

const SECTIONS = [
  {
    id: "store",
    label: "Store info",
    description: "Brand identity and contact details.",
    icon: Store,
    fields: [
      { key: "store.name", label: "Store name", type: "text", placeholder: "ZoeLit Commerce" },
      { key: "store.email", label: "Contact email", type: "email", placeholder: "support@zoelit.com" },
      { key: "store.phone", label: "Support phone", type: "tel", placeholder: "+1 000 000 0000" },
      { key: "store.address", label: "Business address", type: "text", placeholder: "Street, City, Country", span: true },
      { key: "store.currency", label: "Display currency", type: "select", options: CURRENCIES },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    description: "Stripe keys, checkout and webhooks.",
    icon: CreditCard,
    fields: [
      { key: "stripe.secretKey", label: "Secret key", type: "password", placeholder: "sk_live_..." },
      { key: "stripe.webhookSecret", label: "Webhook signing secret", type: "password", placeholder: "whsec_..." },
      { key: "stripe.enabled", label: "Stripe checkout", type: "toggle" },
    ],
  },
  {
    id: "catalog",
    label: "Ingram sync",
    description: "Ingram keys, URLs and sync options.",
    icon: RefreshCw,
    fields: [
      { key: "ingram.env", label: "Environment", type: "select", options: INGRAM_ENVS },
      { key: "ingram.clientId", label: "Client ID", type: "password", placeholder: "Client ID" },
      { key: "ingram.clientSecret", label: "Client secret", type: "password", placeholder: "Client secret" },
      { key: "ingram.customerNumber", label: "Customer number", type: "text", placeholder: "Ingram customer number" },
      { key: "ingram.countryCode", label: "Country code", type: "text", placeholder: "US" },
      { key: "ingram.senderId", label: "Sender ID", type: "text", placeholder: "Sender ID" },
      { key: "ingram.tokenUrl", label: "Token URL", type: "text", placeholder: "https://api.ingrammicro.com/.../token", span: true },
      { key: "ingram.stockWebhookSecret", label: "Stock webhook secret", type: "password", placeholder: "Webhook secret" },
      { key: "ingram.orderWebhookSecret", label: "Order webhook secret", type: "password", placeholder: "Webhook secret" },
      { key: "ingram.autoCategoryDiscovery", label: "Automatic category discovery", type: "toggle" },
      { key: "ingram.syncImagesEnabled", label: "Sync product images", type: "toggle" },
      { key: "ingram.autoSyncEnabled", label: "Automatic price sync", type: "toggle" },
    ],
  },
  {
    id: "commissions",
    label: "Commissions",
    description: "Master switch for commissions.",
    icon: Percent,
    fields: [
      { key: "commission.enabled", label: "Enable commissions", type: "toggle" },
    ],
  },
  {
    id: "email",
    label: "Email",
    description: "SMTP delivery and sender details.",
    icon: Mail,
    fields: [
      { key: "email.smtpHost", label: "SMTP host", type: "text", placeholder: "smtp.gmail.com" },
      { key: "email.smtpPort", label: "SMTP port", type: "text", placeholder: "587" },
      { key: "email.smtpSecure", label: "Use TLS/SSL", type: "toggle" },
      { key: "email.smtpUser", label: "SMTP username", type: "text", placeholder: "noreply@zoelit.com" },
      { key: "email.smtpPassword", label: "SMTP password", type: "password", placeholder: "App password" },
      { key: "email.fromAddress", label: "From address", type: "email", placeholder: "noreply@zoelit.com" },
      { key: "email.senderName", label: "Sender name", type: "text", placeholder: "ZoeLit" },
      { key: "email.supportEmail", label: "Support reply-to", type: "email", placeholder: "help@zoelit.com" },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Which email notifications get sent.",
    icon: Bell,
    fields: [
      { key: "email.templatesEnabled", label: "Email templates", type: "toggle" },
      { key: "email.adminEmails", label: "Send emails to admin", type: "toggle" },
      { key: "email.customerOrderEmails", label: "Send order emails to customers", type: "toggle" },
    ],
  },
];

const DEFAULTS = {
  "store.name": "ZoeLit Commerce",
  "store.currency": "USD",
  "stripe.enabled": true,
  "commission.enabled": true,
  "ingram.autoSyncEnabled": true,
  "ingram.autoCategoryDiscovery": false,
  "ingram.syncImagesEnabled": true,
  "email.senderName": "ZoeLit",
  "email.customerOrderEmails": true,
  "email.templatesEnabled": true,
  "email.adminEmails": true,
  "email.smtpPort": "587",
  "email.smtpSecure": false,
};

function mergeSettings(raw) {
  const source = { ...DEFAULTS, ...raw };
  const settings = {};
  const configured = new Set();
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (SECRET_KEYS.has(key)) {
      if (value === SECRET_SENTINEL) {
        settings[key] = "";
        configured.add(key);
      } else {
        settings[key] = value == null ? "" : value;
      }
    } else {
      settings[key] = value == null ? "" : value;
    }
  }
  return { settings, configured };
}

export default function AdminSettingsPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [activeId, setActiveId] = useState("store");
  const [values, setValues] = useState({});
  const [loaded, setLoaded] = useState({});
  const [configured, setConfigured] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [savedFlash, setSavedFlash] = useState("");
  const [visibleKeys, setVisibleKeys] = useState({});

  const activeSection = SECTIONS.find((section) => section.id === activeId) || SECTIONS[0];

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getAdminSettings(token);
      const merged = mergeSettings(data.settings || {});
      setValues(merged.settings);
      setLoaded(merged.settings);
      setConfigured(merged.configured);
    } catch (error) {
      toast.error(error.message || "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleVisible(key) {
    setVisibleKeys((current) => ({ ...current, [key]: !current[key] }));
  }

  const dirtySections = useMemo(() => {
    const dirty = {};
    for (const section of SECTIONS) {
      dirty[section.id] = section.fields.some((field) => (values[field.key] ?? "") !== (loaded[field.key] ?? ""));
    }
    return dirty;
  }, [values, loaded]);

  const hasDirty = Object.values(dirtySections).some(Boolean);

  function buildPayload(section) {
    const payload = {};
    for (const field of section.fields) {
      const raw = values[field.key];
      if (SECRET_KEYS.has(field.key)) {
        if (raw !== undefined && raw !== null && raw !== "") {
          payload[field.key] = raw;
        } else if (configured.has(field.key)) {
          payload[field.key] = "";
        }
        continue;
      }
      payload[field.key] = field.type === "number" ? Number(raw) || 0 : raw;
    }
    return payload;
  }

  async function persist(payload) {
    if (!token) throw new Error("Admin session expired");
    const data = await updateAdminSettings(payload, token);
    const merged = mergeSettings(data.settings || {});
    setValues(merged.settings);
    setLoaded(merged.settings);
    setConfigured(merged.configured);
    return data;
  }

  async function saveSection() {
    setSaving(activeSection.id);
    try {
      await persist(buildPayload(activeSection));
      setSavedFlash(activeSection.id);
      setTimeout(() => setSavedFlash(""), 2200);
      toast.success(`${activeSection.label} saved`);
    } catch (error) {
      toast.error(error.message || `Could not save ${activeSection.label}`);
    } finally {
      setSaving("");
    }
  }

  async function saveAll() {
    const payload = {};
    for (const section of SECTIONS) Object.assign(payload, buildPayload(section));
    setSaving("all");
    try {
      await persist(payload);
      toast.success("All settings saved");
    } catch (error) {
      toast.error(error.message || "Could not save settings");
    } finally {
      setSaving("");
    }
  }

  function revertSection() {
    const next = { ...values };
    for (const field of activeSection.fields) next[field.key] = loaded[field.key] ?? "";
    setValues(next);
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <Card className="overflow-visible p-0">
      <TransparentActionLoader open={Boolean(saving)} />
      <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-on-surface">Settings</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">Manage store, payment, catalog and email preferences for ZoeLit.</p>
          </div>
          <div className="shrink-0">
            <Button onClick={saveAll} disabled={loading || saving || !hasDirty}>
              {saving === "all" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving === "all" ? "Saving..." : "Save all changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <aside className="flex w-full shrink-0 flex-col gap-1 border-outline-variant px-5 py-6 sm:px-7 lg:w-64 lg:border-r">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveId(section.id)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm font-semibold transition",
                activeId === section.id ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
            >
              <span className="flex items-center gap-3">
                <section.icon className={cn("size-4", activeId === section.id ? "text-white" : "text-on-surface-variant")} />
                <span className="truncate">{section.label}</span>
              </span>
              {dirtySections[section.id] ? (
                <span className={cn("size-2 rounded-full", activeId === section.id ? "bg-white/80" : "bg-primary")} title="Unsaved changes" />
              ) : null}
            </button>
          ))}
        </aside>

        <div className="min-w-0 flex-1 px-5 py-6 sm:px-7">
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <activeSection.icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-xl font-semibold tracking-tight text-on-surface">{activeSection.label}</h2>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-on-surface-variant">{activeSection.description}</p>
                    </div>
                  </div>
                  {dirtySections[activeSection.id] ? (
                    <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Unsaved changes
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  {activeSection.fields.map((field) =>
                    field.type === "toggle" ? (
                      <div key={field.key} className="sm:col-span-2">
                        <ToggleRow field={field} value={values[field.key]} onChange={(value) => setValue(field.key, value)} />
                      </div>
                    ) : (
                      <div key={field.key} className={field.span ? "sm:col-span-2" : ""}>
                        <FieldLabel field={field} />
                        <div className="mt-2">
                          <FieldControl field={field} value={values[field.key]} onChange={(value) => setValue(field.key, value)} visible={Boolean(visibleKeys[field.key])} onToggleVisible={() => toggleVisible(field.key)} configured={configured.has(field.key)} />
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center">
                  {dirtySections[activeSection.id] ? (
                    <button type="button" onClick={revertSection} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface">
                      <RotateCcw className="size-4" />
                      Revert changes
                    </button>
                  ) : (
                    <p className="text-sm text-on-surface-variant">No unsaved changes in this section.</p>
                  )}
                  <div className="flex items-center justify-end gap-3">
                    {savedFlash === activeSection.id ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <CheckCircle2 className="size-4" />
                        Saved
                      </span>
                    ) : null}
                    <Button onClick={saveSection} disabled={saving || !dirtySections[activeSection.id]} className="min-w-36">
                      {saving === activeSection.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      {saving === activeSection.id ? "Saving..." : "Save section"}
                    </Button>
                  </div>
                </div>
              </>
          </div>
        </div>
    </Card>
  );
}

function FieldLabel({ field }) {
  return <Label>{field.label}</Label>;
}

function ToggleRow({ field, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low/40 px-4 py-3.5">
      <div className="min-w-0">
        <Label>{field.label}</Label>
        {field.hint ? <p className="mt-1 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
      </div>
      <div className="shrink-0 pt-0.5">
        <Toggle checked={Boolean(value)} onChange={onChange} />
      </div>
    </div>
  );
}

function FieldControl({ field, value, onChange, visible, onToggleVisible, configured }) {
  if (field.type === "select") {
    return (
      <div>
        <div className="w-full sm:w-56">
          <Select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
            {(field.options || []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        {field.hint ? <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <Input type="number" min={field.min} max={field.max} value={value ?? ""} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className="sm:w-56" />
        {field.hint ? <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "password") {
    return (
      <div>
        <div className="relative">
          <Input type={visible ? "text" : "password"} value={value ?? ""} placeholder={configured ? "Configured — leave blank to keep" : field.placeholder} onChange={(event) => onChange(event.target.value)} className="pr-10" />
          <button type="button" tabIndex={-1} onClick={onToggleVisible} className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition hover:text-primary" aria-label={visible ? `Hide ${field.label}` : `Show ${field.label}`}>
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {field.hint ? <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <textarea value={value ?? ""} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className="min-h-28 w-full rounded-md border border-outline-variant bg-surface px-3.5 py-3 text-sm text-on-surface transition placeholder:text-on-surface-variant/80 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low" />
        {field.hint ? <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <Input type={field.type || "text"} value={value ?? ""} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} />
      {field.hint ? <p className="mt-1.5 text-xs leading-5 text-on-surface-variant">{field.hint}</p> : null}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        checked ? "bg-primary" : "bg-outline-variant"
      )}
    >
      <span className={cn("inline-block size-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

function SettingsSkeleton() {
  return (
    <Card className="overflow-visible p-0">
      <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="mt-2 h-4 w-[30rem] max-w-full rounded-md" />
          </div>
          <div className="shrink-0">
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <aside className="w-full shrink-0 gap-1 px-5 py-6 sm:px-7 lg:w-64 lg:border-r lg:border-outline-variant">
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </aside>
        <div className="min-w-0 flex-1 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Skeleton className="size-11 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </div>
            <div className="sm:col-span-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </div>
            <div className="sm:col-span-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </div>
            <div className="sm:col-span-2">
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </div>
          </div>
          <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}