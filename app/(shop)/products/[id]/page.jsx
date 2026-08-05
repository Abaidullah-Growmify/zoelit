import { notFound } from "next/navigation";
import { PackageCheck, Truck } from "lucide-react";
import { getProduct, products } from "@/lib/data";
import { money } from "@/lib/utils";
import { AddToCartButton } from "./product-actions";
import { ProductImageZoom } from "./product-image-zoom";
import { Badge } from "@/components/ui";

function buildIngramProduct(product) {
  const ingramPartNumber = product.id.slice(0, 6).replace(/-/g, "").toUpperCase().padEnd(6, "0");
  const vendorName = product.category === "Tech" ? "DELL" : product.category === "Apparel" ? "Lenovo" : product.category === "Home" ? "Sandisk Mobile" : "Ingram Vendor";
  const customerPrice = product.price;
  const totalAvailability = product.stock;

  return {
    description: product.description,
    ingramPartNumber,
    vendorPartNumber: `${ingramPartNumber}-${product.category.slice(0, 3).toUpperCase()}`,
    upc: `0${String(product.price).padStart(5, "0")}${String(product.stock).padStart(5, "0")}`,
    vendorName,
    vendorNumber: `0000${String(product.stock).padStart(4, "0")}`,
    productCategory: product.category,
    productSubcategory: product.details?.Material || product.details?.Capacity || product.details?.Battery || "General Catalog",
    productClass: "B",
    uom: "EA",
    productAuthorized: true,
    returnableProduct: Boolean(product.details?.Warranty),
    acceptBackOrder: totalAvailability <= 10,
    endUserInfoRequired: false,
    govtSpecialPriceAvailable: false,
    availability: {
      available: totalAvailability > 0,
      totalAvailability,
      availabilityByWarehouse: [
        { warehouseId: 20, location: "Fort Worth, TX", quantityAvailable: Math.ceil(totalAvailability * 0.4), quantityBackordered: 0 },
        { warehouseId: 40, location: "Carol Stream, IL", quantityAvailable: Math.floor(totalAvailability * 0.35), quantityBackordered: totalAvailability <= 10 ? 12 : 0 },
        { warehouseId: 80, location: "Jonestown, PA", quantityAvailable: Math.floor(totalAvailability * 0.25), quantityBackordered: 0 },
      ],
    },
    pricing: {
      mapPrice: 0,
      currencyCode: "USD",
      retailPrice: Math.round(customerPrice * 1.28 * 100) / 100,
      customerPrice,
    },
    discounts: [],
    indicators: {
      hasWarranty: Boolean(product.details?.Warranty),
      isNewProduct: product.stock > 20,
      hasReturnLimits: false,
      isBackOrderAllowed: totalAvailability <= 10,
      isShippedFromPartner: false,
      isDirectship: false,
      isDownloadable: product.category === "Tech",
      isDigitalType: false,
      isDiscontinuedProduct: false,
      isRefurbished: false,
      isReturnableProduct: Boolean(product.details?.Warranty),
      isIngramShip: true,
      isEnduserRequired: false,
      isHeavyWeight: product.category === "Bags",
      hasLtl: false,
      isClearanceProduct: false,
      hasBundle: false,
      isOversizeProduct: false,
      isPreorderProduct: false,
      isLicenseProduct: product.category === "Tech",
      isDirectshipOrderable: true,
      isServiceSku: false,
      isConfigurable: false,
    },
    additionalInformation: {
      productWeight: [{ plantId: "US01", weight: product.category === "Bags" ? 2.4 : 1.2, weightUnit: "KG" }],
      height: "8",
      width: "31",
      length: "50",
      dimensionUnit: "CM",
    },
  };
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} | ZoeLit Commerce` : "Product" };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  const ingramProduct = buildIngramProduct(product);
  const canPurchase = ingramProduct.productAuthorized && ingramProduct.availability.available;

  return (
    <section className="container-page py-10 md:py-14">
      <div className="rounded-lg border border-slate-200 bg-white p-4 soft-shadow md:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1fr)] lg:items-start">
          <div>
            <ProductImageZoom product={product} />
          </div>

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{ingramProduct.productCategory}</Badge>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                <PackageCheck className="size-4 text-blue-600" />
                {ingramProduct.ingramPartNumber}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl dark:text-white">{ingramProduct.description}</h1>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-400">Vendor</dt>
                <dd className="mt-1 font-black text-slate-950 dark:text-white">{ingramProduct.vendorName}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-400">Vendor Part Number</dt>
                <dd className="mt-1 font-black text-slate-950 dark:text-white">{ingramProduct.vendorPartNumber}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-400">UPC</dt>
                <dd className="mt-1 font-black text-slate-950 dark:text-white">{ingramProduct.upc}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-400">Subcategory</dt>
                <dd className="mt-1 font-black text-slate-950 dark:text-white">{ingramProduct.productSubcategory}</dd>
              </div>
            </dl>

            <div className="mt-5 border-y border-slate-200 py-5 dark:border-slate-800">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Customer Price</p>
                  <span className="mt-1 block text-3xl font-black text-slate-950 dark:text-white">{money(ingramProduct.pricing.customerPrice)}</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400"><Truck className="size-4" />Available ({ingramProduct.availability.totalAvailability})</span>
              </div>

              {canPurchase ? <AddToCartButton product={product} className="mt-6 h-12 w-full rounded-lg text-base" /> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
