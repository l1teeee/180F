'use client';

// docs/06-ROUTES-AND-SCREENS.md section 4.3 / docs/07 TopBar contract: bell + live unread count
// from useNotificationStore, working mark-as-read. Unread rows carry a dot + background tint,
// never colour alone (master plan §49). Controlled via useUiStore.notificationsOpen, the field
// that store already carries for exactly this surface (docs/08-STATE-MANAGEMENT.md section 1).
import { useMemo } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';
import { Bell, BellRing, CalendarCheck, CalendarX, CheckCheck, Users, type LucideIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Notification, NotificationType } from '@/domain/types';
import { useMessages } from '@/hooks/use-messages';
import type { Messages } from '@/i18n/messages';
import { cn } from '@/lib/cn';
import { useDemoRuntimeStore } from '@/stores/demo-runtime.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useUiStore } from '@/stores/ui.store';

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  booking_created: CalendarCheck,
  booking_cancelled: CalendarX,
  session_full: BellRing,
  membership_renewed: Users,
  waitlist_promoted: CheckCheck,
};

// Pure, store-free (docs/08 selector contract) - kept local to this file rather than in
// src/domain/selectors because that directory is outside this task's write set; it takes the
// notifications array as a plain argument and never imports a store itself.
function selectUnreadCount(notifications: Notification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}

// Relative to the demo clock only (ADR-018) - never Date.now(). Kept local to this file:
// src/lib/dates.ts is read-only for this task and has no relative-time helper of its own yet.
function formatRelativeToDemoNow(iso: string, demoNow: string, m: Messages): string {
  const target = parseISO(iso);
  const now = parseISO(demoNow);
  const minutes = differenceInMinutes(now, target);
  if (minutes < 1) return m.layout.justNow;
  if (minutes < 60) return m.layout.minutesAgo(minutes);
  const hours = differenceInHours(now, target);
  if (hours < 24) return m.layout.hoursAgo(hours);
  const days = differenceInDays(now, target);
  return m.layout.daysAgo(days);
}

function NotificationRow({
  notification,
  demoNow,
  onRead,
  m,
}: {
  notification: Notification;
  demoNow: string | null;
  onRead: (id: string) => void;
  m: Messages;
}) {
  const Icon = TYPE_ICON[notification.type];
  return (
    <DropdownMenuItem onSelect={() => onRead(notification.id)} className={cn('items-start gap-3 py-2.5', !notification.read && 'bg-purple-xsoft/40')}>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill',
          notification.read ? 'bg-surface-muted text-text-secondary' : 'bg-purple-xsoft text-purple-deep',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 whitespace-normal">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{notification.title}</span>
          {!notification.read ? <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-pill bg-purple" /> : null}
        </span>
        <span className="text-xs text-text-secondary">{notification.description}</span>
        <span className="text-[11px] text-text-tertiary tabular-nums">
          {demoNow ? formatRelativeToDemoNow(notification.createdAt, demoNow, m) : ''}
        </span>
      </span>
    </DropdownMenuItem>
  );
}

export function NotificationsMenu() {
  const m = useMessages();
  const notifications = useNotificationStore((state) => state.notifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const demoNow = useDemoRuntimeStore((state) => state.demoNow);
  const notificationsOpen = useUiStore((state) => state.notificationsOpen);
  const setNotificationsOpen = useUiStore((state) => state.setNotificationsOpen);

  const unreadCount = useMemo(() => selectUnreadCount(notifications), [notifications]);

  return (
    <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'icon' }), 'relative')}
        aria-label={unreadCount > 0 ? m.layout.notificationsUnread(unreadCount) : m.layout.notifications}
      >
        <Bell aria-hidden="true" className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger-deep px-1 text-[10px] font-semibold text-white tabular-nums"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
          <span className="text-[15px] font-semibold text-ink">{m.layout.notificationsTitle}</span>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-semibold text-purple-deep hover:underline disabled:pointer-events-none disabled:opacity-40"
          >
            {m.layout.markAllRead}
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto px-1.5 pb-1.5">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-text-secondary">{m.layout.allCaughtUp}</p>
          ) : (
            notifications.map((notification) => (
              <NotificationRow key={notification.id} notification={notification} demoNow={demoNow} onRead={markRead} m={m} />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
