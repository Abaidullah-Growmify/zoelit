import { Bell, CreditCard, Palette, Receipt, Settings, Truck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { Button, Card, Input, Label, Select } from "@/components/ui";

const sections = [
  { title: "Store information", icon: Settings, fields: ["Store name", "Store email", "Support phone", "Business address"] },
  { title: "Payment settings", icon: CreditCard, fields: ["Default payment provider", "Payment capture mode", "Statement descriptor"] },
  { title: "Shipping settings", icon: Truck, fields: ["Standard shipping fee", "Free shipping threshold", "Fulfillment region"] },
  { title: "Tax settings", icon: Receipt, fields: ["Default tax rate", "Tax region", "Tax ID"] },
  { title: "Notifications", icon: Bell, fields: ["Order alert email", "Low stock alert email", "Review moderation email"] },
  { title: "Theme settings", icon: Palette, fields: ["Primary color", "Storefront mode", "Banner message"] },
];

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader title="Settings" description="Static store configuration forms for business info, payment, shipping, tax, notifications, and theme preferences." />
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {sections.map((section) => <Card key={section.title}><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"><section.icon className="size-5" /></span><div><h2 className="text-xl font-black">{section.title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep this operational section ready for backend connection.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2">{section.fields.map((field, index) => <Field key={field} label={field}>{field.includes("mode") || field.includes("provider") ? <Select><option>Enabled</option><option>Manual</option><option>Disabled</option></Select> : <Input defaultValue={index === 0 && section.title === "Store information" ? "ZoeLit Commerce" : ""} placeholder={field} />}</Field>)}</div><Button className="mt-5">Save section</Button></Card>)}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>;
}
