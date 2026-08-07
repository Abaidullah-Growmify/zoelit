"use client";

import { startTransition, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui";

export function HomeHero({ products }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeProduct = products[activeIndex];

  useEffect(() => {
    if (isPaused || products.length < 2) return undefined;

    const interval = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((index) => (index + 1) % products.length);
      });
    }, 4200);

    return () => window.clearInterval(interval);
  }, [isPaused, products.length]);

  function selectProduct(index) {
    setIsPaused(true);
    startTransition(() => setActiveIndex(index));
  }

  return (
    <section className="hero-stage relative overflow-hidden py-14 sm:py-18 lg:py-20">
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent dark:via-blue-400/30" />
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hero-copy relative z-10">
          <h1 className="max-w-3xl text-balance font-heading text-5xl font-extrabold leading-[0.9] tracking-[-0.04em] text-slate-950 sm:text-6xl md:text-7xl dark:text-white">Tap through the catalog before you commit.</h1>
          <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-slate-700 sm:text-lg sm:leading-8 dark:text-slate-300">Preview each ZoeLit pick, keep the product path visible, and move from discovery to cart, checkout, and account review without losing context.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild href="/products" className="hero-primary-button">Shop collection <ArrowRight className="size-4" /></Button><Button asChild href={`/products/${activeProduct.id}`} variant="outline" className="bg-white/70 backdrop-blur dark:bg-slate-950/45">View {activeProduct.category}</Button></div>
        </div>
        <div className="hero-catalog relative z-10" aria-label="Featured ZoeLit products" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)}>
          <div className="hero-flow-panel">
            <div className="hero-flow-sidebar" aria-label="Choose a featured product">
              {products.map((product, index) => {
                const isActive = index === activeIndex;

                return (
                  <button key={product.id} type="button" className="hero-picker" aria-pressed={isActive} onClick={() => selectProduct(index)}>
                    <span className="hero-picker-count">0{index + 1}</span>
                    <span className="hero-picker-thumb"><Image src={product.image} alt="" width={104} height={104} className="h-full w-full object-cover" /></span>
                    <span className="min-w-0 text-left"><span className="block truncate font-heading text-sm font-extrabold tracking-[-0.02em]">{product.name}</span><span className="mt-0.5 block text-xs font-extrabold text-blue-700 dark:text-blue-200">${product.price}</span></span>
                  </button>
                );
              })}
            </div>
            <div className="hero-product-stage">
              <div className="hero-stage-meter" aria-hidden="true"><span style={{ transform: `scaleX(${(activeIndex + 1) / products.length})` }} /></div>
              <div className="hero-image-shell" key={activeProduct.id}>
                <Image src={activeProduct.image} alt={activeProduct.name} width={860} height={960} priority className="h-full w-full object-cover" />
              </div>
              <div className="hero-product-note">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-200">{activeProduct.category}</p>
                  <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white">{activeProduct.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">{activeProduct.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-700 px-3 py-2 text-sm font-extrabold text-white dark:bg-blue-600">${activeProduct.price}</span>
                  <Link href={`/products/${activeProduct.id}`} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500"><ShoppingBag className="size-4" />Product details</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
