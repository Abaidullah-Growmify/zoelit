import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CustomerAuthGate } from "@/components/customer-auth-gate";

export default function ShopLayout({ children }) {
  return <CustomerAuthGate><SiteHeader /><main>{children}</main><SiteFooter /></CustomerAuthGate>;
}
