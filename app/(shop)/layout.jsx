import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/components/cart-drawer";

export default function ShopLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#f4f4f5] shadow-[0_4px_40px_rgba(17,24,39,0.04)] dark:bg-slate-950 dark:shadow-none">{children}</main>
      <CartDrawer />
      <SiteFooter />
    </div>
  );
}
