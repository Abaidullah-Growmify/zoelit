import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Button, Card } from "@/components/ui";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(135deg,#ffffff,#f8fafc)] py-20 dark:bg-[radial-gradient(circle_at_top_left,#1e3a8a,transparent_32%),linear-gradient(135deg,#020617,#0f172a)]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">New season essentials</span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl dark:text-white">Premium commerce, crafted for trust.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Shop refined everyday products with fast checkout, persistent cart, account dashboard, and a polished customer experience.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild href="/products">Shop Collection <ArrowRight className="size-4" /></Button><Button asChild href="/dashboard" variant="outline">View Dashboard</Button></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.slice(0, 4).map((product, index) => <Card key={product.id} className={`p-4 ${index % 2 ? "sm:translate-y-8" : ""}`}><Image src={product.image} alt={product.name} width={500} height={500} className="aspect-square w-full rounded-2xl object-cover" /><p className="mt-3 font-bold">{product.name}</p></Card>)}
          </div>
        </div>
      </section>
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4"><div><p className="font-bold text-blue-600">Featured</p><h2 className="text-3xl font-black">Customer favorites</h2></div><Link href="/products" className="font-bold text-blue-600">View all</Link></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
      <section className="container-page grid gap-4 pb-16 md:grid-cols-3">{[{ icon: Truck, title: "Fast fulfillment", text: "Reliable shipping with live tracking on eligible orders." }, { icon: ShieldCheck, title: "Secure checkout", text: "Validation-first checkout and trusted account flows." }, { icon: Sparkles, title: "Premium support", text: "Helpful states, clear actions, and friendly recovery paths." }].map((item) => <Card key={item.title}><item.icon className="size-8 text-blue-600" /><h3 className="mt-5 font-black">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p></Card>)}</section>
    </>
  );
}
