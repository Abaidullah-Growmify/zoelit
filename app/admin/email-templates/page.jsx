"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import {
  deleteAdminEmailTemplate,
  getAdminEmailTemplates,
  updateAdminEmailTemplate,
  updateAdminEmailTemplateStatus,
} from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const EMAIL_LOGO_URL = "https://res.cloudinary.com/erspxhnu/image/upload/v1788352762/Zoelit_logo_light_mode.jpg";

const previewValues = {
  name: "Avery Morgan",
  orderNumber: "ZL-10482",
  status: "Active",
  reason: "Your account remains available and no action is required from you.",
  total: "$249.00",
  date: "September 1, 2026",
  resetUrl: "#",
  expiresIn: "15 minutes",
  companyName: "ZoeLit Commerce",
  adminEmail: "ms.ayshrajpoot@gmail.com",
  companyEmail: "support@zoelit.com",
  companyPhone: "+1 (800) 555-0144",
  companyWebsite: "www.zoelit.com",
};

function replaceVariables(text) {
  return String(text || "").replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => previewValues[key] || `{{${key}}}`);
}

function buildPreviewHtml(template) {
  return `<style>body{margin:0;background:#f4f7fb}p{margin:0 0 18px;font-size:14px;line-height:1.7;color:#334155}strong{color:#172033}a{display:inline-block;background:#003fb1;color:#fff!important;text-decoration:none;padding:13px 24px;margin:8px 0;border-radius:5px;font-weight:700}</style><div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:32px 16px;color:#172033;min-height:100%"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #dbe3ef;box-shadow:0 4px 16px rgba(15,23,42,.08)"><div style="background:#fff;padding:20px 32px;border-bottom:1px solid #e2e8f0"><img src="${EMAIL_LOGO_URL}" alt="ZoeLit" style="display:block;width:190px;height:auto;max-height:44px;object-fit:contain" /></div><div style="padding:32px"><div style="font-size:13px;color:#64748b;border-bottom:1px solid #eef2f7;padding-bottom:16px;margin-bottom:22px">Subject: ${replaceVariables(template.subject)}</div>${replaceVariables(template.htmlBody)}</div><div style="border-top:1px solid #e2e8f0;background:#f8fafc;padding:20px 32px;color:#64748b;font-size:12px;line-height:1.7;text-align:left"><strong style="color:#172033;font-size:14px">ZoeLit Commerce</strong><br>Need help? Contact our support team at ${previewValues.adminEmail}.</div></div></div>`;
}

function formatHtmlForEditor(html) {
  return String(html || "")
    .replace(/></g, ">\n<")
    .replace(/(<\/p>)/g, "$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function EmailTemplatesPage() {
  const token = useAdminAuthStore((state) => state.token);
  const [templates, setTemplates] = useState([]);
  const [view, setView] = useState("active");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activationTarget, setActivationTarget] = useState(null);
  const [serialSort, setSerialSort] = useState("asc");
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!token) return;

    getAdminEmailTemplates(search, token)
      .then((data) => setTemplates(data.templates || []))
      .catch((error) => toast.error(error.message));
  }, [token, search]);

  const activeTemplates = templates.filter((template) => template.isActive);
  const visibleTemplates = view === "active" ? activeTemplates : templates;
  const orderedTemplates = serialSort === "asc" ? visibleTemplates : [...visibleTemplates].reverse();
  const previewHtml = useMemo(() => {
    if (!selected) return "";
    return buildPreviewHtml(selected);
  }, [selected]);

  function openEditor(template) {
    setSelected({ ...template, htmlBody: formatHtmlForEditor(template.htmlBody) });
  }

  async function changeTemplateStatus(template, event) {
    event.stopPropagation();
    const isActive = event.target.value === "active";

    try {
      const result = await updateAdminEmailTemplateStatus(template._id, isActive, token);
      setTemplates((items) => items.map((item) => (item._id === result.template._id ? result.template : item)));
      if (selected?._id === result.template._id) setSelected(result.template);
      toast.success(`Template ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...selected,
        variables: String(Array.isArray(selected.variables) ? selected.variables.join(",") : selected.variables)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const result = await updateAdminEmailTemplate(selected._id, payload, token);

      setTemplates((items) => items.map((item) => (item._id === result.template._id ? result.template : item)));
      setSelected(result.template);
      toast.success("Template changes saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!selected || !window.confirm("Delete this template?")) return;

    try {
      await deleteAdminEmailTemplate(selected._id, token);
      setTemplates((items) => items.filter((item) => item._id !== selected._id));
      setSelected(null);
      toast.success("Template deleted");
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function toggleStatus(event) {
    event.stopPropagation();
    if (!selected?._id) return;

    const nextStatus = !selected.isActive;
    setSelected({ ...selected, isActive: nextStatus });

    try {
      const result = await updateAdminEmailTemplateStatus(selected._id, nextStatus, token);
      setSelected(result.template);
      setTemplates((items) => items.map((item) => (item._id === result.template._id ? result.template : item)));
      toast.success(`Template ${nextStatus ? "activated" : "deactivated"}`);
    } catch (error) {
      setSelected({ ...selected, isActive: !nextStatus });
      toast.error(error.message);
    }
  }

  async function activateTemplate() {
    if (!activationTarget?._id) return;

    if (activationTarget.isActive) {
      setActivationTarget(null);
      setView("active");
      toast.info("Template is already active");
      return;
    }

    setActivating(true);

    try {
      const result = await updateAdminEmailTemplateStatus(activationTarget._id, true, token);
      setTemplates((items) => items.map((item) => (item._id === result.template._id ? result.template : item)));
      setActivationTarget(null);
      setView("active");
      toast.success("Template activated and moved to Template tab");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActivating(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Communication</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-on-surface">Template</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Manage the complete email communication library for ZoeLit.</p>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input className="pl-9" placeholder="Search templates" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant/80">
        <button
          type="button"
          onClick={() => {
            setView("active");
            setSelected(null);
          }}
          className={`border-b-2 px-5 py-3 text-sm font-semibold ${view === "active" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
        >
          Template <span className="ml-1 text-xs">({activeTemplates.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setView("all");
            setSelected(null);
          }}
          className={`border-b-2 px-5 py-3 text-sm font-semibold ${view === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}
        >
          All Templates <span className="ml-1 text-xs">({templates.length})</span>
        </button>
      </div>

      {!selected ? (
        <>
          {view === "active" ? (
            <Card className="overflow-hidden p-0">
              <div className="border-b border-outline-variant/80 px-5 py-4">
                <h2 className="font-heading text-lg font-semibold text-on-surface">Active templates</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Only these templates are eligible for email delivery. Use Edit to change content.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                    <tr>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setSerialSort((direction) => (direction === "asc" ? "desc" : "asc"))}
                          className="inline-flex items-center gap-1.5 rounded-lg transition hover:text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10"
                        >
                          #
                          {serialSort === "asc" ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                      </th>
                      <th className="px-5 py-3">Template</th>
                      <th className="px-5 py-3">Template key</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Active</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {orderedTemplates.map((template, index) => (
                      <tr key={template._id} className="hover:bg-surface-container-low/60">
                        <td className="px-5 py-4 font-semibold tabular-nums text-on-surface">{serialSort === "asc" ? index + 1 : activeTemplates.length - index}</td>
                        <td className="px-5 py-4 font-semibold text-on-surface">
                          {template.name}
                          <div className="mt-1 text-xs font-normal text-on-surface-variant">{template.description}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">{template.templateKey}</td>
                        <td className="max-w-xs px-5 py-4 text-on-surface-variant">{template.subject}</td>
                        <td className="px-5 py-4">
                          <select
                            aria-label={`Status for ${template.name}`}
                            value={template.isActive ? "active" : "inactive"}
                            onChange={(event) => changeTemplateStatus(template, event)}
                            className="h-9 rounded-md border border-outline-variant bg-surface px-3 text-sm font-semibold text-on-surface"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button type="button" size="sm" variant="outline" aria-label={`Edit ${template.name}`} onClick={() => openEditor(template)}>
                            <Pencil className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTemplates.map((template, index) => (
                <button
                  type="button"
                  key={template._id}
                  onClick={() => setActivationTarget(template)}
                  className="min-h-44 rounded-lg border border-outline-variant/80 bg-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-surface-container-low text-on-surface-variant">
                      <Mail className="size-5" />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.isActive ? "bg-green-100 text-green-700" : "bg-outline-variant text-on-surface-variant"}`}>
                      {template.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-semibold text-on-surface">{template.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{template.description || template.subject}</p>
                  <p className="mt-3 font-mono text-[10px] text-on-surface-variant">Record #{index + 1}</p>
                  <p className="mt-4 font-mono text-xs text-on-surface-variant">{template.templateKey}</p>
                </button>
              ))}
            </section>
          )}
        </>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-outline-variant/80 px-5 py-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <h2 className="font-heading text-xl font-semibold text-on-surface">{selected.name}</h2>
                <p className="text-xs text-on-surface-variant">Complete email template details</p>
              </div>
            </div>
            <button type="button" aria-pressed={Boolean(selected.isActive)} onClick={toggleStatus} className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <span className={`relative h-6 w-11 rounded-full p-0.5 transition ${selected.isActive ? "bg-primary" : "bg-outline"}`}>
                <span className={`block size-5 rounded-full bg-white shadow transition-transform ${selected.isActive ? "translate-x-5" : "translate-x-0"}`} />
              </span>
              {selected.isActive ? "Active" : "Inactive"}
            </button>
          </div>
          <form onSubmit={save} className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-4">
              <div>
                <Label>Email body HTML code</Label>
                <Textarea
                  className="mt-2 min-h-72 rounded-lg border-outline-variant bg-white p-4 font-mono text-xs leading-6 text-slate-900 shadow-inner selection:bg-primary/20"
                  spellCheck={false}
                  required
                  value={selected.htmlBody}
                  onChange={(event) => setSelected({ ...selected, htmlBody: event.target.value })}
                />
              </div>
              <div>
                <Label>Customer email preview</Label>
                <iframe title="Complete customer email preview" className="mt-2 h-[470px] w-full border border-outline-variant bg-white" srcDoc={previewHtml} />
              </div>
            </div>
            <aside className="space-y-4 border-outline-variant lg:border-l lg:pl-5">
              <div>
                <Label>Template key</Label>
                <Input className="mt-2" value={selected.templateKey} disabled />
              </div>
              <div>
                <Label>Template name</Label>
                <Input className="mt-2" required value={selected.name} onChange={(event) => setSelected({ ...selected, name: event.target.value })} />
              </div>
              <div>
                <Label>Subject</Label>
                <Input className="mt-2" required value={selected.subject} onChange={(event) => setSelected({ ...selected, subject: event.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-2 min-h-24" value={selected.description || ""} onChange={(event) => setSelected({ ...selected, description: event.target.value })} />
              </div>
              <div>
                <Label>Variables</Label>
                <Textarea className="mt-2 min-h-24 font-mono text-xs" value={Array.isArray(selected.variables) ? selected.variables.join(", ") : selected.variables || ""} onChange={(event) => setSelected({ ...selected, variables: event.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                <Button type="button" variant="outline" onClick={remove}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </aside>
          </form>
        </Card>
      )}

      {activationTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <Card className="w-full max-w-md space-y-5 rounded-2xl p-6 shadow-2xl">
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Activate template</p>
              <h2 className="mt-2 font-heading text-lg font-bold leading-7 text-black">
                {activationTarget.isActive ? "This template is already active" : "Are you sure you want to activate this email template?"}
              </h2>
              <p className="mt-3 font-body text-sm leading-6 text-on-surface-variant">
                {activationTarget.isActive ? "It is already available in the Template tab." : `${activationTarget.name} will be available for email delivery.`}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setActivationTarget(null)} disabled={activating}>
                Cancel
              </Button>
              <Button type="button" onClick={activateTemplate} disabled={activating}>
                {activating ? "Activating..." : activationTarget.isActive ? "Go to Template" : "OK, Activate"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </Card>
  );
}
