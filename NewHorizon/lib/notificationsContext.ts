import { createContext } from 'react';

export const NotificationsContext = createContext<{
  hasRead: (id: string) => boolean;
  markRead: (id: string) => void;
} | null>(null);
