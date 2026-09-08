"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { subscribeNewsletter } from "@/lib/api";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "" });

    try {
      const data = await subscribeNewsletter({ email });
      setStatus({ type: "success", message: data.message || "Subscription confirmed." });
      setEmail("");
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not complete your subscription." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-outline-variant/70 bg-surface-container-low p-3 shadow-sm dark:bg-surface-container" aria-label="Subscribe for latest trends and offers">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input type="email" name="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" aria-label="Email address" className="h-12 flex-1 bg-surface-container-lowest" />
        <Button type="submit" disabled={status.type === "loading"} className="h-12 px-6 text-white">
          {status.type === "loading" ? "Subscribing..." : "Subscribe"}
          {status.type !== "loading" ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
      <p className={`mt-3 text-label-sm font-medium leading-5 ${status.type === "error" ? "text-error" : status.type === "success" ? "text-emerald-600" : "text-on-surface-variant"}`} role={status.type === "idle" ? undefined : "status"}>
        {status.message || "No spam. Just ZoeLit picks, offers, and product updates."}
      </p>
    </form>
  );
}
