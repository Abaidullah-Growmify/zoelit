import { getApps, initializeApp } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { API_URL } from "@/lib/api";

const environmentConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
};

let runtimeConfig = null;
let configPromise = null;

function hasRequiredConfig(config) {
  return Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId && config.vapidKey);
}

export async function loadFirebaseConfig() {
  if (runtimeConfig) return runtimeConfig;
  if (!configPromise) {
    configPromise = fetch(`${API_URL}/api/public/config`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const remote = data?.firebase || {};
        runtimeConfig = Object.fromEntries(Object.keys(environmentConfig).map((key) => [key, remote[key] || environmentConfig[key] || ""]));
        return runtimeConfig;
      })
      .catch(() => {
        runtimeConfig = environmentConfig;
        return runtimeConfig;
      });
  }
  return configPromise;
}

export async function getAdminPushToken({ requestPermission = true, refresh = false } = {}) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) return null;
  if (!(await isSupported())) return null;
  // Ask for permission before any network/config work. Chrome and Firefox only
  // show the prompt while the click/submit that triggered this call is still
  // an active user gesture.
  const permission = Notification.permission === "default" && requestPermission ? await Notification.requestPermission() : Notification.permission;
  if (permission !== "granted") return null;
  const firebaseConfig = await loadFirebaseConfig();
  if (!hasRequiredConfig(firebaseConfig)) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await registration.update();
  const messaging = getMessaging(app);
  if (refresh) {
    // A token can remain cached after its service-worker registration has been
    // invalidated by FCM. Delete it before registering the replacement token.
    await deleteToken(messaging).catch(() => {});
  }
  return getToken(messaging, { vapidKey: firebaseConfig.vapidKey, serviceWorkerRegistration: registration });
}

export async function requestAdminNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function clearAdminPushToken() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  try {
    const firebaseConfig = await loadFirebaseConfig();
    if (!hasRequiredConfig(firebaseConfig)) return false;
    if (!(await isSupported())) return false;
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    await deleteToken(getMessaging(app));
    return true;
  } catch {
    return false;
  }
}

export async function listenForAdminMessages(onNotification) {
  if (typeof window === "undefined" || !(await isSupported())) return () => {};
  const firebaseConfig = await loadFirebaseConfig();
  if (!hasRequiredConfig(firebaseConfig)) return () => {};
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return onMessage(getMessaging(app), onNotification);
}

export function isFirebaseWebConfigured(config = runtimeConfig || environmentConfig) {
  return hasRequiredConfig(config);
}
