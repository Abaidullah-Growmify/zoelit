import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/components/cart-drawer";

export default function ShopLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-[#F0F4FA] shadow-[0_4px_40px_rgba(0,0,0,0.06)]">{children}</main>
      <CartDrawer />
      <SiteFooter />
    </div>
  );
}
