import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Mail, PackageCheck, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { getAutoSectionProducts, getFeaturedProducts, getHomepageConfig, getProductCategories, getProductCount, resolvePickedProducts } from "@/lib/server-catalog";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button, Card, EmptyState, SectionHeader } from "@/components/ui";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { HomeCategories } from "@/components/home-categories";
import { HomePageSkeleton } from "@/components/skeletons";

export const dynamic = "force-dynamic";

const FEATURE_ITEMS = [
  { icon: Truck, title: "Clear fulfillment", text: "Shipping cost is visible before checkout and free shipping unlocks automatically." },
  { icon: ShieldCheck, title: "Secure checkout", text: "Required fields, validation, and payment choice stay clear until order placement." },
  { icon: PackageCheck, title: "Account control", text: "Customers can review orders, addresses, and profile details after purchase." },
];

// Every section renders at least this many cards, so a short row never looks
// like a broken layout.
const MIN_SECTION_CARDS = 3;

const SECTION_LIMITS = {
  hero: 3,
  bestDeals: 4,
  newArrivals: 4,
  trending: 4,
  custom: 6,
};

const SECTION_DEFAULTS = {
  bestDeals: { eyebrow: "Top Sale", title: "Best deals this week" },
  newArrivals: { eyebrow: "New Arrivals", title: "Fresh picks just landed" },
  trending: { eyebrow: "Trending", title: "Popular right now" },
};

function NoCatalog() {
  return (
    <section className="container-page py-16">
      <EmptyState
        icon={PackageSearch}
        title="No products in the catalog yet"
        description="The catalog has not been loaded yet. Please check back shortly or contact support."
        action={<Button asChild href="/admin/products"><ArrowRight className="size-4" />Go to admin</Button>}
      />
    </section>
  );
}

export default async function HomePage() {
  // The homepage config and its picked products are resolved together so the
  // loading skeleton already knows how many cards each section will render.
  const homepageBundle = getHomepageConfig().then(async (homepageConfig) => ({
    homepage: homepageConfig,
    picks: await resolvePickedProducts(homepageConfig),
  }));
  const [categories, productCount, bundle] = await Promise.all([
    getProductCategories(),
    getProductCount(),
    homepageBundle,
  ]);
  const dbCategories = Array.isArray(categories) ? categories.filter((category) => category && category.name) : [];
  const display = homepageDisplay(bundle.homepage, dbCategories, bundle.picks, productCount);

  return (
    <>
      {productCount > 0 ? (
        <Suspense fallback={<HomePageSkeleton display={display} />}>
          <HomeCatalog categories={dbCategories} productCount={productCount} homepage={bundle.homepage} picks={bundle.picks} />
        </Suspense>
      ) : (
        <NoCatalog />
      )}
      <section className="container-page grid gap-4 pb-16 md:grid-cols-3">{FEATURE_ITEMS.map((item) => <Card key={item.title} className="shadow-sm"><item.icon className="size-8 text-primary" /><h3 className="mt-5 font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">{item.title}</h3><p className="mt-2 text-body-md font-normal text-on-surface-variant">{item.text}</p></Card>)}</section>
    </>
  );
}

// Category names are compared case/whitespace insensitively so a saved pick
// still matches the database entry after a rename with different casing.
function normalizeCategoryKey(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

// Number of cards a section will render: at least MIN_SECTION_CARDS, never
// more than the section limit or the products the catalog actually has.
function sectionCardTarget(limit, seedCount, productCount) {
  const available = Math.max(1, Number(productCount) || 0);
  return Math.max(1, Math.min(limit, Math.max(MIN_SECTION_CARDS, seedCount), available));
}

// Shared by the loading skeleton and the real page so both agree on whether a
// section renders and how many cards it shows. A section is hidden only when it
// is switched off; if its saved picks are gone from the catalog it falls back
// to catalog products so a row never goes empty.
function planProductSection(config, limit, resolvedList, productCount) {
  if (!config || config.enabled === false) return null;
  const picks = Array.isArray(config.productIds) ? config.productIds : [];
  const resolved = Array.isArray(resolvedList) ? resolvedList : [];
  const auto = config.mode === "auto" || picks.length === 0 || resolved.length === 0;
  const seed = auto ? limit : resolved.length;
  return { auto, count: sectionCardTarget(limit, seed, productCount) };
}

// Picks that still exist in the database, in the saved order. When a manual
// section ends up with nothing valid the top categories are shown instead, so
// switching the section on always shows something.
function planCategories(config, dbCategories) {
  const cfg = config || {};
  if (cfg.enabled === false) return { enabled: false, categories: [] };

  const db = Array.isArray(dbCategories) ? dbCategories : [];
  const byKey = new Map(db.map((category) => [normalizeCategoryKey(category.name), category]));
  const seen = new Set();
  const picked = [];
  for (const name of Array.isArray(cfg.categoryNames) ? cfg.categoryNames : []) {
    const key = normalizeCategoryKey(name);
    const category = byKey.get(key);
    if (!category || seen.has(key)) continue;
    seen.add(key);
    picked.push(category);
  }

  const useAuto = cfg.mode === "auto" || picked.length === 0;
  const list = (useAuto ? db.slice(0, 6) : picked.slice(0, 6)).slice();

  const minTiles = Math.min(MIN_SECTION_CARDS, db.length);
  if (list.length < minTiles) {
    for (const category of db) {
      if (list.length >= minTiles) break;
      const key = normalizeCategoryKey(category.name);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(category);
      }
    }
  }

  return { enabled: list.length > 0, categories: list };
}

// Derives what the storefront will actually render from the saved homepage
// config plus the catalog lookup, so the skeleton promises nothing extra.
function homepageDisplay(home, dbCategories, picks, productCount) {
  const h = home || {};
  const resolved = picks || {};

  const heroPlan = planProductSection(h.hero, SECTION_LIMITS.hero, resolved.hero, productCount);
  const categoryPlan = planCategories(h.categories, dbCategories);

  const sections = [];
  for (const id of ["bestDeals", "newArrivals", "trending"]) {
    const plan = planProductSection(h[id], SECTION_LIMITS[id], resolved[id], productCount);
    if (plan) sections.push({ id, label: h[id].title || id, count: plan.count });
  }
  (Array.isArray(h.customSections) ? h.customSections : []).forEach((section, index) => {
    const id = `custom:${index}`;
    const plan = planProductSection(section, SECTION_LIMITS.custom, resolved[id], productCount);
    if (plan) sections.push({ id, label: section.title || `Section ${index + 1}`, count: plan.count });
  });

  return {
    heroEnabled: Boolean(heroPlan),
    heroCount: heroPlan ? heroPlan.count : 0,
    categoriesEnabled: categoryPlan.enabled,
    catCount: categoryPlan.categories.length,
    sections,
  };
}

// Resolves one section to exactly the card count the skeleton promised:
// manual picks first, then other in-stock products for any shortfall (picks
// can disappear when a product is removed from the catalog). The auto pool is
// asked for the full target so a fill that collides with a pick still leaves
// enough fresh products.
async function fillSection(count, picked, auto, fetchType, featured = []) {
  if (count <= 0) return [];

  const keep = auto ? [] : picked.slice(0, count);
  if (keep.length >= count) return keep;

  const seen = new Set(keep.map((product) => product.id));
  const list = [...keep];
  const addFrom = (products) => {
    for (const product of products || []) {
      if (list.length >= count) break;
      if (!product || seen.has(product.id)) continue;
      seen.add(product.id);
      list.push(product);
    }
  };

  addFrom(await getAutoSectionProducts(fetchType, count));
  if (list.length < count) addFrom(featured);

  return list;
}

async function HomeCatalog({ categories, productCount, homepage, picks }) {
  const featured = await getFeaturedProducts();
  if (!featured.length) return <NoCatalog />;

  const home = homepage || {};
  const resolved = picks || {};
  const heroConfig = home.hero || {};
  const heroItems = Array.isArray(heroConfig.productIds) ? heroConfig.productIds : [];
  const customSections = Array.isArray(home.customSections) ? home.customSections : [];

  const heroPlan = planProductSection(heroConfig, SECTION_LIMITS.hero, resolved.hero, productCount);

  const plans = [];
  for (const id of ["bestDeals", "newArrivals", "trending"]) {
    const plan = planProductSection(home[id], SECTION_LIMITS[id], resolved[id], productCount);
    if (plan) plans.push({ id, plan, config: home[id] });
  }
  customSections.forEach((section, index) => {
    const id = `custom:${index}`;
    const plan = planProductSection(section, SECTION_LIMITS.custom, resolved[id], productCount);
    if (plan) plans.push({ id, plan, config: section });
  });

  const [heroProducts, ...sectionProducts] = await Promise.all([
    heroPlan
      ? fillSection(heroPlan.count, resolved.hero || [], heroPlan.auto, "hero", featured)
      : Promise.resolve([]),
    ...plans.map(({ id, plan }) =>
      fillSection(plan.count, resolved[id] || [], plan.auto, id.startsWith("custom:") ? "custom" : id, featured)
    ),
  ]);

  const heroWithBadges = heroProducts.map((product) => {
    const heroItem = heroItems.find((item) => (typeof item === "string" ? item : item?.productId) === product.id);
    return { ...product, heroBadge: heroItem?.badge || "" };
  });

  const categoryPlan = planCategories(home.categories, categories);

  const productSections = plans
    .map(({ id, config }, index) => {
      const defaults = SECTION_DEFAULTS[id] || {};
      return {
        key: id,
        enabled: config.enabled !== false && sectionProducts[index].length > 0,
        eyebrow: config.eyebrow || defaults.eyebrow || "Featured",
        title: config.title || defaults.title || `Section ${Number(id.split(":")[1] || 0) + 1}`,
        products: sectionProducts[index],
      };
    })
    .filter((section) => section.enabled);

  return (
    <>
      {heroPlan && heroWithBadges.length ? (
        <HomeHero
          products={heroWithBadges}
          productCount={productCount}
          explicit
          content={{ eyebrow: heroConfig.eyebrow, title: heroConfig.title, lead: heroConfig.lead }}
        />
      ) : null}
      {categoryPlan.enabled ? (
        <section className="container-page pb-4 pt-8 sm:pt-10">
          <SectionHeader title="Shop by Category" action={<Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">View all<ArrowRight className="size-4" /></Link>} className="mb-6" />
          <HomeCategories categories={categoryPlan.categories} />
        </section>
      ) : null}
      {productSections.map((section, index) => (
        <section key={section.key} className={`container-page ${index === 0 ? "section-fade-up py-16" : "pb-16"}`}>
          <SectionHeader eyebrow={section.eyebrow} title={section.title} action={<Link href="/products" aria-label="View all products" className="inline-flex h-9 items-center gap-2 rounded-sm px-3 text-label-md font-semibold text-primary transition duration-200 ease-out hover:bg-surface-container-low dark:hover:bg-surface-container-low">View all<ArrowRight className="size-4" /></Link>} className="mb-8" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{section.products.map((product, productIndex) => <ProductCard key={`${product.id}-${productIndex}`} product={product} />)}</div>
        </section>
      ))}
      <section className="container-page pb-16">
        <Card className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1.5 text-label-sm font-bold uppercase tracking-[0.12em] text-primary ring-1 ring-primary/10">
                <Mail className="size-4" />
                Newsletter
              </span>
              <h2 className="mt-5 max-w-2xl text-balance font-heading text-headline-lg-mobile font-bold tracking-[-0.03em] text-on-surface sm:text-headline-lg">
                Subscribe for Latest Trends & Offers
              </h2>
              <p className="mt-4 max-w-xl text-body-md leading-7 text-on-surface-variant">
                Get fresh arrivals, limited-time deals, and smart shopping notes delivered straight to your inbox.
              </p>
            </div>
            <NewsletterSignup />
          </div>
        </Card>
      </section>
    </>
  );
}
