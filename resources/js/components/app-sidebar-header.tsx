import React, { useEffect, useState, useRef } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Import Button UI
import { Bell } from 'lucide-react'; // Import Icon Bell
import { Modal } from '@/components/ui/modal';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { notifications, open, setOpen, unreadCount, markAllRead, menuRef } = useNotifications();
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Sisi Kiri: Trigger & Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Sisi Kanan: Notifikasi */}
            <div className="flex items-center gap-2 relative">
                <div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 rounded-full group"
                        onClick={() => setOpen(o => !o)}
                    >
                        <Bell className="h-5 w-5 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />

                        {/* Badge Indikator Notifikasi */}
                        {unreadCount > 0 && (
                            <span className="absolute -top-0 -right-0 flex h-3 w-3 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[10px] leading-3 text-white flex items-center justify-center">{unreadCount}</span>
                            </span>
                        )}
                    </Button>

                    <Modal isOpen={open} onClose={() => setOpen(false)} title={`Notifikasi (${unreadCount})`} maxWidth="md">
                        <div className="space-y-2">
                            {notifications.length === 0 && (
                                <div className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                                    Tidak ada notifikasi
                                </div>
                            )}

                            {notifications.map((n: any) => (
                                <div key={n.id} className="px-4 py-3 border-b border-neutral-100 dark:border-slate-800 last:border-b-0">
                                    <div className="text-sm text-neutral-800 dark:text-neutral-200">
                                        {n.data.message}
                                    </div>
                                    {n.data?.alasan && (
                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                            Alasan: {n.data.alasan}
                                        </div>
                                    )}
                                    <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                        {new Date(n.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 text-right">
                                <button
                                    className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
                                    onClick={markAllRead}
                                >
                                    Tandai semua dibaca
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </header>
    );
}

// Hook & helper state added below to avoid changing export signature above
function useNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchNotifications();

        function onClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    async function fetchNotifications() {
        try {
            const res = await fetch('/notifications');
            const json = await res.json();
            const data = json.data || [];
            setNotifications(data);
            setUnreadCount(data.filter((d: any) => !d.is_read).length);
        } catch (e) {
            // ignore
        }
    }

    async function markAllRead() {
        try {
            await fetch('/notifications/mark-read', { method: 'POST', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' } });
            fetchNotifications();
        } catch (e) { }
    }

    return { notifications, open, setOpen, unreadCount, markAllRead, menuRef };
}

// No default export — use named export `AppSidebarHeader`