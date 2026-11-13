const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zoelit-frontend.vercel.app").replace(/\/$/, "");

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/checkout", "/cart", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
