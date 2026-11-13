import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChevronRight, PackageSearch } from "lucide-react";
import { getAutoSectionProducts, getHomepageCatalog, getHomepageConfig, getProductCategories, getProductCount, getUserCount, resolvePickedProducts } from "@/lib/server-catalog";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button, EmptyState, SectionHeader } from "@/components/ui";
import { HomeCategories } from "@/components/home-categories";
import { HomePageSkeleton } from "@/components/skeletons";
import { Container } from "@/components/container";

export const metadata = {
  title: "Technology and Business Equipment",
  description: "Shop dependable technology, connectivity products, and business equipment from ZoeLit.",
  alternates: { canonical: "/" },
  openGraph: { title: "ZoeLit | Technology and Business Equipment", description: "Shop dependable technology, connectivity products, and business equipment from ZoeLit.", url: "/" },
};

// Statically render the homepage and refresh it in the background. This keeps
// the fast SSR output without querying the catalogue on every visit.
export const revalidate = 30;

const SECTION_LIMITS = {
  hero: 3,
  bestDeals: 4,
  newArrivals: 4,
  trending: 4,
  custom: 4,
};

const SECTION_DEFAULTS = {
  bestDeals: { eyebrow: "", title: "Featured Products" },
  newArrivals: { eyebrow: "New Arrivals", title: "Fresh picks just landed" },
  trending: { eyebrow: "Trending", title: "Popular right now" },
};

function NoCatalog() {
  return (
    <section>
      <Container className="py-16">
        <EmptyState
          icon={PackageSearch}
          title="No products in the catalog yet"
          description="The catalog has not been loaded yet. Please check back shortly or contact support."
          action={<Button asChild href="/admin/products"><ArrowRight className="size-4" />Go to admin</Button>}
        />
      </Container>
    </section>
  );
}

function homepageDisplay(homepage, categories, picks, productCount, autoSections) {
  const home = homepage || {};
  const resolved = picks || {};
  const bundledSections = autoSections && typeof autoSections === "object";
  const selectedCategories = home.categories?.mode === "auto" || !home.categories?.categoryNames?.length
    ? categories.slice(0, 6)
    : categories.filter((category) => home.categories.categoryNames.includes(category.name));
  const sectionConfig = (id, fallbackTitle) => {
    const section = home[id] || {};
    const pickedCount = resolved[id]?.length || 0;
    const automaticCount = bundledSections ? (Array.isArray(autoSections[id]) ? autoSections[id].length : 0) : 4;
    const count = section.enabled === false
      ? 0
      : section.mode !== "auto" && pickedCount
        ? Math.min(SECTION_LIMITS[id] || 4, pickedCount)
        : Math.min(SECTION_LIMITS[id] || 4, automaticCount);
    return {
      id,
      count,
      title: section.title || fallbackTitle,
    };
  };
  const sections = [
    sectionConfig("bestDeals", SECTION_DEFAULTS.bestDeals.title),
    sectionConfig("newArrivals", SECTION_DEFAULTS.newArrivals.title),
    sectionConfig("trending", SECTION_DEFAULTS.trending.title),
    ...(Array.isArray(home.customSections) ? home.customSections.map((section, index) => {
      const id = `custom:${index}`;
      const pickedCount = resolved[id]?.length || 0;
      const automaticCount = bundledSections ? (Array.isArray(autoSections[id]) ? autoSections[id].length : 0) : 4;
      const count = section.enabled === false
        ? 0
        : section.mode !== "auto" && pickedCount
          ? Math.min(SECTION_LIMITS.custom, pickedCount)
          : Math.min(SECTION_LIMITS.custom, automaticCount);
      return { id, count, title: section.title || "Featured collection" };
    }) : []),
  ].filter((section) => section.count > 0);
  const heroAutomaticCount = bundledSections ? (Array.isArray(autoSections.hero) ? autoSections.hero.length : 0) : (productCount ? 3 : 0);
  const heroCount = home.hero?.enabled === false ? 0 : home.hero?.mode !== "auto" && resolved.hero?.length
    ? Math.min(SECTION_LIMITS.hero, resolved.hero.length)
    : Math.min(SECTION_LIMITS.hero, heroAutomaticCount);
  return {
    heroEnabled: home.hero?.enabled !== false,
    heroCount,
    categoriesEnabled: home.categories?.enabled !== false,
    catCount: home.categories?.enabled === false ? 0 : selectedCategories.length,
    sections,
  };
}

async function HomeCatalog({ categories, productCount, userCount, homepage, picks, autoSections = {} }) {
  const home = homepage || {};
  const resolved = picks || {};
  const sectionProducts = async (id, type) => {
    const config = home[id] || {};
    if (config.enabled === false) return [];
    const limit = SECTION_LIMITS[id] || 4;
    if (config.mode !== "auto" && resolved[id]?.length) return resolved[id].slice(0, limit);
    return autoSections[id] || getAutoSectionProducts(type, limit);
  };
  const [bestDeals, newArrivals, trending] = await Promise.all([
    sectionProducts("bestDeals", "bestDeals"),
    sectionProducts("newArrivals", "newArrivals"),
    sectionProducts("trending", "trending"),
  ]);
  const heroProducts = home.hero?.mode === "auto"
    ? (autoSections.hero || getAutoSectionProducts("hero", SECTION_LIMITS.hero))
    : resolved.hero?.length ? resolved.hero.slice(0, SECTION_LIMITS.hero) : (autoSections.hero || getAutoSectionProducts("hero", SECTION_LIMITS.hero));
  const selectedCategories = home.categories?.mode === "auto" || !home.categories?.categoryNames?.length
    ? categories.slice(0, 6)
    : categories.filter((category) => home.categories.categoryNames.includes(category.name));
  const sections = [
    { id: "bestDeals", config: home.bestDeals, products: bestDeals },
    { id: "newArrivals", config: home.newArrivals, products: newArrivals },
    { id: "trending", config: home.trending, products: trending },
  ];

  const customSections = await Promise.all((home.customSections || []).map(async (config, index) => {
    if (config?.enabled === false) return { config, products: [] };
    const key = `custom:${index}`;
    const products = config?.mode === "auto"
      ? (autoSections[key] || getAutoSectionProducts("custom", SECTION_LIMITS.custom))
      : resolved[key]?.length
        ? resolved[key].slice(0, SECTION_LIMITS.custom)
        : (autoSections[key] || getAutoSectionProducts("custom", SECTION_LIMITS.custom));
    return { config, products };
  }));

  return <>
    {home.hero?.enabled !== false && heroProducts.length ? <HomeHero products={heroProducts} productCount={productCount} userCount={userCount} categories={selectedCategories} content={home.hero} explicit /> : null}
    {home.categories?.enabled !== false && selectedCategories.length ? <section className="home-categories-section py-10 md:py-16"><Container><SectionHeader eyebrow="Explore" title="Shop by category" action={<Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronRight className="size-4" /></Link>} /><div className="mt-6"><HomeCategories categories={selectedCategories} /></div></Container></section> : null}
    {sections.map((section) => section.config?.enabled !== false && section.products.length ? <ProductSection key={section.id} config={{ ...(section.config || {}), id: section.id }} products={section.products} /> : null)}
    {customSections.map(({ config, products }, index) => config?.enabled !== false && products.length ? <ProductSection key={`custom:${index}`} config={config} products={products} /> : null)}
  </>;
}

function ProductSection({ config = {}, products }) {
  return <section className="container-page py-10 md:py-16"><SectionHeader eyebrow={config.id === "bestDeals" ? "Featured" : config.eyebrow} title={config.title || "Featured products"} action={<Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronRight className="size-4" /></Link>} /><div className="product-grid grid-home mt-8">{products.map((product) => <ProductCard key={product.id} product={product} badge={product.badge || product.category} />)}</div></section>;
}

export default async function HomePage() {
  const catalog = await getHomepageCatalog();
  if (catalog) {
    const dbCategories = Array.isArray(catalog.categories) ? catalog.categories.filter((category) => category && category.name) : [];
    const display = homepageDisplay(catalog.homepage, dbCategories, catalog.picks, catalog.productCount, catalog.autoSections);
    return (
      <>
        {catalog.productCount > 0 ? (
          <Suspense fallback={<HomePageSkeleton display={display} />}>
            <HomeCatalog categories={dbCategories} productCount={catalog.productCount} userCount={catalog.userCount} homepage={catalog.homepage} picks={catalog.picks} autoSections={catalog.autoSections} />
          </Suspense>
        ) : <NoCatalog />}
      </>
    );
  }

  // The homepage config and its picked products are resolved together so the
  // loading skeleton already knows how many cards each section will render.
  const homepageBundle = getHomepageConfig().then(async (homepageConfig) => ({
    homepage: homepageConfig,
    picks: await resolvePickedProducts(homepageConfig),
  }));
  const [categories, productCount, userCount, bundle] = await Promise.all([
    getProductCategories(),
    getProductCount(),
    getUserCount(),
    homepageBundle,
  ]);
  const dbCategories = Array.isArray(categories) ? categories.filter((category) => category && category.name) : [];
   const display = homepageDisplay(bundle.homepage, dbCategories, bundle.picks, productCount);

  return (
    <>
      {productCount > 0 ? (
        <Suspense fallback={<HomePageSkeleton display={display} />}>
           <HomeCatalog categories={dbCategories} productCount={productCount} userCount={userCount} homepage={bundle.homepage} picks={bundle.picks} />
        </Suspense>
      ) : (
        <NoCatalog />
      )}
    </>
  );
}
