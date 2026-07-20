import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getNotificationUnreadCount,
  getNotifications,
} from "../services/notificationsService";

export function useNotifications(page: number) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getNotifications(accessToken ?? "", page),
    queryKey: ["notifications", page],
    refetchInterval: 3000,
  });
}

export function useNotificationUnreadCount() {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getNotificationUnreadCount(accessToken ?? ""),
    queryKey: ["notifications", "unread-count"],
    refetchInterval: 3000,
  });
}
