"use client";

import { Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { customer } from "@/lib/data";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";

export default function ProfilePage() {
  const form = useForm({ defaultValues: customer });
  function onSubmit() { toast.success("Profile changes saved"); }
  return <div><PageHeader eyebrow="Account" title="Profile" description="Keep your personal details and password settings up to date." /><Card className="mt-8"><div className="flex items-center gap-5"><div className="grid size-24 place-items-center rounded-full bg-blue-100 text-2xl font-extrabold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">AS</div><Button variant="outline"><Camera className="size-4" />Upload Photo</Button></div><form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5 md:grid-cols-2"><Field label="Full Name" name="name" form={form} /><Field label="Email" name="email" form={form} /><Field label="Phone" name="phone" form={form} /><div /><div className="mt-4 border-t border-slate-200 pt-6 md:col-span-2 dark:border-slate-800"><h2 className="text-xl font-bold">Change password</h2></div><Field label="Current Password" name="currentPassword" type="password" form={form} /><Field label="New Password" name="newPassword" type="password" form={form} /><Button className="w-fit md:col-span-2">Save Changes</Button></form></Card></div>;
}

function Field({ label, name, form, type = "text" }) {
  return <div><Label>{label}</Label><Input type={type} {...form.register(name)} /></div>;
}
