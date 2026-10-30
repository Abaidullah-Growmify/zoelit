"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardSectionBanner } from "@/components/dashboard-section-banner";
import { Button, Card, ErrorText, Input, Label, Textarea } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(11, "Phone is required"),
  company: z.string().min(2, "Company is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

const contactItems = [
  { icon: Mail, title: "Email support", lines: ["info@zoelit.com"] },
  { icon: Phone, title: "Call us", lines: ["+44 749637 9004", "+44 161 791 5621", "+92 3007404044"] },
  { icon: Clock3, title: "Response time", lines: ["Usually within one business day"] },
];

export default function ContactPage() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", company: "", message: "" } });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    form.reset();
    toast.success("Message sent. Our support team will reply soon.");
  }

  return (
    <section className="container-page py-6 sm:py-10 lg:py-14">
      <div className="mb-6 lg:mb-8">
        <DashboardSectionBanner eyebrow="Contact / Support" title="We’re here to help" description="Have a question about a product, order, or account? Our support team is ready to help." />
      </div>
      <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="grid min-w-0 content-start gap-3">
          {contactItems.map((item) => (
            <Card key={item.title} className="flex items-start gap-3 border-outline-variant/70 p-4 shadow-sm sm:p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></div>
              <div>
                <h2 className="text-base font-bold text-on-surface">{item.title}</h2>
                <div className="mt-1 grid gap-0.5 text-sm leading-5 text-on-surface-variant">
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          <Card className="border-primary/20 bg-primary p-4 text-white shadow-sm sm:p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-5 shrink-0" />
              <div><h2 className="text-base font-bold">Need product advice?</h2><p className="mt-1 text-sm leading-5 text-white/80">Tell us what you are looking for and our team will point you in the right direction.</p><Link href="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-white/80">Browse products <ArrowRight className="size-4" /></Link></div>
            </div>
          </Card>
        </div>

        <Card className="min-w-0 border-outline-variant/70 p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MessageCircle className="size-5" /></div>
            <div><h2 className="font-heading text-xl font-bold text-on-surface sm:text-2xl">Send a message</h2><p className="mt-1 text-sm leading-6 text-on-surface-variant">Share a few details and our support team will get back to you.</p></div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Full name" name="name" placeholder="Enter your name" form={form} />
          <Field label="Email" name="email" type="email" placeholder="Enter your email" form={form} />
          <Field label="Mobile no" name="phone" type="tel" placeholder="Mobile no" form={form} />
          <Field label="Company" name="company" placeholder="Company" form={form} />
          <div className="md:col-span-2">
            <Label>Message</Label>
            <Textarea {...form.register("message")} rows={4} placeholder="Your message" />
            <ErrorText>{form.formState.errors.message?.message}</ErrorText>
          </div>
          <Button disabled={form.formState.isSubmitting} className="w-full md:col-span-2 sm:w-fit">{form.formState.isSubmitting ? "Sending..." : "Send Message"}</Button>
          </form>
        </Card>
      </div>
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Locations</p>
        <h2 className="mt-1 font-heading text-xl font-bold text-on-surface">Come and visit our offices</h2>
        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
          <Card className="border-outline-variant/70 p-5 shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MapPin className="size-5" /></div><div><h3 className="text-sm font-bold text-on-surface">UK Office</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">66 Seymour Grove, Old Trafford, Manchester, M16 0LN, England</p><p className="mt-1 text-sm text-on-surface-variant">info@zoelit.com · +44 161 791 5621</p></div></div></Card>
          <Card className="border-outline-variant/70 p-5 shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MapPin className="size-5" /></div><div><h3 className="text-sm font-bold text-on-surface">Pakistan Office</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">123 - CC - Citi Housing Society, Gujranwala, 52310, Pakistan</p><p className="mt-1 text-sm text-on-surface-variant">info@zoelit.com · +92 3007404044</p></div></div></Card>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, form, type = "text", placeholder, className }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} {...form.register(name)} />
      <ErrorText>{form.formState.errors[name]?.message}</ErrorText>
    </div>
  );
}
