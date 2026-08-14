import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotificationStore } from "@/store/notification-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Where each notification type should take the user
function getNotificationLink(notification) {
  switch (notification.type) {
    case "mentorRequest":
      return "/mentorship";
    case "eventInvite":
      return "/events";
    case "announcement":
      return "/announcements";
    case "reply":
    case "mention":
      return notification.relatedId
        ? `/forum/${notification.relatedId}`
        : "/forum";
    default:
      return "/dashboard";
  }
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => {
                  if (!n.isRead) markAsRead(n._id);
                  setOpen(false);
                  navigate(getNotificationLink(n));
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/40 hover:bg-muted/50 transition-colors",
                  !n.isRead && "bg-primary/5",
                )}
              >
                <p className="text-sm font-medium">
                  {n.title || n.message || "Notification"}
                </p>
                {n.createdAt && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                )}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
