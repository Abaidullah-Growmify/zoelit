import { NextResponse } from "next/server";

export function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const script = `importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js", "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
 self.addEventListener("install", () => self.skipWaiting());
 self.addEventListener("activate", (event) => event.waitUntil(
   clients.claim().then(() => self.registration.getNotifications().then((items) => items.forEach((item) => item.close())))
 ));
  let config = ${JSON.stringify(config)};
  const apiUrl = ${JSON.stringify(apiUrl)};
  const seenEvents = new Set();
 self.addEventListener("push", (event) => {
     event.waitUntil((async () => {
       let payload = {};
       try { payload = event.data ? event.data.json() : {}; } catch { return; }
       const data = payload.data || {};
       const notification = payload.notification || {};
       const title = notification.title || data.title || "ZoeLit notification";
       const body = notification.body || data.body || "You have a new admin notification.";
        // Keep one visible card per order/entity. Later status events replace
        // the earlier card instead of stacking several cards for one order.
        const tag = data.tag || (data.entityId ? "zoelit-entity-" + data.entityId : data.eventId ? "zoelit-" + data.eventId : "zoelit-admin-notification");
         const existing = await self.registration.getNotifications({ tag });
         if (data.eventId && seenEvents.has(data.eventId)) return;
         const sameEvent = existing.filter((item) => item.data?.eventId && item.data.eventId === data.eventId);
         if (sameEvent.length) {
           sameEvent.slice(1).forEach((item) => item.close());
           if (data.eventId) seenEvents.add(data.eventId);
           return;
         }
         if (data.eventId) seenEvents.add(data.eventId);
         existing.forEach((item) => item.close());
         // The service worker is the single owner of system notifications.
         // Keep the alert in the tray until the admin clicks or dismisses it.
         await self.registration.showNotification(title, { body, icon: "/zoelit_favicon_clean_padded.png", badge: "/zoelit_favicon_clean_padded.png", requireInteraction: true, tag, renotify: false, data });
     })());
  });
 self.addEventListener("notificationclick", (event) => {
    event.notification.close();
     const url = new URL("/admin/notifications", self.location.origin).href;
    event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => "focus" in client);
      if (existing) { existing.navigate(url); return existing.focus(); }
      return clients.openWindow(url);
    }));
 });
 fetch(apiUrl + "/api/public/config", { cache: "no-store" }).then((response) => response.json()).then((data) => {
   const remote = data.firebase || {};
   config = { ...config, ...remote };
   if (config.projectId && config.messagingSenderId && config.appId) {
     firebase.initializeApp(config);
     firebase.messaging();
   }
 }).catch(() => {});`;
  return new NextResponse(script, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store" } });
}
