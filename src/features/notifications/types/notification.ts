export type AppNotificationStatus = "read" | "unread";

export type AppNotificationType = "campaign_invite" | "friend_request";

export type AppNotification = {
  actionUrl?: string;
  createdAt?: string;
  id: string;
  message: string;
  relatedEntityId?: string;
  status: AppNotificationStatus;
  title: string;
  type: AppNotificationType;
};

export type NotificationUnreadCount = {
  count: number;
};

export type ClearNotificationsResponse = {
  deleted: number;
};

export type PaginatedNotifications = {
  items: AppNotification[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
