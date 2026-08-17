import { Inter, Sora } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { StoreHydration } from "@/components/store-hydration";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

const sora = Sora({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata = {
  title: "ZoeLit Commerce | Premium Online Store",
  description: "A premium e-commerce storefront with account dashboard, cart, checkout, and order management.",
};

const themeScript = `
(() => {
  try {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (_) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <StoreHydration />
          {children}
          <Toaster closeButton richColors position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
