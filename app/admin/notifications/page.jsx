"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CircleAlert, Eye, Loader2, MoveHorizontal, Trash2 } from "lucide-react";
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
         <div className="bg-surface-container-low/40 p-4 sm:p-7">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-balance font-heading text-xl font-semibold tracking-tight text-on-surface sm:text-3xl">Notifications</h1>
            <p className="mt-1 max-w-xl text-[13px] leading-5 text-on-surface-variant sm:mt-1.5 sm:text-sm sm:leading-6">Stay ahead of orders, payments, fulfilment issues, and customer activity from one focused workspace.</p>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2 sm:mt-6">
            <SummaryStat label="Unread" value={unread} tone="primary" />
            <SummaryStat label="Total activity" value={allTotal} />
            <SummaryStat label="Delivery" value={!firebaseReady ? "Setup needed" : tokenRegistered ? "Ready" : "Token needed"} tone={firebaseReady && tokenRegistered ? "success" : "warning"} />
          </div>
        </div>

          {!alertsEnabled ? <div className="px-3 pt-3 sm:px-6 sm:pt-4"><NotificationSetupPanel frontendConfigured={frontendConfigured} backendConfigured={backendConfigured} browserPermission={browserPermission} tokenRegistered={tokenRegistered} setupError={setupError} enabling={enabling} onEnable={enableNotifications} /></div> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-outline-variant/80 px-3 pr-2 sm:mt-5 sm:gap-x-3 sm:px-4 sm:pr-4">
            <div className="flex min-w-0 items-center">
              <button type="button" onClick={() => changeFilter("all")} className={`shrink-0 border-b-2 px-1.5 py-2.5 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${filter === "all" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>All <span className="ml-0.5 whitespace-nowrap">({allTotal})</span></button>
              <button type="button" onClick={() => changeFilter("unread")} className={`shrink-0 border-b-2 px-1.5 py-2.5 text-[13px] font-semibold transition sm:px-4 sm:text-sm ${filter === "unread" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>Unread <span className="ml-0.5 whitespace-nowrap">({unread})</span></button>
            </div>
            {unread > 0 ? (
              <Button onClick={markAllRead} size="sm" className="ml-auto shrink-0 px-2 text-[11px] sm:px-3 sm:text-sm">
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>
          <div className="pt-3 sm:pt-5">
            {listLoading ? <NotificationLoading /> : visibleNotifications.length ? (
              <>
                <p className="flex items-center gap-1.5 border-b border-outline-variant/60 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/80 lg:hidden">
                  <MoveHorizontal className="size-3.5" />
                  Swipe table to see all columns
                </p>
                <div className="w-full overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-on-surface-variant/40">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/60 bg-surface-container-low/45 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant sm:text-[11px]">
                        <th scope="col" className="w-14 px-4 py-2.5 text-left font-bold sm:px-6 sm:py-3">#</th>
                        <th scope="col" className="min-w-[180px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Notification</th>
                        <th scope="col" className="min-w-[260px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Details</th>
                        <th scope="col" className="w-[170px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Received</th>
                        <th scope="col" className="w-16 px-4 py-2.5 text-center font-bold sm:px-4 sm:py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/60">
                      {visibleNotifications.map((notification, index) => <NotificationRow key={notification._id} index={(page - 1) * PAGE_SIZE + index + 1} notification={notification} onDelete={deleteNotification} onView={() => router.push(`/admin/notifications/${notification._id}`)} />)}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <NotificationEmptyState unreadFilter={filter === "unread"} />}
          </div>
          {!listLoading && totalPages > 1 ? <div className="flex flex-col gap-2 border-t border-outline-variant/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4"><p className="text-[11px] text-on-surface-variant sm:text-xs">Showing {showingStart}-{showingEnd} of {displayTotal}</p><Pagination page={page} totalPages={totalPages} onPageChange={changePage} className="w-full justify-center sm:w-auto sm:justify-end" /></div> : null}
       </Card>
       <ConfirmActionDialog open={Boolean(deleteTarget)} title="Delete notification?" message="This notification will be permanently removed from the notification history." confirmLabel="Delete notification" cancelLabel="Keep notification" loading={deleting} onCancel={() => { if (!deleting) setDeleteTarget(null); }} onConfirm={confirmDeleteNotification} />
       <TransparentActionLoader open={deleting} label="Deleting notification..." />
     </div>
  );
}

function NotificationRow({ notification, index, onDelete, onView }) {
  const date = formatNotificationDate(notification.createdAt);
  return (
    <tr
      tabIndex={0}
      onClick={onView}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onView(); } }}
      className={`group cursor-pointer transition hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${notification.isRead ? "" : "bg-primary/[0.035]"}`}
    >
      <td className="px-4 py-3 align-top text-xs font-semibold text-on-surface-variant sm:px-6 sm:py-4 sm:text-sm">{index}</td>
      <td className="px-4 py-3 align-top sm:px-3 sm:py-4">
        <div className="flex items-start gap-2">
          <strong className="break-words text-sm font-semibold text-on-surface">{notification.title}</strong>
          {notification.isRead ? null : <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />}
        </div>
      </td>
      <td className="px-4 py-3 align-top text-[13px] leading-5 text-on-surface-variant sm:px-3 sm:py-4 sm:text-sm sm:leading-6">{notification.body}</td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-on-surface-variant sm:px-3 sm:py-4">{date}</td>
      <td className="px-4 py-3 align-top sm:px-4 sm:py-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-center">
          <AdminTableActions label={`Actions for ${notification.title}`} actions={[{ label: "View", icon: Eye, href: `/admin/notifications/${notification._id}`, ariaLabel: "View notification" }, { label: "Delete", icon: Trash2, tone: "danger", ariaLabel: "Delete notification", onClick: () => onDelete(notification) }]} />
        </div>
      </td>
    </tr>
  );
}

function NotificationSetupPanel({ frontendConfigured, backendConfigured, browserPermission, tokenRegistered, setupError, enabling, onEnable }) {
  if (setupError) return <div className="rounded-lg border border-rose-300/70 bg-rose-50/70 p-3 dark:bg-rose-500/10 sm:p-4"><SetupMessage icon={CircleAlert} tone="error" title="Notification setup needs attention" body={setupError} /></div>;
  if (!frontendConfigured || !backendConfigured) return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 dark:bg-amber-500/10 sm:p-4"><SetupMessage icon={CircleAlert} tone="warning" title="Firebase setup is incomplete" body="Push delivery is not ready. Check the Firebase web variables in the frontend and service-account variables in the backend. Stored notifications will still appear below." /></div>;
  if (browserPermission === "denied") return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 dark:bg-amber-500/10 sm:p-4"><SetupMessage icon={CircleAlert} tone="warning" title="Browser permission is blocked" body="Chrome blocked notifications for this site. Open the lock icon in the address bar, open Site settings, set Notifications to Allow, then reload this page." /></div>;
  if (browserPermission === "granted" && tokenRegistered) return null;
  if (browserPermission === "granted") return <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 dark:bg-amber-500/10 sm:p-4"><div className="flex flex-wrap items-center justify-between gap-3"><SetupMessage icon={CircleAlert} tone="warning" title="Browser permission granted, registration incomplete" body="The browser allowed notifications, but this browser token is not registered with the admin account yet." /><Button size="sm" onClick={onEnable} disabled={enabling}>{enabling ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Register this browser</Button></div></div>;
  return <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 sm:p-4"><div className="flex flex-wrap items-center justify-between gap-3"><SetupMessage icon={Bell} tone="primary" title="Enable browser alerts" body="Allow notifications to receive new order and fulfilment alerts while the admin panel is open or in the background." /><Button size="sm" onClick={onEnable} disabled={enabling}>{enabling ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />} Enable this browser</Button></div></div>;
}

function SetupMessage({ icon: Icon, tone, title, body }) {
  const colors = { error: "text-rose-600", warning: "text-amber-600", success: "text-emerald-600", primary: "text-primary" };
  return <div className="flex min-w-0 items-start gap-2.5 sm:gap-3"><Icon className={`mt-0.5 size-4 shrink-0 sm:size-5 ${colors[tone]}`} /><div className="min-w-0"><h2 className="text-sm font-semibold text-on-surface sm:text-base">{title}</h2><p className="mt-1 text-[13px] leading-5 text-on-surface-variant sm:text-sm sm:leading-6">{body}</p></div></div>;
}

function SummaryStat({ label, value, tone = "default" }) {
  return <div className="min-w-0 rounded-lg border border-outline-variant/70 bg-surface/75 px-2.5 py-2 sm:px-3.5 sm:py-3"><p className="text-[10px] font-medium leading-4 text-on-surface-variant sm:text-xs">{label}</p><p className={`mt-0.5 break-words text-sm font-semibold leading-5 sm:mt-1 sm:text-lg sm:leading-6 ${tone === "primary" ? "text-primary" : tone === "success" ? "text-emerald-600" : tone === "warning" ? "text-amber-600" : "text-on-surface"}`}>{value}</p></div>;
}

function NotificationEmptyState({ unreadFilter = false }) {
  return <div className="flex min-h-64 flex-col items-center justify-center px-5 py-12 text-center"><span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Bell className="size-5" /></span><h3 className="mt-4 font-heading text-lg font-semibold text-on-surface">{unreadFilter ? "No unread notifications" : "No notifications yet"}</h3><p className="mt-1.5 max-w-sm text-sm leading-6 text-on-surface-variant">{unreadFilter ? "You have reviewed all current activity." : "New orders and important store activity will appear here."}</p></div>;
}

function NotificationLoading() {
  return (
    <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-on-surface-variant/40">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant/60 bg-surface-container-low/45 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant sm:text-[11px]">
            <th scope="col" className="w-14 px-4 py-2.5 text-left font-bold sm:px-6 sm:py-3">#</th>
            <th scope="col" className="min-w-[180px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Notification</th>
            <th scope="col" className="min-w-[260px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Details</th>
            <th scope="col" className="w-[170px] px-4 py-2.5 text-left font-bold sm:px-3 sm:py-3">Received</th>
            <th scope="col" className="w-16 px-4 py-2.5 text-center font-bold sm:px-4 sm:py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <tr key={index}>
              <td className="px-4 py-3 sm:px-6 sm:py-4"><Skeleton className="h-3.5 w-4" /></td>
              <td className="px-4 py-3 sm:px-3 sm:py-4"><Skeleton className="h-4 w-40 max-w-full" /></td>
              <td className="px-4 py-3 sm:px-3 sm:py-4"><Skeleton className="h-4 w-56 max-w-full" /></td>
              <td className="px-4 py-3 sm:px-3 sm:py-4"><Skeleton className="h-3.5 w-24" /></td>
              <td className="px-4 py-3 sm:px-4 sm:py-4"><Skeleton className="mx-auto size-8" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NotificationPageLoading() {
  return <div className="space-y-4 sm:space-y-6"><Card className="overflow-hidden p-0"><div className="bg-surface-container-low/40 p-4 sm:p-7"><Skeleton className="h-7 w-48 max-w-full sm:h-8 sm:w-64" /><Skeleton className="mt-2 h-4 w-full max-w-xl" /><div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6"><Skeleton className="h-16 w-full rounded-lg sm:h-20" /><Skeleton className="h-16 w-full rounded-lg sm:h-20" /><Skeleton className="h-16 w-full rounded-lg sm:h-20" /></div></div><div className="mt-4 flex items-center justify-between border-b border-outline-variant/80 px-3 pr-2 sm:mt-5 sm:px-4"><div className="flex items-center gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-20" /></div><Skeleton className="h-8 w-24 shrink-0" /></div><div className="pt-3 sm:pt-5"><NotificationLoading /><div className="flex justify-center border-t border-outline-variant/70 px-3 py-3 sm:px-4 sm:py-4"><Skeleton className="h-9 w-64 max-w-full rounded-md" /></div></div></Card></div>;
}

function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function getBrowserPermission() {
  return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
}
