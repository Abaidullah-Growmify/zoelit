import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }) {
  return <div className="flex min-h-screen flex-col"><SiteHeader /><main className="flex-1 bg-[#f8fafc]">{children}</main><SiteFooter /></div>;
}
