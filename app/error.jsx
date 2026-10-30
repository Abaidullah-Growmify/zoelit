"use client";

export default function Error({ reset }) {
  return (
    <main className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <section className="w-full max-w-lg rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Something went wrong</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold text-on-surface">We could not load this page</h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">Please try again. If the problem continues, come back a little later.</p>
        <button type="button" onClick={() => reset()} className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-container">
          Try again
        </button>
      </section>
    </main>
  );
}
