"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Layers3, Package, Truck, Users } from "lucide-react";
import { money } from "@/lib/utils";
import { CleanProductImage } from "@/components/clean-product-image";
import { Container } from "@/components/container";

const DEFAULT_CONTENT = {
  eyebrow: "ZoeLit · Thoughtfully chosen",
  title: "Better technology, thoughtfully chosen for you",
  lead: "Explore a considered collection of electronics, accessories, and everyday essentials selected for quality, value, and ease.",
};

export function HomeHero({ products, productCount = 0, categories = [], content, explicit = false }) {
  const heroContent = { ...DEFAULT_CONTENT, ...content };
  const [activeIndex, setActiveIndex] = useState(0);
  const [slide, setSlide] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    if (!products || products.length < 2) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const interval = window.setInterval(() => {
      setSlide((current) => (current + 1) % Math.min(products.length, 3));
      setActiveIndex((prev) => (prev + 1) % products.length);
    }, 3600);
    return () => window.clearInterval(interval);
  }, [products]);

  // Mobile banner: the hero cards keep rotating like a promo banner. Pauses
  // when there is a single slide or the visitor prefers reduced motion.
  useEffect(() => {
    if (!products || products.length < 2) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      setMobileIndex((current) => (current + 1) % Math.max(1, products.length));
    }, 3200);
    return () => window.clearInterval(timer);
  }, [products]);

  const goToMobile = (index) => {
    const count = Math.max(1, products.length);
    setMobileIndex(((index % count) + count) % count);
  };

  const picks = explicit ? products : null;
  const categoryCount = categories.length || new Set(products.map((product) => String(product.category || "General").trim()).filter(Boolean)).size;

  const freeDeliveryProducts = products.filter((product) => Number(product.price) > 150);
  const priceSortedProducts = [...products].filter((product) => Number(product.price) > 0).sort((a, b) => Number(a.price) - Number(b.price));
  const lowShippingProducts = priceSortedProducts.filter((product) => Number(product.price) <= 150);

  const displayed = picks
    ? products.slice(0, 3)
    : freeDeliveryProducts.length
      ? [freeDeliveryProducts[activeIndex % freeDeliveryProducts.length], lowShippingProducts[activeIndex % lowShippingProducts.length], products[(activeIndex + 2) % products.length]].filter(Boolean).slice(0, 3)
      : products.slice(activeIndex % products.length).concat(products.slice(0, activeIndex % products.length)).slice(0, 3);

  const titleValue = String(heroContent.title || "").replace(
    /^Better technology,\s+thoughtfully chosen for you\.?$/i,
    "Better technology,\nthoughtfully chosen for you"
  );
  const titleLines = titleValue
    .split("\n")
    .filter((line) => line.trim());
  const firstLine = titleLines[0] || DEFAULT_CONTENT.title.split("\n")[0];
  const restLines = titleLines.slice(1).join("\n");

  const mobileTotal = Math.max(1, displayed.length);
  const mobileActive = mobileIndex % mobileTotal;
  const desktopActive = slide % mobileTotal;
  const desktopProducts = displayed.map((_, offset) => displayed[(desktopActive + offset) % mobileTotal]).filter(Boolean);

  return (
    <section className="hero-section">
      <Container className="hero-inner">
        <div className="hero-copy">
          <div className="hero-eyebrow">{heroContent.eyebrow}</div>
          <h1 className="hero-title min-w-0 max-w-full break-words">
            <HeroTitleLine value={firstLine} />
            {restLines ? (<><br /><HeroTitleLine value={restLines} /></>) : null}
          </h1>
          <p className="hero-lead">{heroContent.lead}</p>
          <div className="hero-cta">
            <Link className="hero-btn" href="/products">Shop the Store <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="hero-stats">
            <AnimatedStat target={50000} suffix="k+" label="Happy customers" divisor={1000} />
            <AnimatedStat target={Math.max(Number(productCount) || 0, 30000)} suffix="k+" label="Products" divisor={1000} />
            <AnimatedStat target={categoryCount} suffix="+" label="Categories" />
          </div>
        </div>

        {/* Mobile-only: the hero cards render as one full-width promo banner that
            keeps rotating, with the stats card underneath (mock design). The
            headline text block above is hidden on phones by CSS. */}
        <div className="hero-mobile">
          <div className="zl-mhero">
            <div className="zl-mhero-stage">
              {displayed.map((product, index) => (
                <article
                  key={product.id ?? index}
                  className={`zl-mhero-slide${index === mobileActive ? " is-active" : ""}`}
                  aria-hidden={index !== mobileActive}
                >
                  <div className="zl-mhero-copy">
                    <span className="zl-mhero-badge">{product.heroBadge || (Number(product.price) > 150 ? "Free delivery" : "Popular pick")}</span>
                    <h2 className="zl-mhero-title">{product.name}</h2>
                    <p className="zl-mhero-sub">{product.category || "Featured"}</p>
                    <div className="zl-mhero-bottom">
                      <span className="zl-mhero-price">{money(product.price)}</span>
                      <Link className="zl-mhero-cta" href={`/products/${product.id}`}>View <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </div>
                  </div>
                  <div className="zl-mhero-img">
                    {product.image ? (
                      <CleanProductImage src={product.image} alt={product.name} />
                    ) : (
                      <span className="zl-mhero-fallback">★</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="zl-mhero-nav">
              <button type="button" className="zl-mhero-arrow" onClick={() => goToMobile(mobileActive - 1)} aria-label="Previous banner">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="zl-mhero-dots">
                {displayed.map((product, index) => (
                  <button
                    key={product.id ?? index}
                    type="button"
                    className={`zl-mhero-dot${index === mobileActive ? " is-active" : ""}`}
                    onClick={() => goToMobile(index)}
                    aria-label={`Show banner ${index + 1}`}
                    aria-current={index === mobileActive}
                  />
                ))}
              </div>
              <button type="button" className="zl-mhero-arrow" onClick={() => goToMobile(mobileActive + 1)} aria-label="Next banner">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="zl-mstats">
               <AnimatedStat icon={Users} target={50000} suffix="k+" label="Happy customers" divisor={1000} variant="mobile" />
                <AnimatedStat icon={Package} target={Math.max(Number(productCount) || 0, 30000)} suffix="k+" label="Products" divisor={1000} variant="mobile" />
                 <AnimatedStat icon={Layers3} target={categoryCount} suffix="+" label="Categories" variant="mobile" />
            </div>
          </div>
        </div>

        <div className="hero-card-col">
          {desktopProducts[0] ? <HeroProduct product={desktopProducts[0]} shippingLabel={Number(desktopProducts[0].price) > 150 ? "Free delivery" : "Low shipping rate"} badge={firstBadge(desktopProducts[0])} /> : null}
        </div>
      </Container>
    </section>
  );
}

function firstBadge(product) {
  return product.heroBadge || (Number(product.price) > 150 ? "Free delivery" : "Low shipping rate");
}

function AnimatedStat({ target, suffix, label, divisor = 1, decimal = false, icon: Icon, variant }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const started = performance.now();
    const duration = 1200;
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const display = decimal ? value.toFixed(1) : Math.floor(value / divisor);
  if (variant !== "mobile") {
    return (
      <div className="hero-stat">
        <b className="hero-stat-value">{display}{suffix}</b>
        <span className="hero-stat-label">{label}</span>
      </div>
    );
  }
  return (
    <div className="zl-stat">
      <div className="zl-stat-top">
        {Icon ? <Icon className="zl-stat-ic" aria-hidden="true" /> : null}
        <b>{display}{suffix}</b>
      </div>
      <span>{label}</span>
    </div>
  );
}

function HeroProduct({ product, shippingLabel, badge }) {
  return (
    <article className="hero-card">
      <div className="hero-card-body">
        {badge && <span className="hero-badge">{badge}</span>}
        <small className="hero-category">{product.category || "Featured"}</small>
        <b className="hero-name">{product.name}</b>
        <div className="hero-price-row">
          <span className="hero-price">{money(product.price)} {product.oldPrice ? <s>{money(product.oldPrice)}</s> : null}</span>
          <Link className="hero-view" href={`/products/${product.id}`}>View <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="hero-shipping">
          <Truck className="h-4 w-4" />
          <span>{shippingLabel || (Number(product.price) > 150 ? "Free delivery" : "Low shipping rate")}</span>
        </div>
        <div className="hero-shipping hero-stock">
          <Package className="h-4 w-4" />
          <span>{Number(product.stock) > 0 && product.isSellable !== false ? `${Number(product.stock)} in stock` : "Out of stock"}</span>
        </div>
      </div>
      <div className="hero-media">
        {product.image ? <CleanProductImage src={product.image} alt={product.name} /> : <span className="hero-media-fallback">★</span>}
      </div>
    </article>
  );
}

function HeroTitleLine({ value }) {
  const parts = String(value || "").split(/(thoughtfully[\s\S]*)/i);
  return parts.map((part, index) => /^thoughtfully/i.test(part) ? <span key={index}>{part}</span> : part);
}
