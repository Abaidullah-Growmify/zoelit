"use client";

import { useState } from "react";
import { CreditCard, Eye, EyeOff, Settings } from "lucide-react";
import { Button, Card, Input, Label, Select } from "@/components/ui";

const sections = [
  { title: "Store information", icon: Settings, fields: ["Store name", "Store email", "Support phone", "Business address"] },
  { title: "Stripe setting", icon: CreditCard, fields: ["Public key", "Private key", "Status"] },
];

export default function AdminSettingsPage() {
  const [visibleKeys, setVisibleKeys] = useState({ public: false, private: false });

  function toggleKey(name) {
    setVisibleKeys((current) => ({ ...current, [name]: !current[name] }));
  }

  return (
    <div>
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => <Card key={section.title}><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><section.icon className="size-4" /></span><div><h2 className="font-heading text-lg font-semibold tracking-tight text-on-surface">{section.title}</h2><p className="mt-1 text-sm text-on-surface-variant">Keep this operational section ready for backend connection.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2">{section.fields.map((field, index) => <Field key={field} label={field} className={field === "Status" ? "md:col-span-2" : ""}>{field === "Status" ? <Select className="w-full"><option>Active</option><option>Deactive</option></Select> : field === "Public key" ? <KeyInput name="public" visible={visibleKeys.public} onToggle={toggleKey} placeholder={field} /> : field === "Private key" ? <KeyInput name="private" visible={visibleKeys.private} onToggle={toggleKey} placeholder={field} /> : <Input defaultValue={index === 0 && section.title === "Store information" ? "ZoeLit Commerce" : ""} placeholder={field} />}</Field>)}</div><Button className="mt-5">Save section</Button></Card>)}
      </div>
    </div>
  );
}

function KeyInput({ name, visible, onToggle, placeholder }) {
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-10" placeholder={placeholder} />
      <button type="button" tabIndex={-1} onClick={() => onToggle(name)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition hover:text-primary" aria-label={visible ? `Hide ${placeholder}` : `Show ${placeholder}`}>
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function Field({ label, children, className }) {
  return <div className={className}><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
