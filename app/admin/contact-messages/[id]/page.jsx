"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui";
import { getAdminContactMessage } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { ContactMessageSkeleton } from "@/components/admin-contact-skeletons";

export default function AdminContactMessagePage({ params }) {
  const token = useAdminAuthStore((state) => state.token);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.resolve(params).then(({ id }) => getAdminContactMessage(id, token)).then((data) => setMessage(data.message)).catch((err) => setError(err.message || "Unable to load message"));
  }, [params, token]);

  if (error) return <section className="container-page py-8 text-error">{error}</section>;
  if (!message) return <ContactMessageSkeleton />;

  return <section className="container-page py-0"><Card className="overflow-hidden p-0"><div className="bg-surface-container-low/40"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Admin / Support</p><h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Contact message</h1><p className="mt-1.5 text-sm text-on-surface-variant">Reference {message.referenceNumber || "—"}</p></div><div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[.75fr_1.25fr]"><div><h2 className="font-heading text-lg font-bold text-on-surface">Contact information</h2><div className="mt-5 grid gap-4 text-sm"><Info icon={Mail} label="Email" value={message.email} href={`mailto:${message.email}`} /><Info icon={Phone} label="Phone" value={message.phone || "Not provided"} href={message.phone ? `tel:${String(message.phone).replaceAll(" ", "")}` : undefined} /><Info icon={MapPin} label="Company" value={message.company || "Not provided"} /></div></div><div className="border-t border-outline-variant/70 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">{message.subject || "General support"}</p><h2 className="mt-2 font-heading text-xl font-bold text-on-surface">Message details</h2><div className="mt-5 whitespace-pre-wrap rounded-lg bg-surface-container-low p-4 text-sm leading-7 text-on-surface">{message.message}</div><p className="mt-4 text-xs text-on-surface-variant">Received {message.createdAt ? new Date(message.createdAt).toLocaleString() : "—"}</p></div></div></Card></section>;
}

function Info({ icon: Icon, label, value, href }) {
  return <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></span><div><p className="text-xs text-on-surface-variant">{label}</p>{href ? <a href={href} className="mt-1 block font-medium text-primary hover:underline">{value}</a> : <p className="mt-1 font-medium text-on-surface">{value}</p>}</div></div>;
}
