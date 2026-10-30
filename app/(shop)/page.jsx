import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChevronRight, PackageSearch } from "lucide-react";
import { getAutoSectionProducts, getFeaturedProducts, getHomepageConfig, getProductCategories, getProductCount, resolvePickedProducts } from "@/lib/server-catalog";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button, EmptyState, SectionHeader } from "@/components/ui";
import { HomeCategories } from "@/components/home-categories";
import { HomePageSkeleton } from "@/components/skeletons";
import { Container } from "@/components/container";

export const dynamic = "force-dynamic";

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

function homepageDisplay(homepage, categories, picks, productCount) {
  const home = homepage || {};
  const resolved = picks || {};
  const sectionConfig = (id, fallbackTitle) => {
    const section = home[id] || {};
    return {
      id,
      count: Math.min(SECTION_LIMITS[id] || 4, Math.max(0, resolved[id]?.length || (section.enabled === false ? 0 : 4))),
      title: section.title || fallbackTitle,
    };
  };
  const sections = [
    sectionConfig("bestDeals", SECTION_DEFAULTS.bestDeals.title),
    sectionConfig("newArrivals", SECTION_DEFAULTS.newArrivals.title),
    sectionConfig("trending", SECTION_DEFAULTS.trending.title),
    ...(Array.isArray(home.customSections) ? home.customSections.map((section, index) => ({ id: `custom:${index}`, count: Math.min(SECTION_LIMITS.custom, Math.max(0, resolved[`custom:${index}`]?.length || (section.enabled === false ? 0 : 4))), title: section.title || "Featured collection" })) : []),
  ].filter((section) => section.count > 0);
  return {
    heroEnabled: home.hero?.enabled !== false,
    heroCount: Math.min(SECTION_LIMITS.hero, Math.max(0, resolved.hero?.length || (productCount ? 3 : 0))),
    categoriesEnabled: home.categories?.enabled !== false,
    catCount: home.categories?.mode === "auto" ? Math.min(6, categories.length) : Math.min(6, home.categories?.categoryNames?.length || categories.length),
    sections,
  };
}

async function HomeCatalog({ categories, productCount, homepage, picks }) {
  const home = homepage || {};
  const resolved = picks || {};
  const fallback = await getFeaturedProducts();
  const sectionProducts = async (id, type, fallbackOffset = 0) => {
    const config = home[id] || {};
    if (config.enabled === false) return [];
    if (resolved[id]?.length) return resolved[id].slice(0, SECTION_LIMITS[id] || 4);
    if (config.mode === "auto") return (await getAutoSectionProducts(type, SECTION_LIMITS[id] || 4)).slice(0, SECTION_LIMITS[id] || 4);
    return fallback.slice(fallbackOffset, fallbackOffset + (SECTION_LIMITS[id] || 4));
  };
  const [bestDeals, newArrivals, trending] = await Promise.all([
    sectionProducts("bestDeals", "bestDeals", 0),
    sectionProducts("newArrivals", "newArrivals", 4),
    sectionProducts("trending", "trending", 8),
  ]);
  const heroProducts = (resolved.hero?.length ? resolved.hero : fallback).slice(0, SECTION_LIMITS.hero);
  const selectedCategories = home.categories?.mode === "auto" || !home.categories?.categoryNames?.length
    ? categories.slice(0, 6)
    : categories.filter((category) => home.categories.categoryNames.includes(category.name)).slice(0, 6);
  const sections = [
    { id: "bestDeals", config: home.bestDeals, products: bestDeals },
    { id: "newArrivals", config: home.newArrivals, products: newArrivals },
    { id: "trending", config: home.trending, products: trending },
  ];

  return <>
    {home.hero?.enabled !== false && heroProducts.length ? <HomeHero products={heroProducts} productCount={productCount} categories={selectedCategories} content={home.hero} explicit /> : null}
    {home.categories?.enabled !== false && selectedCategories.length ? <section className="home-categories-section py-10 md:py-16"><Container><SectionHeader eyebrow="Explore" title="Shop by category" action={<Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronRight className="size-4" /></Link>} /><div className="mt-6"><HomeCategories categories={selectedCategories} /></div></Container></section> : null}
    {sections.map((section) => section.config?.enabled !== false && section.products.length ? <ProductSection key={section.id} config={section.config} products={section.products} /> : null)}
    {(home.customSections || []).map((config, index) => {
      const products = resolved[`custom:${index}`]?.length ? resolved[`custom:${index}`] : fallback.slice(index * 4, index * 4 + 4);
      return config?.enabled !== false && products.length ? <ProductSection key={`custom:${index}`} config={config} products={products.slice(0, SECTION_LIMITS.custom)} /> : null;
    })}
  </>;
}

function ProductSection({ config = {}, products }) {
  return <section className="container-page py-10 md:py-16"><SectionHeader eyebrow={config.eyebrow} title={config.title || "Featured products"} action={<Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronRight className="size-4" /></Link>} /><div className="product-grid grid-home mt-8">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
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
    </>
  );
}
