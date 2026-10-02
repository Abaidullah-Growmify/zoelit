"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { money } from "@/lib/utils";

const DEFAULT_CONTENT = {
  eyebrow: "ZoeLit · Thoughtfully chosen",
  title: "Better technology, thoughtfully chosen for you.",
  lead: "Explore a considered collection of electronics, accessories, and everyday essentials selected for quality, value, and ease.",
};

export function HomeHero({ products, productCount = 0, content, explicit = false }) {
  const heroContent = { ...DEFAULT_CONTENT, ...content };
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!products || products.length < 2 || explicit) return undefined;
    const interval = window.setInterval(() => setActiveIndex((index) => (index + 1) % products.length), 4200);
    return () => window.clearInterval(interval);
  }, [products, explicit]);

  const picks = explicit ? products : null;

  const freeDeliveryProducts = products.filter((product) => Number(product.price) > 150);
  const priceSortedProducts = [...products].filter((product) => Number(product.price) > 0).sort((a, b) => Number(a.price) - Number(b.price));
  const lowShippingProducts = priceSortedProducts.filter((product) => Number(product.price) <= 150);

  const displayed = picks
    ? products.slice(0, 3)
    : freeDeliveryProducts.length
      ? [freeDeliveryProducts[activeIndex % freeDeliveryProducts.length], lowShippingProducts[activeIndex % lowShippingProducts.length], products[(activeIndex + 2) % products.length]].filter(Boolean).slice(0, 3)
      : products.slice(activeIndex % products.length).concat(products.slice(0, activeIndex % products.length)).slice(0, 3);

  const first = displayed[0] || null;
  const second = displayed[1] || null;
  const third = displayed[2] || null;

  const rating = Number(first?.rating) > 0 ? Number(first.rating) : 4.8;

  const titleLines = String(heroContent.title || "")
    .split("\n")
    .filter((line) => line.trim());
  const firstLine = titleLines[0] || DEFAULT_CONTENT.title.split("\n")[0];
  const restLines = titleLines.slice(1).join("\n");

  return (
    <section className="zl-hero">
      <div className="zl-hero-left">
        <div className="zl-eyebrow">{heroContent.eyebrow}</div>
        <h1 className="zl-h1 whitespace-pre-line">
          {firstLine}
          {restLines ? (<><br /><span>{restLines}</span></>) : null}
        </h1>
        <p className="zl-lead">{heroContent.lead}</p>
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
        {second ? <HeroProduct product={second} className="zl-hv1" shippingLabel={Number(second.price) <= 150 ? "Low shipping rate" : "Reasonable shipping"} badge={secondBadge(second)} /> : null}
        {third ? <HeroProduct product={third} className="zl-hv2" shippingLabel="Popular pick" badge={thirdBadge(third)} /> : null}
        {first ? <HeroProduct product={first} className="zl-hv3" featured shippingLabel={Number(first.price) > 150 ? "Free delivery" : "Low shipping rate"} badge={firstBadge(first)} /> : null}
      </div>
    </section>
  );
}

function firstBadge(product) {
  return product.heroBadge || (Number(product.price) > 150 ? "Free delivery" : "Low shipping rate");
}

function secondBadge(product) {
  return product.heroBadge || (Number(product.price) <= 150 ? "Low shipping rate" : "Reasonable shipping");
}

function thirdBadge(product) {
  return product.heroBadge || "Popular pick";
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