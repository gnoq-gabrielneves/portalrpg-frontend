import { parseApiResponse } from "@/shared/services/apiClient";
import {
  AppNotification,
  ClearNotificationsResponse,
  NotificationUnreadCount,
  PaginatedNotifications,
} from "../types/notification";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function getNotifications(
  accessToken: string,
  page: number,
): Promise<PaginatedNotifications> {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: "8",
  });
  const response = await fetch(`${apiBaseUrl}/notifications?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<PaginatedNotifications>(response);
}

export async function getNotificationUnreadCount(
  accessToken: string,
): Promise<NotificationUnreadCount> {
  const response = await fetch(`${apiBaseUrl}/notifications/unread-count`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<NotificationUnreadCount>(response);
}

export async function markNotificationAsRead(
  accessToken: string,
  notificationId: string,
): Promise<AppNotification> {
  const response = await fetch(
    `${apiBaseUrl}/notifications/${notificationId}/read`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<AppNotification>(response);
}

export async function markAllNotificationsAsRead(
  accessToken: string,
): Promise<NotificationUnreadCount> {
  const response = await fetch(`${apiBaseUrl}/notifications/read-all`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "PATCH",
  });

  return parseApiResponse<NotificationUnreadCount>(response);
}

export async function clearAllNotifications(
  accessToken: string,
): Promise<ClearNotificationsResponse> {
  const response = await fetch(`${apiBaseUrl}/notifications`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
  });

  return parseApiResponse<ClearNotificationsResponse>(response);
}
