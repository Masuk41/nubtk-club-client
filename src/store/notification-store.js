import { create } from "zustand";
import api from "@/lib/api";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await api.notifications.getAll();
      const notifications = data;
      const unread = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount: unread });
    } catch {
      /* backend may be offline */
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.notifications.markAsRead(id);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        };
      });
    } catch {
      /* ignore */
    }
  },

  markAllRead: async () => {
    const { notifications } = get();
    const unread = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unread.map((n) => api.notifications.markAsRead(n._id)));
      set({
        notifications: notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      });
    } catch {
      /* ignore */
    }
  },
}));
