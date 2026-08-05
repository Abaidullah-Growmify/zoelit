import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { StoreHydration } from "@/components/store-hydration";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50"
        suppressHydrationWarning
      >
        <StoreHydration />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
