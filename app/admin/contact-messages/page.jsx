"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoveHorizontal, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table";
import { ConfirmActionDialog, TransparentActionLoader } from "@/components/action-feedback";
import { deleteAdminContactMessage, getAdminContactMessages } from "@/lib/api";
import { useAdminAuthStore } from "@/store/admin-auth-store";
import { ContactMessagesSkeleton } from "@/components/admin-contact-skeletons";

export default function AdminContactMessagesPage() {
  const token = useAdminAuthStore((state) => state.token);
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const loadMessages = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAdminContactMessages(token).then((data) => setMessages(data.messages || [])).catch((err) => setError(err.message || "Failed to load messages")).finally(() => setLoading(false));
  }, [token]);
  useEffect(() => { const timer = window.setTimeout(loadMessages, 0); return () => window.clearTimeout(timer); }, [loadMessages]);
  const getId = (message) => message._id || message.id;

  async function removeMessage(message) {
    setDeleteTarget(message);
  }

  async function confirmDeleteMessage() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminContactMessage(getId(deleteTarget), token);
      setMessages((items) => items.filter((item) => getId(item) !== getId(deleteTarget)));
      setDeleteTarget(null);
      toast.success("Contact message deleted");
    } catch (err) {
      toast.error(err.message || "Unable to delete contact message");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <ContactMessagesSkeleton />;

  return (
    <section className="container-page py-0">
      <Card className="overflow-hidden p-0">
        <div className="bg-surface-container-low/40">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Admin / Support</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Contact messages</h1>
          <p className="mt-1 text-[13px] leading-5 text-on-surface-variant sm:text-sm sm:leading-6">Review enquiries submitted through the website contact form.</p>
        </div>

        <div className="mt-4 min-w-0 pt-3 sm:mt-5 sm:pt-5">
          {error ? <div className="p-10 text-center text-sm text-error">{error}</div> : messages.length === 0 ? <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-on-surface-variant"><XCircle className="size-7" /><p>No contact messages found.</p></div> : <ContactTable messages={messages} onDelete={removeMessage} onView={(id) => router.push(`/admin/contact-messages/${id}`)} />}
        </div>
      </Card>
      <ConfirmActionDialog open={Boolean(deleteTarget)} title="Delete contact message?" message={deleteTarget ? `This message from ${deleteTarget.name || "this contact"} will be permanently deleted.` : "This contact message will be permanently deleted."} confirmLabel="Delete message" cancelLabel="Cancel" loading={deleting} onCancel={() => { if (!deleting) setDeleteTarget(null); }} onConfirm={confirmDeleteMessage} />
      <TransparentActionLoader open={deleting} label="Deleting contact message..." />
    </section>
  );
}

function ContactTable({ messages, onDelete, onView }) {
  return <>
    <p className="flex items-center gap-1.5 border-b border-outline-variant/60 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant/80 lg:hidden"><MoveHorizontal className="size-3.5" />Swipe table to see all columns</p>
    <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-on-surface-variant/40"><table className="w-full min-w-[1080px] border-collapse text-left"><colgroup><col className="w-14" /><col className="w-[17%]" /><col className="w-[15%]" /><col className="w-[20%]" /><col className="w-[15%]" /><col className="w-[25%]" /><col className="w-16" /></colgroup><thead><tr className="border-b border-outline-variant/60 bg-surface-container-low/45 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant sm:text-[11px]"><th className="px-4 py-3 text-left sm:px-6">#</th><th className="px-3 py-3 text-left">Name</th><th className="px-3 py-3 text-left">Ticket number</th><th className="px-3 py-3 text-left">Email</th><th className="px-3 py-3 text-left">Phone</th><th className="px-3 py-3 text-left">Message</th><th className="px-4 py-3 text-center">Action</th></tr></thead><tbody className="divide-y divide-outline-variant/60">{messages.map((message, index) => <ContactRow key={message._id || message.id} message={message} index={index + 1} onDelete={onDelete} onView={onView} />)}</tbody></table></div>
  </>;
}

function ContactRow({ message, index, onDelete, onView }) {
  const id = message._id || message.id;
  return <tr tabIndex={0} onClick={() => onView(id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onView(id); } }} className="cursor-pointer align-top transition hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><td className="px-4 py-4 text-xs font-semibold text-on-surface-variant sm:px-6">{index}</td><td className="px-3 py-4"><p className="truncate text-sm font-semibold text-on-surface">{message.name}</p></td><td className="px-3 py-4 text-xs font-medium text-on-surface-variant">{message.referenceNumber}</td><td className="px-3 py-4"><a onClick={(event) => event.stopPropagation()} href={`mailto:${message.email}`} className="block truncate text-sm text-on-surface hover:text-on-surface">{message.email}</a></td><td className="px-3 py-4"><a onClick={(event) => event.stopPropagation()} href={message.phone ? `tel:${String(message.phone).replaceAll(" ", "")}` : undefined} className="block truncate text-sm text-on-surface-variant hover:text-primary">{message.phone || "Not provided"}</a></td><td className="px-3 py-4"><p className="line-clamp-2 text-[13px] leading-5 text-on-surface-variant">{message.message}</p></td><td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><div className="flex justify-center"><AdminTableActions label={`Actions for ${message.name}`} actions={[{ label: "View", icon: Eye, href: `/admin/contact-messages/${id}`, ariaLabel: "View message" }, { label: "Delete", icon: Trash2, tone: "danger", ariaLabel: "Delete message", onClick: () => onDelete(message) }]} /></div></td></tr>;
}
