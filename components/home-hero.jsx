"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { money } from "@/lib/utils";

export function HomeHero({ products, productCount = 0 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (!products || products.length < 2) return undefined;
    const interval = window.setInterval(() => setActiveIndex((index) => (index + 1) % products.length), 4200);
    return () => window.clearInterval(interval);
  }, [products]);

  if (!products?.length) return null;

  const freeDeliveryProducts = products.filter((product) => Number(product.price) > 150);
  const priceSortedProducts = [...products].filter((product) => Number(product.price) > 0).sort((a, b) => Number(a.price) - Number(b.price));
  const lowShippingProducts = priceSortedProducts.filter((product) => Number(product.price) <= 150);
  const first = freeDeliveryProducts.length
    ? freeDeliveryProducts[activeIndex % freeDeliveryProducts.length]
    : products[activeIndex % products.length];
  const second = lowShippingProducts.length
    ? lowShippingProducts[activeIndex % lowShippingProducts.length]
    : priceSortedProducts[0] || products[(activeIndex + 1) % products.length] || first;
  const third = products[(activeIndex + 2) % products.length] || second;
  const secondShippingLabel = Number(second.price) <= 150 ? "Low shipping rate" : "Reasonable shipping";
  const rating = Number(first.rating) > 0 ? Number(first.rating) : 4.8;

  return (
    <section className="zl-hero">
      <div className="zl-hero-left">
        <div className="zl-eyebrow">ZoeLit · Thoughtfully chosen</div>
        <h1 className="zl-h1">Better technology,<br /><span>thoughtfully chosen for you.</span></h1>
        <p className="zl-lead">Explore a considered collection of electronics, accessories, and everyday essentials selected for quality, value, and ease.</p>
        <div className="zl-cta">
          <Link className="zl-btn" href="/products">Shop the Store <ArrowUp className="zl-ic" /></Link>
        </div>
        <div className="zl-stats">
          <AnimatedStat target={50000} suffix="k+" label="Happy customers" divisor={1000} />
          <AnimatedStat target={productCount} suffix="" label={productCount === 1 ? "Product" : "Products"} />
          <AnimatedStat target={rating} suffix="" label="Average rating" decimal />
        </div>
      </div>

      <div className="zl-hero-right">
        <HeroProduct product={second} className="zl-hv1" shippingLabel={secondShippingLabel} badge={secondShippingLabel} />
        <HeroProduct product={third} className="zl-hv2" shippingLabel="Popular pick" badge="Popular pick" />
        <HeroProduct product={first} className="zl-hv3" featured shippingLabel={freeDeliveryProducts.length ? "Free delivery" : "Low shipping rate"} badge={freeDeliveryProducts.length ? "Free delivery" : "Low shipping rate"} />
      </div>
    </section>
  );
}

function AnimatedStat({ target, suffix, label, divisor = 1, decimal = false }) {
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
  return <div className="zl-stat"><b>{display}{suffix}</b><span>{label}</span></div>;
}

function HeroProduct({ product, className, featured = false, shippingLabel, badge }) {
  return (
    <article className={`zl-hv ${className}`}>
      <div className="zl-hv-img">
        {product.image ? <Image src={product.image} alt={product.name} fill sizes="250px" className="object-cover" /> : <span className="zl-hv-fallback">{featured ? "★" : "◌"}</span>}
        <span className="zl-card-badge">{badge}</span>
      </div>
      <div className="zl-hv-body">
        <small>{product.category || "Featured"}</small>
        <b>{product.name}</b>
        <div className="zl-hv-row">
          <span className="zl-hv-price">{money(product.price)} {product.oldPrice ? <s>{money(product.oldPrice)}</s> : null}</span>
          <Link className={`zl-hv-view ${featured ? "" : "zl-hv-view2"}`} href={`/products/${product.id}`}>View</Link>
        </div>
        <small className="zl-shipping-label">{shippingLabel || (Number(product.price) > 150 ? "Free delivery" : "Low shipping rate")}</small>
      </div>
    </article>
  );
}
