"use client";

import { useState } from "react";
import { Package, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { syncIngramProductDetails } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { cn } from "@/lib/utils";

function yesNo(value) {
  return value ? "Yes" : "No";
}

function Field({ label, value }) {
  const display = value === null || value === undefined || value === "" ? "—" : value;
  return (
    <div className="min-w-0 rounded-lg border border-outline-variant/70 bg-surface-container-low px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-on-surface">{display}</p>
    </div>
  );
}

function Flag({ label, value }) {
  const active = Boolean(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-outline-variant/80 bg-surface text-on-surface-variant"
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-primary" : "bg-outline-variant")} />
      {label}
    </span>
  );
}

export function IngramProductDetails({ product, onProductChange }) {
  const token = useAdminAuthStore((state) => state.token);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  if (!product || product.source === "manual") return null;
  const d = product.ingramDetails || {};
  const indicators = d.indicators || {};
  const additional = d.additionalInformation || {};
  const weights = Array.isArray(d.additionalInformation?.productWeight)
    ? d.additionalInformation.productWeight
    : (product.productWeights || []);
  const syncedAt = product.lastDetailSyncAt ? new Date(product.lastDetailSyncAt).toLocaleString() : "Never";

  async function handleRefresh() {
    if (!token || refreshing) return;
    setRefreshing(true);
    setError("");
    try {
      const response = await syncIngramProductDetails(product.ingramPartNumber, token);
      if (response?.product) onProductChange?.(response.product);
    } catch (err) {
      setError(err?.message || "Could not refresh details from Ingram");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-outline-variant/80 bg-surface-container-low p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-heading text-base font-semibold text-on-surface">Ingram product details</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-on-surface-variant">Last synced: {syncedAt}</p>
          <Button type="button" variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
            {refreshing ? "Refreshing…" : "Refresh from Ingram"}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-error">{error}</p> : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <Field label="Vendor number" value={product.vendorNumber || d.vendorNumber} />
        <Field label="Vendor part no." value={product.vendorPartNumber} />
        <Field label="Authorized" value={yesNo(product.productAuthorized ?? d.productAuthorized)} />
        <Field label="Status code" value={product.productStatusCode || d.productStatusCode} />
        <Field label="Subcategory" value={product.productSubcategory || d.productSubcategory} />
        <Field label="Product class" value={product.productClass || d.productClass} />
        <Field label="SKU type" value={product.skuType || indicators.skuType} />
        <Field label="Replacement type" value={product.replacementType || indicators.replacementType} />
        <Field label="Height" value={product.height ? `${product.height} ${product.dimensionUnit || ""}`.trim() : additional.height} />
        <Field label="Width" value={product.width ? `${product.width} ${product.dimensionUnit || ""}`.trim() : additional.width} />
        <Field label="Length" value={product.length ? `${product.length} ${product.dimensionUnit || ""}`.trim() : additional.length} />
        <Field label="Net weight" value={product.netWeight != null ? `${product.netWeight} ${product.weightUnit || ""}`.trim() : additional.netWeight} />
        <Field label="Bulk freight" value={yesNo(product.isBulkFreight)} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">Indicator flags</p>
        <div className="flex flex-wrap gap-1.5">
          <Flag label="New product" value={product.newProduct} />
          <Flag label="Warranty" value={product.hasWarranty} />
          <Flag label="Directship" value={product.isDirectship} />
          <Flag label="Directship orderable" value={product.isDirectshipOrderable} />
          <Flag label="Ingram ship" value={product.isIngramShip} />
          <Flag label="Discontinued" value={product.isDiscontinuedProduct} />
          <Flag label="Refurbished" value={product.isRefurbished} />
          <Flag label="Returnable" value={product.isReturnableProduct} />
          <Flag label="Return limits" value={product.hasReturnLimits} />
          <Flag label="Back order allowed" value={product.isBackOrderAllowed} />
          <Flag label="Replacement" value={product.isReplacementProduct} />
          <Flag label="Clearance" value={product.isClearanceProduct} />
          <Flag label="Preorder" value={product.isPreorderProduct} />
          <Flag label="License" value={product.isLicenseProduct} />
          <Flag label="Downloadable" value={product.isDownloadable} />
          <Flag label="Digital" value={product.isDigitalType} />
          <Flag label="Service SKU" value={product.isServiceSku} />
          <Flag label="Configurable" value={product.isConfigurable} />
          <Flag label="Bundle" value={product.hasBundle} />
          <Flag label="Heavy weight" value={product.isHeavyWeight} />
          <Flag label="LTL" value={product.hasLtl} />
          <Flag label="Oversize" value={product.isOversizeProduct} />
          <Flag label="Exportable" value={product.isExportableToCountry} />
          <Flag label="Shipped from partner" value={product.isShippedFromPartner} />
          <Flag label="End user required" value={product.endUserRequired} />
          <Flag label="Special price" value={product.hasStdSpecialPrice} />
          <Flag label="Special bid" value={product.hasSpecialBid} />
          <Flag label="Std web discount" value={product.hasStdWebDiscount} />
          <Flag label="ACOP web discount" value={product.hasAcopWebDiscount} />
          <Flag label="ACOP special price" value={product.hasAcopSpecialPrice} />
          <Flag label="ACOP qty break" value={product.hasAcopQuantityBreak} />
        </div>
      </div>

      {product.warrantyInformation?.length ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">Warranty information</p>
          <pre className="max-h-40 overflow-auto rounded-lg border border-outline-variant/70 bg-surface p-3 text-xs text-on-surface">{JSON.stringify(product.warrantyInformation, null, 2)}</pre>
        </div>
      ) : null}

      {weights?.length ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">Weights by plant</p>
          <div className="overflow-x-auto rounded-lg border border-outline-variant/70">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant">
                  <th className="px-3 py-2 text-xs font-semibold uppercase">Plant</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase">Weight</th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase">Unit</th>
                </tr>
              </thead>
              <tbody>
                {weights.map((item, index) => (
                  <tr key={`${item?.plantId || "plant"}-${index}`} className="border-t border-outline-variant/60">
                    <td className="px-3 py-2">{item?.plantId || "—"}</td>
                    <td className="px-3 py-2">{item?.weight ?? "—"}</td>
                    <td className="px-3 py-2">{item?.weightUnit || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        onClick={() => setShowRaw((value) => !value)}
      >
        <ChevronDown className={cn("size-3.5 transition-transform", showRaw && "rotate-180")} aria-hidden="true" />
        {showRaw ? "Hide raw Ingram payload" : "Show raw Ingram payload"}
      </button>
      {showRaw ? (
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg border border-outline-variant/70 bg-surface p-3 text-xs text-on-surface">{JSON.stringify(product.ingramDetails || d || null, null, 2)}</pre>
      ) : null}
    </div>
  );
}
