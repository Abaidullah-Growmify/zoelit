import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ChevronRight, PackageSearch, Truck } from "lucide-react";
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