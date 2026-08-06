import { CheckCircle2, Eye } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function OrderSuccessPage() {
  return <section className="container-page grid min-h-[70vh] place-items-center py-12"><Card className="max-w-xl text-center"><CheckCircle2 className="mx-auto size-16 text-emerald-500" /><h1 className="mt-6 text-4xl font-black">Order confirmed</h1><p className="mt-4 text-slate-500 dark:text-slate-400">Thanks for shopping with ZoeLit. Your confirmation and tracking updates will appear in your account dashboard.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild href="/dashboard/orders" aria-label="Open orders"><Eye className="size-4" /></Button><Button asChild href="/products" variant="outline">Continue Shopping</Button></div></Card></section>;
}
