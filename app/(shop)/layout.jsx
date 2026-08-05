import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ShopLayout({ children }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>;
}
