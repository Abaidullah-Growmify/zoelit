"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAdminNotifications, registerAdminPushToken } from "@/lib/api";
import { getAdminPushToken, listenForAdminMessages } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export function AdminNotificationListener() {
  const admin = useAdminAuthStore((state) => state.admin);
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    if (!admin || !token) return undefined;
    let unsubscribe = () => {};
    let active = true;
    const knownEvents = new Set();
    const announcedTags = new Set();
    const announcedEvents = new Set();

    function wasAnnounced(eventId, tag) {
      if (!eventId || announcedEvents.has(eventId)) return true;
      if (tag && announcedTags.has(tag)) return true;
      try {
        // localStorage shares the dedupe marker between open admin tabs. A
        // session-only marker would let every tab announce the same event.
        if (localStorage.getItem(`zoelit-admin-notification-${eventId}`) === "1") return true;
        localStorage.setItem(`zoelit-admin-notification-${eventId}`, "1");
      } catch {
        // In-memory deduplication still protects this tab when storage is unavailable.
      }
      announcedEvents.add(eventId);
      if (tag) announcedTags.add(tag);
      return false;
    }

    function announce(payload, eventId) {
      const title = payload.notification?.title || payload.data?.title || "New notification";
      const body = payload.notification?.body || payload.data?.body || "You have a new admin notification.";
      // A notification toast always opens the notification history. The
      // notification detail page can still show a related order separately.
      const url = "/admin/notifications";
      const tag = payload.data?.tag || (payload.data?.entityId ? `zoelit-entity-${payload.data.entityId}` : `zoelit-${eventId || Date.now()}`);
      if (wasAnnounced(eventId, tag)) return;
      // System notifications are rendered only by the Firebase service
      // worker. Creating another `new Notification()` here duplicates every
      // push while the admin page is open.
      toast(title, {
        description: body,
        action: { label: "View", onClick: () => router.push(url) },
        classNames: {
          actionButton: "!bg-[#1d4ed8] !text-white hover:!bg-[#2563eb] focus-visible:!ring-[#1d4ed8]",
        },
      });
    }

    async function pollNotifications(initial = false) {
      try {
        const data = await getAdminNotifications(token, { limit: 20 });
        if (!active) return;
        for (const notification of data.notifications || []) {
          const eventId = notification.eventId || notification._id;
          if (initial) knownEvents.add(eventId);
          else if (!knownEvents.has(eventId)) {
            knownEvents.add(eventId);
            announce({
              notification: { title: notification.title, body: notification.body },
              data: { eventId, entityId: notification.entityId || "", url: "/admin/notifications" },
            }, eventId);
          }
        }
      } catch {
        // Push delivery remains responsible for background tabs when polling is unavailable.
      }
    }

    pollNotifications(true);
    const pollTimer = window.setInterval(() => pollNotifications(false), 5000);

    function syncPushToken() {
      getAdminPushToken({ requestPermission: false }).then((pushToken) => {
        if (!active || !pushToken) return null;
        return registerAdminPushToken({ token: pushToken, device: "web", browser: navigator.userAgent, platform: navigator.platform }, token)
          .then(() => window.dispatchEvent(new Event("zoelit-admin-push-token")));
      }).catch(() => {});
    }

    syncPushToken();
    // Firebase can rotate a browser token without a page reload. Refreshing the
    // registration keeps the DB row bound to this login session and recovers
    // automatically if the browser permission was granted after login.
    const pushSyncTimer = window.setInterval(syncPushToken, 10 * 60 * 1000);

    listenForAdminMessages((payload) => {
      const eventId = payload.data?.eventId || payload.data?.notificationId || `${payload.data?.type || "notification"}-${payload.data?.entityId || "unknown"}-${payload.notification?.title || payload.data?.title || "event"}`;
      knownEvents.add(eventId);
      announce(payload, eventId);
    }).then((cleanup) => {
      if (active) unsubscribe = cleanup;
      else cleanup();
    }).catch(() => {});

    return () => {
      active = false;
      window.clearInterval(pollTimer);
      window.clearInterval(pushSyncTimer);
      unsubscribe();
    };
  }, [admin, router, token]);

  return null;
}
