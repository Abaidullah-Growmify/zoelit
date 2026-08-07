"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, Card, ErrorText, Input, Label, PageHeader, SectionHeader } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(11, "Phone is required"),
  company: z.string().min(2, "Company is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

const contactItems = [
  { icon: Phone, title: "Contact", lines: ["info@zoelit.com", "+44 749637 9004", "+44 161 791 5621", "+92 3007404044"] },
  { icon: MapPin, title: "Location", lines: ["66 Seymour Grove, Old Trafford, Manchester, M16 0LN, England", "123 - CC - Citi Housing Society, Gujranwala, 52310, Pakistan"] },
];

const locations = [
  {
    title: "UK Office",
    email: "info@zoelit.com",
    tel: "+44 161 791 5621",
    address: "66 Seymour Grove, Old Trafford, Manchester, M16 0LN, England",
  },
  {
    title: "Pakistan Office",
    email: "info@zoelit.com",
    tel: "+92 3007404044",
    address: "123 - CC - Citi Housing Society, Gujranwala, 52310, Pakistan",
  },
];

const socialLinks = [
  { href: "http://facebook.com", label: "Facebook" },
  { href: "http://twitter.com", label: "Twitter" },
  { href: "https://www.linkedin.com/", label: "Linkedin" },
  { href: "https://www.youtube.com/", label: "Youtube" },
];

export default function ContactPage() {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", company: "", message: "" } });

  async function onSubmit() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    form.reset();
    toast.success("Message sent. Our support team will reply soon.");
  }

  return (
    <section className="container-page py-12">
      <PageHeader
        eyebrow="Get to know us"
        title="Have a project in mind? Let's talk."
        description="Contact Zoel IT LTD for enquiries, support, office details, or product questions. Send us a message and we will help you quickly."
        align="center"
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="grid gap-4">
          {contactItems.map((item) => (
            <Card key={item.title} className="flex items-start gap-4 shadow-none">
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10"><item.icon className="size-5" /></div>
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <div className="mt-1 grid gap-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          <Card className="shadow-none">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10"><MessageCircle className="size-5" /></div>
              <div>
                <h2 className="font-bold">Social Media</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Follow on social media</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                  {socialLinks.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 transition hover:text-blue-700 dark:text-blue-300">
                      {link.label}<ExternalLink className="size-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
            <h2 className="text-2xl font-bold">Send a message</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Full name" name="name" placeholder="Enter your name" form={form} />
            <Field label="Email" name="email" type="email" placeholder="Enter your email" form={form} />
            <Field label="Mobile no" name="phone" type="tel" placeholder="Mobile no" form={form} />
            <Field label="Company" name="company" placeholder="Company" form={form} />
            <div className="md:col-span-2">
              <Label>Message</Label>
              <textarea {...form.register("message")} rows={6} placeholder="Your message" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50" />
              <ErrorText>{form.formState.errors.message?.message}</ErrorText>
            </div>
            <div className="md:col-span-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <label className="flex items-start gap-3 font-medium text-slate-700 dark:text-slate-200">
                <input type="checkbox" className="mt-1" />
                I am bound by the terms of the Service I accept Privacy Policy.
              </label>
              <p className="mt-3">
                By submitting this online enquiry you consent to the sharing of your information with and to be contacted by Zoel IT LTD for the purpose of responding to your enquiry. For further details on how we collect, use and disclose personal information you should refer to our <Link href="/privacy-policy" className="underline transition hover:text-blue-600">Privacy Policy</Link>.
              </p>
            </div>
            <Button disabled={form.formState.isSubmitting} className="md:col-span-2 w-fit">{form.formState.isSubmitting ? "Sending..." : "Send Message"}</Button>
          </form>
        </Card>
      </div>

      <div className="mt-14">
        <SectionHeader eyebrow="Locations" title="Come and visit our offices around the world" className="max-w-2xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {locations.map((location) => (
            <Card key={location.title} className="shadow-none">
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10"><MapPin className="size-5" /></div>
                <div>
                  <h3 className="font-bold">{location.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{location.address}</p>
                  <div className="mt-4 grid gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <a href={`mailto:${location.email}`} className="transition hover:text-blue-600">{location.email}</a>
                    <a href={`tel:${location.tel.replaceAll(" ", "")}`} className="transition hover:text-blue-600">{location.tel}</a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
