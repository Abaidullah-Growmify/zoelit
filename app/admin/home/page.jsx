"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Layers, Loader2, Plus, RotateCcw, Save, Sparkles, Tags, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input, Label, Skeleton, Textarea } from "@/components/ui";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { PriorityToggle } from "@/components/priority-toggle";
import { ProductPicker } from "@/components/home-manager/product-picker";
import { HeroProductPicker } from "@/components/home-manager/hero-product-picker";
import { CategoryPicker } from "@/components/home-manager/category-picker";
import { getAdminCategories, getAdminHomepage, getAdminProducts, getAdminProductsByIds, updateAdminHomepage } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { cn } from "@/lib/utils";

const MIN_SKELETON_MS = 650;

const DEFAULTS = {
  hero: {
    enabled: true,
    eyebrow: "ZoeLit · Thoughtfully chosen",
    title: "Better technology, thoughtfully chosen for you.",
    lead: "Explore a considered collection of electronics, accessories, and everyday essentials selected for quality, value, and ease.",
    mode: "manual",
    productIds: [],
  },
  categories: { enabled: true, mode: "manual", categoryNames: [] },
  bestDeals: { enabled: true, eyebrow: "Top Sale", title: "Best deals this week", mode: "manual", productIds: [] },
  newArrivals: { enabled: true, eyebrow: "New Arrivals", title: "Fresh picks just landed", mode: "manual", productIds: [] },
  trending: { enabled: true, eyebrow: "Trending", title: "Popular right now", mode: "manual", productIds: [] },
  customSections: [],
};

const FIXED_META = [
  { id: "bestDeals", icon: Flame, label: "Best deals", description: "First section on the home page (3–4 products).", countKey: "bestDeals" },
  { id: "newArrivals", icon: Sparkles, label: "New arrivals", description: "Newest products section (3–4 products).", countKey: "newArrivals" },
  { id: "trending", icon: TrendingUp, label: "Trending", description: "Popular picks section (3–4 products).", countKey: "trending" },
];

const SECTION_META = {
  hero: { icon: Sparkles, label: "Hero section", description: "Headline, intro text and hero cards (3 cards)." },
  categories: { icon: Tags, label: "Shop by category", description: "Category tiles below the hero (3–6)." },
};

const LIMITS = {
  hero: { max: 3, label: "hero products" },
  categories: { max: 6, label: "categories" },
  bestDeals: { max: 4, label: "products" },
  newArrivals: { max: 4, label: "products" },
  trending: { max: 4, label: "products" },
};

function sectionMax(id) {
  if (id.startsWith("custom:")) return 6;
  const limit = LIMITS[id];
  return limit ? limit.max : 0;
}

function sectionLabel(id) {
  if (id.startsWith("custom:")) return "products";
  const limit = LIMITS[id];
  return limit ? limit.label : "";
}

function sectionById(homepage, id) {
  if (!homepage) return {};
  if (id.startsWith("custom:")) {
    const index = Number(id.split(":")[1]);
    return (homepage.customSections || [])[index] || {};
  }
  if (id === "categories") return homepage.categories || {};
  return homepage[id] || {};
}

function sectionCount(homepage, id) {
  if (!homepage) return 0;
  if (id.startsWith("custom:")) {
    const index = Number(id.split(":")[1]);
    return (homepage.customSections || [])[index]?.productIds?.length || 0;
  }
  if (id === "categories") return homepage.categories.categoryNames.length;
  return homepage[id].productIds.length;
}

// A manual section with picks must reach the minimum (so the storefront never
// renders a short row) and never exceed the section limit. An empty manual
// section is allowed — the storefront then shows catalog products for it, the
// same way it behaved before picks were configurable.
function sectionError(homepage, id, limits) {
  const section = sectionById(homepage, id);
  if (section.mode === "auto") return "";
  const count = sectionCount(homepage, id);
  if (count === 0) return "";
  const min = id === "categories" ? limits.minCategories : limits.minPicks;
  const max = sectionMax(id);
  if (count < min) return `Pick at least ${min} ${sectionLabel(id)} — ${min - count} more needed to save.`;
  if (max > 0 && count > max) return `Remove ${count - max} ${sectionLabel(id)} — ${max} is the maximum.`;
  return "";
}

function normalizePickKey(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function pickedIds(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => (typeof item === "string" ? item : item?.productId))
    .map((id) => String(id || "").trim())
    .filter(Boolean);
}

// Drops saved picks that no longer exist (categories removed from the catalog,
// products deleted from the database) so the pickers only ever show items the
// storefront can actually render.
async function sanitizePicks(homepage, dbCategories, token) {
  const cleaned = { ...homepage };
  let removed = 0;

  const categoryByKey = new Map(dbCategories.map((category) => [normalizePickKey(category.name), category.name]));
  const savedCategories = Array.isArray(cleaned.categories?.categoryNames) ? cleaned.categories.categoryNames : [];
  const keptCategories = [];
  for (const name of savedCategories) {
    const canonical = categoryByKey.get(normalizePickKey(name));
    if (canonical && !keptCategories.includes(canonical)) keptCategories.push(canonical);
    else if (!canonical) removed += 1;
  }
  cleaned.categories = { ...cleaned.categories, categoryNames: keptCategories };

  const allIds = [
    ...pickedIds(cleaned.hero?.productIds),
    ...pickedIds(cleaned.bestDeals?.productIds),
    ...pickedIds(cleaned.newArrivals?.productIds),
    ...pickedIds(cleaned.trending?.productIds),
    ...cleaned.customSections.flatMap((section) => pickedIds(section?.productIds)),
  ];

  let existing = null;
  try {
    const data = await getAdminProductsByIds([...new Set(allIds)], token);
    existing = new Set((data.products || []).map((product) => product.ingramPartNumber));
  } catch {
    // The catalog check failed — keep the picks untouched instead of clearing
    // them on a transient error.
    return { homepage: cleaned, removed };
  }

  if (!allIds.length) return { homepage: cleaned, removed };

  const keepId = (id) => {
    if (existing.has(id)) return true;
    removed += 1;
    return false;
  };

  cleaned.hero = { ...cleaned.hero, productIds: (Array.isArray(cleaned.hero?.productIds) ? cleaned.hero.productIds : []).filter((item) => keepId(String(item?.productId || item || ""))) };
  for (const key of ["bestDeals", "newArrivals", "trending"]) {
    cleaned[key] = { ...cleaned[key], productIds: (Array.isArray(cleaned[key]?.productIds) ? cleaned[key].productIds : []).filter((id) => keepId(String(id))) };
  }
  cleaned.customSections = (Array.isArray(cleaned.customSections) ? cleaned.customSections : []).map((section) => ({
    ...section,
    productIds: (Array.isArray(section?.productIds) ? section.productIds : []).filter((id) => keepId(String(id))),
  }));

  return { homepage: cleaned, removed };
}

// Plain-language toggle name + helper text for each section, so a non-technical
// admin understands what the switch does without reading implementation terms.
function autoToggleMeta(activeId, isAuto) {
  if (activeId === "hero") {
    return {
      name: "Fill cards automatically",
      hint: isAuto ? "ON: hero cards are chosen by the system. Your text above stays as written." : "OFF: choose the hero cards yourself below. Your text stays as written.",
      noticeTitle: "Hero cards are chosen automatically",
      noticeText: "The cards fill with random in-stock products, and the text you wrote above stays exactly the same. Turn this off to pick the cards yourself.",
    };
  }
  if (activeId === "categories") {
    return {
      name: "Fill categories automatically",
      hint: isAuto ? "ON: the top categories are shown by the system." : "OFF: choose the categories yourself below.",
      noticeTitle: "Top categories are shown automatically",
      noticeText: "The most popular categories are shown by the system. Turn this off to choose the categories yourself.",
    };
  }
  const bySection = {
    bestDeals: { name: "Fill deals automatically", noticeTitle: "Deals are chosen automatically" },
    newArrivals: { name: "Fill newest products automatically", noticeTitle: "Newest products are shown automatically" },
    trending: { name: "Fill trending products automatically", noticeTitle: "Trending products are chosen automatically" },
  };
  const meta = activeId.startsWith("custom:")
    ? { name: "Fill products automatically", noticeTitle: "Products are chosen automatically" }
    : bySection[activeId] || { name: "Fill products automatically", noticeTitle: "Products are chosen automatically" };
  return {
    ...meta,
    hint: isAuto ? `ON: ${meta.noticeTitle.toLowerCase()}.` : "OFF: choose the products yourself below.",
    noticeText: "Products are filled from in-stock items automatically. Turn this off to pick them yourself.",
  };
}

export default function AdminHomePage() {
  const token = useAdminAuthStore((state) => state.token);
  const [homepage, setHomepage] = useState(null);
  const [saved, setSaved] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [activeId, setActiveId] = useState("hero");
  const [savedFlash, setSavedFlash] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const load = useCallback(() => {
    let active = true;
    if (!token) return () => { active = false; };
    Promise.all([
      getAdminHomepage(token),
      getAdminCategories(token),
      getAdminProducts({ page: 1, limit: 1 }, token),
      new Promise((resolve) => window.setTimeout(resolve, MIN_SKELETON_MS)),
    ])
      .then(async ([data, categoryData, productData]) => {
        if (!active) return;
        const merged = { ...DEFAULTS, ...data.homepage, customSections: data.homepage.customSections || [] };
        const dbCategories = (categoryData.categories || []).filter((category) => category && category.name);
        const { homepage: cleaned, removed } = await sanitizePicks(merged, dbCategories, token);
        if (!active) return;
        setHomepage(cleaned);
        setSaved(cleaned);
        setCategories(dbCategories);
        setProductTotal(Number(productData?.pagination?.total) || 0);
        setLoading(false);
        if (removed > 0) {
          toast.info(`Removed ${removed} saved ${removed === 1 ? "pick" : "picks"} that no longer exist in the catalog.`);
        }
      })
      .catch((error) => {
        if (!active) return;
        setLoading(false);
        toast.error(error.message || "Failed to load homepage settings");
      });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const dirty = useMemo(() => {
    if (!homepage || !saved) return {};
    const byKey = (key) => JSON.stringify(homepage[key] || {}) !== JSON.stringify(saved[key] || {});
    return {
      hero: byKey("hero"),
      categories: byKey("categories"),
      bestDeals: byKey("bestDeals"),
      newArrivals: byKey("newArrivals"),
      trending: byKey("trending"),
      custom: JSON.stringify(homepage.customSections || []) !== JSON.stringify(saved.customSections || []),
    };
  }, [homepage, saved]);

  const hasDirty = Object.values(dirty).some(Boolean);
  const isSectionDirty = (id) => (id.startsWith("custom:") ? dirty.custom : Boolean(dirty[id]));

  // Minimum picks for a partially filled section, capped by what the catalog
  // actually contains so a small catalog can never block saving.
  const limits = useMemo(
    () => ({
      minPicks: Math.min(3, Math.max(1, productTotal || 3)),
      minCategories: Math.min(3, Math.max(1, categories.length || 3)),
    }),
    [productTotal, categories]
  );

  const patchSection = (key, patch) => {
    setHomepage((previous) => (previous ? { ...previous, [key]: { ...previous[key], ...patch } } : previous));
  };

  const patchCustom = (index, patch) => {
    setHomepage((previous) => {
      if (!previous) return previous;
      const customSections = (previous.customSections || []).map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section
      );
      return { ...previous, customSections };
    });
  };

  const addSection = () => {
    setHomepage((previous) => {
      if (!previous) return previous;
      const customSections = [...(previous.customSections || []), { enabled: true, eyebrow: "Exclusive", title: "New section", mode: "manual", productIds: [] }];
      selectSection(`custom:${customSections.length - 1}`);
      return { ...previous, customSections };
    });
  };

  const removeSection = useCallback((index) => {
    setHomepage((previous) => {
      if (!previous) return previous;
      const customSections = (previous.customSections || []).filter((_, sectionIndex) => sectionIndex !== index);
      if (activeId === `custom:${index}`) selectSection("bestDeals");
      return { ...previous, customSections };
    });
  }, [activeId]);

  const persist = async () => {
    if (!token || !homepage) throw new Error("Admin session expired");
    const data = await updateAdminHomepage(homepage, token);
    const merged = { ...DEFAULTS, ...data.homepage, customSections: data.homepage.customSections || [] };
    setHomepage(merged);
    setSaved(merged);
    return merged;
  };

  const saveAll = async () => {
    let error = sectionError(homepage, "hero", limits)
      || sectionError(homepage, "categories", limits)
      || sectionError(homepage, "bestDeals", limits)
      || sectionError(homepage, "newArrivals", limits)
      || sectionError(homepage, "trending", limits);
    if (!error && homepage) {
      for (let index = 0; index < (homepage.customSections || []).length && !error; index += 1) {
        error = sectionError(homepage, `custom:${index}`, limits);
      }
    }
    if (error) {
      toast.error(error);
      return;
    }
    setSaving("all");
    try {
      await persist();
      toast.success("Home page saved");
    } catch (saveError) {
      toast.error(saveError.message || "Could not save home page");
    } finally {
      setSaving("");
    }
  };

  const saveSection = async () => {
    const error = sectionError(homepage, activeId, limits);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(activeId);
    try {
      await persist();
      setSavedFlash(activeId);
      setTimeout(() => setSavedFlash(""), 2200);
      toast.success("Section saved");
    } catch (saveError) {
      toast.error(saveError.message || "Could not save section");
    } finally {
      setSaving("");
    }
  };

  const revertSection = () => {
    if (!homepage || !saved) return;
    if (activeId.startsWith("custom:")) {
      setHomepage({ ...saved, customSections: (saved.customSections || []).map((section) => ({ ...section })) });
    } else {
      setHomepage({ ...saved, [activeId]: { ...(saved[activeId] || {}) } });
    }
  };

  const selectSection = (id) => {
    setActiveId(id);
    setSwitching(true);
    window.setTimeout(() => setSwitching(false), 400);
  };

  const restoreDefaults = () => {
    setHomepage(JSON.parse(JSON.stringify(DEFAULTS)));
    setResetOpen(false);
    toast.info("Restored defaults. Press Save to apply.");
  };

  const navItems = useMemo(() => {
    if (!homepage) return [];
    const items = [
      {
        id: "hero",
        icon: Sparkles,
        label: "Hero section",
      },
      {
        id: "categories",
        icon: Tags,
        label: "Shop by category",
      },
      ...FIXED_META.map(({ id, icon, label }) => ({
        id,
        icon,
        label,
      })),
      ...(homepage.customSections || []).map((section, index) => ({
        id: `custom:${index}`,
        icon: Layers,
        label: section.title || `Section ${index + 1}`,
        onRemove: () => removeSection(index),
      })),
    ];
    return items;
  }, [homepage, removeSection]);

  const activeItem = navItems.find((item) => item.id === activeId);
  const activeMeta = SECTION_META[activeId];

  if (loading) {
    return (
      <Card className="overflow-visible p-0">
        <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Skeleton className="h-8 w-72 max-w-full rounded-md" />
              <Skeleton className="mt-2 h-4 w-[34rem] max-w-full rounded-md" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-10 w-36 rounded-md" />
              <Skeleton className="h-10 w-44 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <aside className="w-full shrink-0 gap-1 px-5 py-6 sm:px-7 lg:w-64 lg:border-r lg:border-outline-variant">
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-md" />
              ))}
            </div>
            <Skeleton className="mt-3 h-10 w-full rounded-md" />
          </aside>
          <div className="min-w-0 flex-1 px-5 py-6 sm:px-7">
            <div className="flex items-start gap-3">
              <Skeleton className="size-11 rounded-lg" />
              <div>
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="mt-2 h-4 w-[26rem] max-w-full rounded-md" />
              </div>
            </div>
            <div className="mt-7 space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-28 w-full rounded-md sm:col-span-2" />
                <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
                <Skeleton className="h-10 w-full rounded-md sm:col-span-2" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-visible p-0">
      <TransparentActionLoader open={switching || Boolean(saving)} />
      <div className="border-b border-outline-variant bg-surface-container-low/40 px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-on-surface">Homepage customization</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-on-surface-variant">Control what customers see on the home page: hero message, section picks and categories. Any change applies immediately after saving.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(true)} disabled={loading || saving}>
              <RotateCcw className="size-4" />
              Restore defaults
            </Button>
            <Button onClick={saveAll} disabled={loading || saving || !hasDirty}>
              {saving === "all" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving === "all" ? "Saving..." : "Save all changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <aside className="flex w-full shrink-0 flex-col gap-1 border-outline-variant px-5 py-6 sm:px-7 lg:w-64 lg:border-r">
          {navItems.map((item) => {
            const active = item.id === activeId;
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-3.5 py-2.5 text-left text-sm font-semibold transition",
                    active ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                    item.onRemove && "pr-10"
                  )}
                  aria-pressed={active}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <item.icon className={cn("size-4 shrink-0", active ? "text-white" : "text-on-surface-variant")} />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {isSectionDirty(item.id) ? (
                    <span className={cn("size-2 shrink-0 rounded-full", active ? "bg-white/80" : "bg-primary")} title="Unsaved changes" />
                  ) : null}
                </button>
                {item.onRemove ? (
                  <button
                    type="button"
                    onClick={item.onRemove}
                    className={cn(
                      "absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 transition",
                      active ? "text-white/80 hover:bg-white/15 hover:text-white" : "text-on-surface-variant hover:bg-error-container hover:text-error"
                    )}
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
          <button
            type="button"
            onClick={addSection}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant text-sm font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" /> Add new section
          </button>
        </aside>

        <div className="min-w-0 flex-1 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <activeItem.icon className="size-5" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold tracking-tight text-on-surface">{activeItem.label}</h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-on-surface-variant">{activeMeta ? activeMeta.description : activeItem.label}</p>
              </div>
            </div>
            {isSectionDirty(activeId) ? (
              <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            ) : null}
          </div>

          <div className="mt-7">
            {switching ? <EditorSkeleton activeId={activeId} /> : (
              <EditorBody
                activeId={activeId}
                homepage={homepage}
                categories={categories}
                limits={limits}
                token={token}
                patchSection={patchSection}
                patchCustom={patchCustom}
              />
            )}
          </div>

          <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-outline-variant pt-5 sm:flex-row sm:items-center">
            {isSectionDirty(activeId) ? (
              <button type="button" onClick={revertSection} className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface">
                <RotateCcw className="size-4" />
                Revert changes
              </button>
            ) : (
              <p className="text-sm text-on-surface-variant">No unsaved changes in this section.</p>
            )}
            <div className="flex items-center justify-end gap-3">
              {savedFlash === activeId ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  Saved
                </span>
              ) : null}
              <Button onClick={saveSection} disabled={saving || !isSectionDirty(activeId)} className="min-w-36">
                {saving === activeId ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving === activeId ? "Saving..." : "Save section"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={resetOpen}
        title="Restore defaults?"
        message="This replaces all home page settings (text and picks) with the default values. Your products and categories are not changed."
        confirmLabel="Restore"
        loading={false}
        onConfirm={restoreDefaults}
        onCancel={() => setResetOpen(false)}
      />
    </Card>
  );
}

function EditorBody({ activeId, homepage, categories, limits, token, patchSection, patchCustom }) {
  const customIndex = activeId.startsWith("custom:") ? Number(activeId.split(":")[1]) : -1;
  const isCustom = customIndex >= 0;

  if (activeId === "hero") {
    const heroProducts = homepage.hero.productIds || [];
    const autoMode = homepage.hero.mode === "auto";
    const autoMeta = autoToggleMeta("hero", autoMode);

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToggleRow
            label={autoMeta.name}
            hint={autoMeta.hint}
            checked={autoMode}
            onChange={(value) => patchSection("hero", { mode: value ? "auto" : "manual" })}
          />
        </div>
        <Field label="Eyebrow">
          <Input value={homepage.hero.eyebrow} onChange={(event) => patchSection("hero", { eyebrow: event.target.value })} placeholder="ZoeLit · Thoughtfully chosen" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Headline">
            <Textarea rows={2} value={homepage.hero.title} onChange={(event) => patchSection("hero", { title: event.target.value })} placeholder="Better technology, thoughtfully chosen for you." />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Intro text">
            <Textarea rows={3} value={homepage.hero.lead} onChange={(event) => patchSection("hero", { lead: event.target.value })} placeholder="Supporting text shown under the headline." />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <ToggleRow label="Show hero section" hint={homepage.hero.enabled ? "Visible on the storefront" : "Hidden from the storefront"} checked={homepage.hero.enabled} onChange={(value) => patchSection("hero", { enabled: value })} />
        </div>
        {autoMode ? (
          <div className="sm:col-span-2">
            <div className="flex items-start gap-3 rounded-md border border-primary/25 bg-primary/5 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">{autoMeta.noticeTitle}</p>
                <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{autoMeta.noticeText}</p>
              </div>
              <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <span className="size-2.5 rounded-full bg-primary" />
              </span>
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <Field label="Hero products" hint={<RequirementHint count={heroProducts.length} max={3} min={limits.minPicks} />}>
              <HeroProductPicker
                token={token}
                products={heroProducts}
                onChange={(products) => patchSection("hero", { productIds: products })}
                max={3}
              />
            </Field>
          </div>
        )}
      </div>
    );
  }

  if (activeId === "categories") {
    const autoMode = homepage.categories.mode === "auto";
    const autoMeta = autoToggleMeta("categories", autoMode);

    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToggleRow
            label={autoMeta.name}
            hint={autoMeta.hint}
            checked={autoMode}
            onChange={(value) => patchSection("categories", { mode: value ? "auto" : "manual" })}
          />
        </div>
        <div className="sm:col-span-2">
          <ToggleRow label="Show category tiles" hint={homepage.categories.enabled ? "Visible on the storefront" : "Hidden from the storefront"} checked={homepage.categories.enabled} onChange={(value) => patchSection("categories", { enabled: value })} />
        </div>
        {autoMode ? (
          <div className="sm:col-span-2">
            <div className="flex items-start gap-3 rounded-md border border-primary/25 bg-primary/5 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface">{autoMeta.noticeTitle}</p>
                <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{autoMeta.noticeText}</p>
              </div>
              <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <span className="size-2.5 rounded-full bg-primary" />
              </span>
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2">
            <Field label="Category tiles" hint={<RequirementHint count={homepage.categories.categoryNames.length} max={6} min={limits.minCategories} empty="Empty — the top categories are shown automatically while this section is on." />}>
              <CategoryPicker categories={categories} value={homepage.categories.categoryNames} onChange={(value) => patchSection("categories", { categoryNames: value })} max={6} />
            </Field>
          </div>
        )}
      </div>
    );
  }

  const section = isCustom ? homepage.customSections[customIndex] : homepage[activeId];
  const setSection = (patch) => (isCustom ? patchCustom(customIndex, patch) : patchSection(activeId, patch));
  const currentMax = sectionMax(activeId);
  const autoMode = section?.mode === "auto";
  const autoMeta = autoToggleMeta(activeId, autoMode);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <ToggleRow
          label={autoMeta.name}
          hint={autoMeta.hint}
          checked={autoMode}
          onChange={(value) => setSection({ mode: value ? "auto" : "manual" })}
        />
      </div>
      {autoMode ? (
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3 rounded-md border border-primary/25 bg-primary/5 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">{autoMeta.noticeTitle}</p>
              <p className="mt-0.5 text-xs leading-5 text-on-surface-variant">{autoMeta.noticeText}</p>
            </div>
            <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <span className="size-2.5 rounded-full bg-primary" />
            </span>
          </div>
        </div>
      ) : (
        <>
          <Field label="Eyebrow">
            <Input value={section.eyebrow || ""} onChange={(event) => setSection({ eyebrow: event.target.value })} placeholder="e.g. Top Sale" />
          </Field>
          <Field label="Title">
            <Input value={section.title || ""} onChange={(event) => setSection({ title: event.target.value })} placeholder="e.g. Best deals this week" />
          </Field>
          <div className="sm:col-span-2">
            <ToggleRow label="Show this section" hint={section.enabled !== false ? "Visible on the storefront" : "Hidden from the storefront"} checked={section.enabled !== false} onChange={(value) => setSection({ enabled: value })} />
          </div>
          <div className="sm:col-span-2">
            <Field label="Products" hint={<RequirementHint count={(section.productIds || []).length} max={currentMax} min={limits.minPicks} />}>
              <ProductPicker token={token} value={section.productIds || []} onChange={(value) => setSection({ productIds: value })} max={currentMax} activeOnly />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}

function RequirementHint({ count, max, min = 3, empty }) {
  if (!max) return null;
  if (count === 0) return <span className="text-on-surface-variant">{empty || "Empty — the storefront fills this section with catalog products."}</span>;
  if (count < min) return <span className="font-semibold text-amber-700">Pick {min - count} more — at least {min} required to save.</span>;
  if (count < max) return <span className="font-semibold text-emerald-600">{count} of {max} picked — ready to save.</span>;
  return <span className="font-semibold text-emerald-600">Complete — {count} picked.</span>;
}

// Mirrors the EditorBody layout for the currently active section so the loading
// state looks like the real content (fields, toggles, picker).
function EditorSkeleton({ activeId }) {
  if (activeId === "categories") {
    return (
      <div className="grid gap-6 sm:grid-cols-2" aria-busy="true" aria-label="Loading Shop by category">
        <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-12 w-full rounded-md sm:col-span-2" />
      </div>
    );
  }
  if (activeId === "hero") {
    return (
      <div className="grid gap-6 sm:grid-cols-2" aria-busy="true" aria-label="Loading Hero section">
        <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-28 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
        <Skeleton className="h-12 w-full rounded-md sm:col-span-2" />
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2" aria-busy="true" aria-label="Loading section">
      <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-14 w-full rounded-md sm:col-span-2" />
      <Skeleton className="h-12 w-full rounded-md sm:col-span-2" />
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-outline-variant bg-surface-container-low/50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">{hint}</p>
      </div>
      <PriorityToggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-on-surface-variant">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
