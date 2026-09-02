import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { StoreHydration } from "@/components/store-hydration";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-display", subsets: ["latin"], weight: ["400", "600", "700"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });

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
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/zoelit_favicon_clean_padded.png?v=4" />
        <link rel="shortcut icon" type="image/png" href="/zoelit_favicon_clean_padded.png?v=4" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,0,0&display=swap"
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans text-body-md text-on-surface antialiased"
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
