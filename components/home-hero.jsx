"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui";
import { money } from "@/lib/utils";

export function HomeHero({ products }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const swipeStart = useRef(null);

  const goTo = (index) => {
    setIsPaused(true);
    startTransition(() =>
      setActiveIndex(
        ((index % products.length) + products.length) % products.length
      )
    );
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  useEffect(() => {
    if (isPaused || !products || products.length < 2) return undefined;

    const interval = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((index) => (index + 1) % products.length);
      });
    }, 4600);

    return () => window.clearInterval(interval);
  }, [isPaused, products]);

  if (!products || products.length === 0) return null;

  const activeProduct = products[activeIndex];

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  function handleKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  }

  function handlePointerDown(event) {
    swipeStart.current = event.clientX;
  }

  function handlePointerUp(event) {
    if (swipeStart.current == null) return;

    const delta = event.clientX - swipeStart.current;

    if (Math.abs(delta) > 48) {
      if (delta > 0) prev();
      else next();
    }

    swipeStart.current = null;
  }

  return (
    <section className="hero-stage relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="hero-orb hero-orb-one" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent dark:via-blue-400/30" />

      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch lg:gap-16">
        <div className="hero-copy relative z-10">
          <h1 className="max-w-3xl text-balance font-heading text-[2.9rem] font-extrabold leading-[0.96] tracking-[-0.04em] text-slate-950 sm:text-6xl md:text-7xl dark:text-white">
            A small catalog,
            <br />
            <span className="text-blue-700 dark:text-blue-300">
              chosen to feel considered.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-slate-700 sm:text-lg sm:leading-8 dark:text-slate-300">
            Preview each ZoeLit pick front and center, compare four with a tap,
            then move straight from discovery to cart and checkout without ever
            losing context.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              href="/products"
              className="hero-primary-button group"
            >
              Shop the collection
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>

            <Button
              asChild
              href="/products"
              variant="outline"
              className="bg-white/70 backdrop-blur dark:bg-slate-950/45"
            >
              Browse by category
            </Button>
          </div>
        </div>

        <div
          className="hero-stage-panel relative z-10 outline-none"
          tabIndex={0}
          aria-label="Featured ZoeLit products carousel"
          onKeyDown={handleKeyDown}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
        >
          <div
            className="hero-spotlight group"
            role="tabpanel"
            id="hero-spotlight"
            aria-label={`Featured product: ${activeProduct.name}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <div className="hero-spotlight-frame" key={activeProduct.id}>
              <Image
                src={activeProduct.image}
                alt={activeProduct.name}
                width={860}
                height={1000}
                priority
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
              />
            </div>

            <div
              className="hero-spotlight-chip rounded-sm"
              aria-hidden="true"
            >
              Featured pick
            </div>

            <div className="hero-nav">
              <button
                type="button"
                className="hero-nav-btn"
                onClick={prev}
                aria-label="Previous featured product"
              >
                <ArrowLeft className="size-4" />
              </button>

              <button
                type="button"
                className="hero-nav-btn"
                onClick={next}
                aria-label="Next featured product"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>

            <Link
              href={`/products/${activeProduct.id}`}
              className="hero-spotlight-action overflow-hidden"
              aria-label={`Open ${activeProduct.name} product details`}
            >
              <span className="hero-spotlight-action-copy min-w-0 flex-1">
                <span className="block text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-200">
                  {activeProduct.category}
                </span>

                <span className="mt-1 block truncate font-heading text-xl font-extrabold tracking-[-0.03em] text-slate-950 dark:text-white">
                  {activeProduct.name}
                </span>

                <span className="mt-1 block whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {money(activeProduct.price)}
                </span>
              </span>

              <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-slate-950 text-white transition-transform duration-200 group-hover:translate-x-0.5 dark:bg-blue-600">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </div>

          <div
            className="hero-strip"
            role="tablist"
            aria-label="Choose a featured product"
          >
            {products.map((product, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={product.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="hero-spotlight"
                  className="hero-strip-item group"
                  onClick={() => goTo(index)}
                >
                  <span className="hero-strip-thumb" aria-hidden="true">
                    <Image
                      src={product.image}
                      alt=""
                      width={112}
                      height={112}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>

                  <span className="hero-strip-count" aria-hidden="true">
                    0{index + 1}
                  </span>

                  <span className="flex min-w-0 flex-col text-left">
                    <span className="truncate font-heading text-h3 font-extrabold leading-tight tracking-[-0.02em] text-slate-950 dark:text-white">
                      {product.name}
                    </span>

                    <span className="mt-1 whitespace-nowrap text-meta font-semibold text-slate-600 dark:text-slate-300">
                      {money(product.price)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}