import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  description?: string;
  read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (noti) => set((state) => {
    const newNoti: Notification = {
      ...noti,
      id: Math.random().toString(36).substring(7),
      read: false,
      created_at: new Date().toISOString(),
    };
    return {
      notifications: [newNoti, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  }),
  
  markAsRead: (id) => set((state) => {
    const isUnread = state.notifications.find(n => n.id === id && !n.read);
    return {
      notifications: state.notifications.map((n) => 
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: isUnread ? state.unreadCount - 1 : state.unreadCount,
    };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
