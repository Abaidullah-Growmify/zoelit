"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { API_URL } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { Button, Card } from "@/components/ui";

const SECTION_LIMITS = { hero: 3, bestDeals: 4, newArrivals: 4, trending: 4, custom: 4 };

export default function ApiInspectorPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const inspect = useCallback(async () => {
    setLoading(true);
    setRequests([]);
    const records = [];
    const get = async (path) => {
      const startedAt = performance.now();
      try {
        const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
        const body = await response.json();
        const record = { path, status: response.status, duration: Math.round(performance.now() - startedAt), body };
        records.push(record);
        setRequests([...records]);
        return body;
      } catch (error) {
        const record = { path, status: "ERROR", duration: Math.round(performance.now() - startedAt), body: { error: error.message } };
        records.push(record);
        setRequests([...records]);
        return null;
      }
    };

    const [config, homepage, categories, productCount, userCount] = await Promise.all([
      get("/api/public/config"),
      get("/api/public/homepage"),
      get("/api/products/categories"),
      get("/api/products/count"),
      get("/api/public/user-count"),
    ]);

    const home = homepage?.homepage || {};
    const groups = [];
    const selectedIds = [];
    const addSection = (key, type, configValue) => {
      if (configValue?.enabled === false) return;
      const ids = Array.isArray(configValue?.productIds) ? configValue.productIds.map((item) => typeof item === "string" ? item : item?.productId).filter(Boolean).slice(0, SECTION_LIMITS[key] || 4) : [];
      if (configValue?.mode !== "auto" && ids.length) {
        groups.push({ key, ids });
        selectedIds.push(...ids);
      } else {
        groups.push({ key, type, limit: SECTION_LIMITS[key] || 4 });
      }
    };

    addSection("hero", "hero", home.hero);
    addSection("bestDeals", "bestDeals", home.bestDeals);
    addSection("newArrivals", "newArrivals", home.newArrivals);
    addSection("trending", "trending", home.trending);
    (Array.isArray(home.customSections) ? home.customSections : []).forEach((section, index) => addSection(`custom:${index}`, "custom", section));

    const uniqueIds = [...new Set(selectedIds)];
    if (uniqueIds.length) await get(`/api/products/by-ids?ids=${encodeURIComponent(uniqueIds.join(","))}&skip=1`);
    await Promise.all(groups.filter((group) => !group.ids).map((group) => get(`/api/products/auto-section?type=${encodeURIComponent(group.type)}&limit=${group.limit}`)));
    void config;
    void categories;
    void productCount;
    void userCount;
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void inspect();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [inspect]);

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main className="container-page py-8 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Developer tool</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-on-surface">API Inspector</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">This page makes the homepage API requests in the browser so they are visible in Chrome DevTools → Network.</p>
            <p className="mt-1 break-all text-xs font-semibold text-on-surface-variant">Backend: {API_URL}</p>
          </div>
          <Button onClick={inspect} disabled={loading}><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh requests</Button>
        </div>

        <div className="mt-6 grid gap-4">
          {requests.map((request, index) => (
            <Card key={`${request.path}-${index}`} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/70 bg-surface-container-low/60 px-4 py-3">
                <code className="break-all text-sm font-bold text-on-surface">{request.path}</code>
                <span className={request.status === 200 ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-rose-600"}>{request.status} · {request.duration}ms</span>
              </div>
              <pre className="max-h-96 overflow-auto bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(request.body, null, 2)}</pre>
            </Card>
          ))}
          {!requests.length && loading ? <Card className="p-6 text-sm text-on-surface-variant">Loading API responses...</Card> : null}
        </div>
      </main>
    </div>
  );
}
