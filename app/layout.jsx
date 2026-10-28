import { Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { StoreConfigProvider } from "@/components/store-config-provider";
import { StoreHydration } from "@/components/store-hydration";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-display", subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "ZoeLit Commerce | Premium Online Store",
  description: "A premium e-commerce storefront with account dashboard, cart, checkout, and order management.",
  icons: {
    icon: "/zoelit_favicon_clean_padded.png",
    shortcut: "/zoelit_favicon_clean_padded.png",
    apple: "/zoelit_favicon_clean_padded.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/zoelit_favicon_clean_padded.png?v=4" />
        <link rel="shortcut icon" type="image/png" href="/zoelit_favicon_clean_padded.png?v=4" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,0,0&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fira+Sans:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Manrope:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto+Slab:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Rubik:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&family=Ubuntu:wght@400;500;700&family=Work+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-body-md text-on-surface antialiased"
        suppressHydrationWarning
      >
        <NextTopLoader color="#2563eb" initialPosition={0.08} crawlSpeed={200} height={3} crawl showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #2563eb,0 0 5px #2563eb" zIndex={1600} showForHashAnchor={false} />
        <ReduxProvider>
          <StoreHydration />
          <StoreConfigProvider>{children}</StoreConfigProvider>
          <Toaster closeButton richColors position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  );
}
