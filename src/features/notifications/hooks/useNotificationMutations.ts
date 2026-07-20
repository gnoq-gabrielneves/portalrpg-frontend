import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/shared/hooks/useToast";
import {
  clearAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationsService";

export function useNotificationMutations() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const refreshNotifications = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      }),
    ]);
  };

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(accessToken ?? "", notificationId),
    onSuccess: refreshNotifications,
  });

  const markAllAsRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(accessToken ?? ""),
    onSuccess: refreshNotifications,
  });

  const clearAll = useMutation({
    mutationFn: () => clearAllNotifications(accessToken ?? ""),
    onSuccess: async () => {
      await refreshNotifications();
      showToast({
        title: "Notificacoes apagadas",
        description: "Sua central de notificacoes foi limpa.",
        type: "success",
      });
    },
  });

  return {
    clearAll,
    markAllAsRead,
    markAsRead,
  };
}
