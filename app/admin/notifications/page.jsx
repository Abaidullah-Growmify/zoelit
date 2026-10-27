"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CircleAlert, Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Skeleton } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table";
import Pagination from "@/components/pagination";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { deleteAdminNotification, getAdminNotificationStatus, getAdminNotifications, markAllAdminNotificationsRead, registerAdminPushToken } from "@/lib/api";
import { getAdminPushToken, isFirebaseWebConfigured, loadFirebaseConfig } from "@/lib/firebase";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const PAGE_SIZE = 10;

export default function AdminNotificationsPage() {
  const router = useRouter();
  const token = useAdminAuthStore((state) => state.token);
  const [notifications, setNotifications] = useState(null);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [frontendConfigured, setFrontendConfigured] = useState(() => isFirebaseWebConfigured());

  useEffect(() => {
    loadFirebaseConfig().then((config) => setFrontendConfigured(isFirebaseWebConfigured(config)));
  }, []);

  useEffect(() => {
    const refreshStatus = () => setRefreshKey((current) => current + 1);
    window.addEventListener("zoelit-admin-push-token", refreshStatus);
    return () => window.removeEventListener("zoelit-admin-push-token", refreshStatus);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    getAdminNotificationStatus(token).then((statusData) => {
      if (!cancelled) setStatus(statusData);
    }).catch((error) => {
      if (!cancelled) {
        setSetupError(error.message || "Could not verify notification setup");
        toast.error(error.message || "Could not verify notification setup");
      }
    });
    return () => { cancelled = true; };
  }, [token, refreshKey]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    getAdminNotifications(token, {
      page,
      limit: PAGE_SIZE,
      unread: filter === "unread" ? "true" : undefined,
    }).then((data) => {
      if (cancelled) return;
      const pagination = data.pagination || {};
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
      setTotalItems(pagination.total || 0);
      setTotalPages(Math.max(1, pagination.totalPages || 1));
      if (filter === "all") setAllTotal(pagination.total || 0);
      setSetupError("");
    }).catch((error) => {
      if (cancelled) return;
      setSetupError(error.message || "Could not load notifications");
      toast.error(error.message || "Could not load notifications");
      setNotifications([]);
    }).finally(() => {
      if (!cancelled) setListLoading(false);
    });
    return () => { cancelled = true; };
  }, [filter, page, refreshKey, token]);

  if (!status || notifications === null) return <NotificationPageLoading />;

  async function enableNotifications() {
    setEnabling(true);
    setSetupError("");
    try {
      if (!isFirebaseWebConfigured() || !status?.firebaseConfigured) {
        throw new Error("Firebase notification setup is incomplete. Check the frontend and backend credentials.");
      }
      if (getBrowserPermission() === "denied") {
        throw new Error("Chrome has blocked notifications for this site. Enable them from Chrome Site Settings, then try again.");
      }
       const pushToken = await getAdminPushToken({ refresh: true });
      if (!pushToken) throw new Error("Browser permission was not granted or push notifications are not supported in this browser.");
      await registerAdminPushToken({ token: pushToken, device: "web", browser: navigator.userAgent, platform: navigator.platform }, token);
      toast.success("Browser notifications enabled");
      setStatus((current) => ({ ...current, tokenRegistered: true, tokenLastSeenAt: new Date().toISOString() }));
    } catch (error) {
      setSetupError(error.message || "Could not register browser notifications");
      toast.error(error.message || "Could not enable browser notifications");
    } finally {
      setEnabling(false);
    }
  }

  async function markAllRead() {
    try {
      await markAllAdminNotificationsRead(token);
      setUnread(0);
      setPage(1);
      setListLoading(true);
      setRefreshKey((current) => current + 1);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message || "Could not mark notifications as read");
    }
  }

  function deleteNotification(notification) {
    setDeleteTarget(notification);
  }

  async function confirmDeleteNotification() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminNotification(deleteTarget._id, token);
      if (!deleteTarget.isRead) setUnread((current) => Math.max(0, current - 1));
      setDeleteTarget(null);
      setListLoading(true);
      if (notifications.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefreshKey((current) => current + 1);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(error.message || "Could not delete notification");
    } finally {
      setDeleting(false);
    }
  }

  const browserPermission = getBrowserPermission();
  const backendConfigured = Boolean(status?.firebaseConfigured);
  const tokenRegistered = Boolean(status?.tokenRegistered);
  const firebaseReady = frontendConfigured && backendConfigured;
  const alertsEnabled = firebaseReady && browserPermission === "granted" && tokenRegistered;
  const visibleNotifications = notifications || [];
  const displayTotal = filter === "all" ? allTotal : totalItems;
  const showingStart = totalItems ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min((page - 1) * PAGE_SIZE + visibleNotifications.length, totalItems);

  function changeFilter(nextFilter) {
    if (nextFilter === filter) return;
    setFilter(nextFilter);
    setPage(1);
    setListLoading(true);
  }

  function changePage(nextPage) {
    if (nextPage === page) return;
    setListLoading(true);
    setPage(nextPage);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden p-0">
         <div className="bg-surface-container-low/40 p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
             <div className="min-w-0 max-w-2xl">
             <h1 className="text-balance font-heading text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">Notifications</h1>
             <p className="mt-1.5 max-w-xl text-sm leading-6 text-on-surface-variant">Stay ahead of orders, payments, fulfilment issues, and customer activity from one focused workspace.</p>
            </div>
            <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:items-center">
              {unread > 0 ? <Button onClick={markAllRead} className="w-full sm:w-auto"><CheckCheck className="size-4" /> Mark all read</Button> : null}
               {!alertsEnabled ? <Button variant="outline" onClick={enableNotifications} disabled={enabling || !firebaseReady || browserPermission === "denied"} className="w-full sm:w-auto">{enabling ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} {enabling ? "Enabling..." : browserPermission === "denied" ? "Permission blocked" : "Enable browser alerts"}</Button> : null}
            </div>
          </div>
          <div className="relative mt-6 grid gap-2 sm:grid-cols-3">
            <SummaryStat label="Unread" value={unread} tone="primary" />
            <SummaryStat label="Total activity" value={allTotal} />
             <SummaryStat label="Delivery" value={!firebaseReady ? "Setup needed" : tokenRegistered ? "Ready" : "Token needed"} tone={firebaseReady && tokenRegistered ? "success" : "warning"} />
          </div>
        </div>

          {!alertsEnabled ? <div className="px-4 pt-4 sm:px-6"><NotificationSetupPanel frontendConfigured={frontendConfigured} backendConfigured={backendConfigured} browserPermission={browserPermission} tokenRegistered={tokenRegistered} setupError={setupError} enabling={enabling} onEnable={enableNotifications} /></div> : null}
          <div className="mt-5 flex items-center overflow-x-auto border-b border-outline-variant/80"><button type="button" onClick={() => changeFilter("all")} className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${filter === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>All <span className="ml-1">({allTotal})</span></button><button type="button" onClick={() => changeFilter("unread")} className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${filter === "unread" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>Unread <span className="ml-1">({unread})</span></button></div>
          <div className="pt-5">
            {listLoading ? <NotificationLoading /> : visibleNotifications.length ? <><div className="hidden grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] gap-4 border-b border-outline-variant/60 bg-surface-container-low/45 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant sm:grid"><span>#</span><span>Notification</span><span>Details</span><span>Received</span><span className="text-center">Action</span></div><div className="divide-y divide-outline-variant/60">{visibleNotifications.map((notification, index) => <NotificationRow key={notification._id} index={(page - 1) * PAGE_SIZE + index + 1} notification={notification} onDelete={deleteNotification} onView={() => router.push(`/admin/notifications/${notification._id}`)} />)}</div></> : <NotificationEmptyState unreadFilter={filter === "unread"} />}
          </div>
          {!listLoading && totalPages > 1 ? <div className="flex flex-col gap-3 border-t border-outline-variant/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs text-on-surface-variant">Showing {showingStart}-{showingEnd} of {displayTotal}</p><Pagination page={page} totalPages={totalPages} onPageChange={changePage} className="w-full justify-center sm:w-auto sm:justify-end" /></div> : null}
       </Card>
       <ConfirmActionDialog open={Boolean(deleteTarget)} title="Delete notification?" message="This notification will be permanently removed from the notification history." confirmLabel="Delete notification" cancelLabel="Keep notification" loading={deleting} onCancel={() => { if (!deleting) setDeleteTarget(null); }} onConfirm={confirmDeleteNotification} />
       <TransparentActionLoader open={deleting} label="Deleting notification..." />
     </div>
  );
}

function NotificationRow({ notification, index, onDelete, onView }) {
  return (
    <div role="link" tabIndex={0} onClick={onView} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onView(); } }} className={`group grid min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 transition hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] sm:items-center sm:gap-4 sm:px-6 ${notification.isRead ? "" : "bg-primary/[0.035]"}`}>
      <span className="hidden text-sm font-semibold text-on-surface-variant sm:block">{index}</span>
       <span className="flex min-w-0 items-center"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="break-words text-sm font-semibold text-on-surface">{notification.title}</strong>{notification.isRead ? null : <span className="size-1.5 rounded-full bg-primary" />}</span><span className="mt-1 block text-xs text-on-surface-variant sm:hidden">{formatNotificationDate(notification.createdAt)}</span></span></span>
      <span className="col-span-2 min-w-0 break-words pl-12 text-sm leading-6 text-on-surface-variant sm:col-span-1 sm:pl-0">{notification.body}</span>
      <span className="hidden text-xs text-on-surface-variant sm:block">{formatNotificationDate(notification.createdAt)}</span>
       <span className="col-span-2 flex items-center justify-end sm:col-span-1 sm:justify-center" onClick={(event) => event.stopPropagation()}><AdminTableActions label={`Actions for ${notification.title}`} actions={[{ label: "View", icon: Eye, href: `/admin/notifications/${notification._id}`, ariaLabel: "View notification" }, { label: "Delete", icon: Trash2, tone: "danger", ariaLabel: "Delete notification", onClick: () => onDelete(notification) }]} /></span>
    </div>
  );
}

function NotificationSetupPanel({ frontendConfigured, backendConfigured, browserPermission, tokenRegistered, setupError, enabling, onEnable }) {
  if (setupError) return <div className="rounded-lg border border-rose-300/70 bg-rose-50/70 p-4 dark:bg-rose-500/10"><SetupMessage icon={CircleAlert} tone="error" title="Notification setup needs attention" body={setupError} /></div>;
  if (!frontendConfigured || !backendConfigured) return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 dark:bg-amber-500/10"><SetupMessage icon={CircleAlert} tone="warning" title="Firebase setup is incomplete" body="Push delivery is not ready. Check the Firebase web variables in the frontend and service-account variables in the backend. Stored notifications will still appear below." /></div>;
  if (browserPermission === "denied") return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 dark:bg-amber-500/10"><SetupMessage icon={CircleAlert} tone="warning" title="Browser permission is blocked" body="Chrome blocked notifications for this site. Open the lock icon in the address bar, open Site settings, set Notifications to Allow, then reload this page." /></div>;
  if (browserPermission === "granted" && tokenRegistered) return null;
  if (browserPermission === "granted") return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 dark:bg-amber-500/10"><div className="flex flex-wrap items-center justify-between gap-3"><SetupMessage icon={CircleAlert} tone="warning" title="Browser permission granted, registration incomplete" body="The browser allowed notifications, but this browser token is not registered with the admin account yet." /><Button size="sm" onClick={onEnable} disabled={enabling}>{enabling ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Register this browser</Button></div></div>;
  return <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><SetupMessage icon={Bell} tone="primary" title="Enable browser alerts" body="Allow notifications to receive new order and fulfilment alerts while the admin panel is open or in the background." /><Button size="sm" onClick={onEnable} disabled={enabling}>{enabling ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Enable this browser</Button></div></div>;
}

function SetupMessage({ icon: Icon, tone, title, body }) {
  const colors = { error: "text-rose-600", warning: "text-amber-600", success: "text-emerald-600", primary: "text-primary" };
  return <div className="flex min-w-0 items-start gap-3"><Icon className={`mt-0.5 size-5 shrink-0 ${colors[tone]}`} /><div className="min-w-0"><h2 className="font-semibold text-on-surface">{title}</h2><p className="mt-1 text-sm leading-6 text-on-surface-variant">{body}</p></div></div>;
}

function SummaryStat({ label, value, tone = "default" }) {
  return <div className="rounded-lg border border-outline-variant/70 bg-surface/75 px-3.5 py-3"><p className="text-xs font-medium text-on-surface-variant">{label}</p><p className={`mt-1 text-lg font-semibold ${tone === "primary" ? "text-primary" : tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-on-surface"}`}>{value}</p></div>;
}

function NotificationEmptyState({ unreadFilter = false }) {
  return <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center"><span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-5" /></span><h3 className="mt-4 font-heading text-lg font-semibold text-on-surface">{unreadFilter ? "No unread notifications" : "No notifications yet"}</h3><p className="mt-1.5 max-w-sm text-sm leading-6 text-on-surface-variant">{unreadFilter ? "You have reviewed all current activity." : "New orders and important store activity will appear here."}</p></div>;
}

function NotificationLoading() {
  return <div className="divide-y divide-outline-variant/60">{Array.from({ length: PAGE_SIZE }).map((_, index) => <div key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 sm:grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] sm:items-center sm:gap-4 sm:px-6"><Skeleton className="hidden h-4 w-5 sm:block" /><div className="min-w-0 space-y-2"><Skeleton className="h-4 w-48 max-w-full" /><Skeleton className="h-3 w-24 sm:hidden" /></div><Skeleton className="col-span-2 h-4 w-full max-w-md sm:col-span-1" /><Skeleton className="hidden h-4 w-28 sm:block" /><Skeleton className="col-span-2 ml-auto size-8 sm:col-span-1 sm:ml-0" /></div>)}</div>;
}

function NotificationPageLoading() {
  return <div className="space-y-5 sm:space-y-6"><Card className="overflow-hidden p-0"><div className="bg-surface-container-low/40 p-5 sm:p-7"><Skeleton className="h-8 w-64 max-w-full" /><Skeleton className="mt-2 h-4 w-full max-w-xl" /><div className="mt-6 grid gap-2 sm:grid-cols-3"><Skeleton className="h-20 w-full rounded-lg" /><Skeleton className="h-20 w-full rounded-lg" /><Skeleton className="h-20 w-full rounded-lg" /></div><div className="mt-5 flex items-center border-b border-outline-variant/80"><Skeleton className="mx-4 h-6 w-20" /><Skeleton className="h-6 w-24" /></div><div className="pt-5"><div className="hidden grid-cols-[48px_minmax(0,1.2fr)_minmax(0,2fr)_170px_64px] gap-4 border-b border-outline-variant/60 px-6 py-3 sm:grid"><Skeleton className="h-3 w-5" /><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-14" /></div><NotificationLoading /><div className="flex justify-center border-t border-outline-variant/70 px-4 py-4"><Skeleton className="h-10 w-64 max-w-full rounded-md" /></div></div></div></Card></div>;
}

function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function getBrowserPermission() {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}
