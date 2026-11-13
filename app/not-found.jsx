import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute left-[8%] top-[15%] size-56 rounded-full bg-primary/10 blur-3xl animate-pulse sm:size-80" />
          <div className="absolute bottom-[8%] right-[5%] size-64 rounded-full bg-blue-200/30 blur-3xl animate-pulse [animation-delay:700ms] sm:size-96" />
          <div className="absolute left-1/2 top-1/2 size-[min(80vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
        </div>

        <section className="w-full max-w-2xl text-center">
          <div className="relative mx-auto mt-8 w-fit">
            <span className="select-none font-heading text-[clamp(7rem,30vw,13rem)] font-black leading-none tracking-[-0.1em] text-primary/10">404</span>
            <span className="absolute inset-0 grid place-items-center font-heading text-6xl font-black tracking-tight text-primary sm:text-8xl">404</span>
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">Page not found</p>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-on-surface sm:text-5xl">This page took a wrong turn.</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-on-surface-variant sm:text-base">
            The page you are looking for may have moved, been removed, or never existed. Let us help you find your way back.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-container">
              Browse the Store <ArrowRight className="size-4" />
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-5 py-3 text-sm font-bold text-on-surface transition hover:border-primary hover:text-primary">
              <Home className="size-4" /> Go home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
