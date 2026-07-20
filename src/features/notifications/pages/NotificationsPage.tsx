"use client";

import { Button, Card, Pagination } from "@heroui/react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import {
  BellIcon,
  CheckCheckIcon,
  ScrollTextIcon,
  Trash2Icon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { useCampaignInviteMutations } from "@/features/campaigns/hooks/useCampaignInviteMutations";
import { useNotificationMutations } from "../hooks/useNotificationMutations";
import { useNotifications } from "../hooks/useNotifications";
import { AppNotification } from "../types/notification";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data: notificationsPage, isLoading } = useNotifications(page);
  const { acceptInvite, declineInvite } = useCampaignInviteMutations();
  const { clearAll, markAllAsRead, markAsRead } = useNotificationMutations();
  const notifications = notificationsPage?.items ?? [];
  const totalPages = notificationsPage?.totalPages ?? 1;
  const hasNotifications = notificationsPage ? notificationsPage.total > 0 : false;
  const hasUnreadNotifications = notifications.some(
    (notification) => notification.status === "unread",
  );

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.header
        className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
        variants={fadeInUp}
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
              <BellIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
                Central
              </p>
              <h1 className="text-3xl font-black tracking-normal text-rpg-text">
                Notificações
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex items-center justify-center gap-2 rounded-2xl border border-rpg-border px-4 py-3 font-bold text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
              isDisabled={!hasUnreadNotifications || markAllAsRead.isPending}
              onPress={() => markAllAsRead.mutate()}
              variant="secondary"
            >
              <CheckCheckIcon className="h-5 w-5" />
              Marcar tudo como lido
            </Button>
            <Button
              className="flex items-center justify-center gap-2 rounded-2xl border border-rpg-danger/30 px-4 py-3 font-bold text-rpg-danger transition hover:bg-rpg-danger/10"
              isDisabled={!hasNotifications || clearAll.isPending}
              onPress={() => clearAll.mutate()}
              variant="secondary"
            >
              <Trash2Icon className="h-5 w-5" />
              Limpar tudo
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.div variants={fadeInUp}>
        <Card className="border border-rpg-border bg-rpg-surface shadow-sm">
          <Card.Content className="grid gap-3 p-5">
            {isLoading ? (
              <EmptyState text="Carregando notificações..." />
            ) : null}
            {!isLoading && notifications.length === 0 ? (
              <EmptyState text="Nenhuma notificação por enquanto." />
            ) : null}
            {notifications.map((notification) => (
              <NotificationItem
                isPending={markAsRead.isPending}
                key={notification.id}
                notification={notification}
                onAcceptInvite={(inviteId) => acceptInvite.mutate(inviteId)}
                onDeclineInvite={(inviteId) => declineInvite.mutate(inviteId)}
                onMarkAsRead={() => markAsRead.mutate(notification.id)}
              />
            ))}
            {totalPages > 1 ? (
              <Pagination className="mt-2 flex justify-center" size="sm">
                <Pagination.Content>
                  <Pagination.Item>
                    <Pagination.Previous
                      className="rounded-lg border border-rpg-border px-3 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted disabled:opacity-50"
                      isDisabled={page <= 1}
                      onPress={() => setPage((currentPage) => currentPage - 1)}
                    >
                      Anterior
                    </Pagination.Previous>
                  </Pagination.Item>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <Pagination.Item key={pageNumber}>
                        <Pagination.Link
                          className="rounded-lg px-3 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                          isActive={pageNumber === page}
                          onPress={() => setPage(pageNumber)}
                        >
                          {pageNumber}
                        </Pagination.Link>
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Item>
                    <Pagination.Next
                      className="rounded-lg border border-rpg-border px-3 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted disabled:opacity-50"
                      isDisabled={page >= totalPages}
                      onPress={() => setPage((currentPage) => currentPage + 1)}
                    >
                      Próxima
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            ) : null}
          </Card.Content>
        </Card>
      </motion.div>
    </motion.section>
  );
}

function NotificationItem({
  isPending,
  notification,
  onAcceptInvite,
  onDeclineInvite,
  onMarkAsRead,
}: Readonly<{
  isPending: boolean;
  notification: AppNotification;
  onAcceptInvite: (inviteId: string) => void;
  onDeclineInvite: (inviteId: string) => void;
  onMarkAsRead: () => void;
}>) {
  const isUnread = notification.status === "unread";
  const isCampaignInviteAction =
    isUnread &&
    notification.type === "campaign_invite" &&
    notification.actionUrl === "/notifications" &&
    Boolean(notification.relatedEntityId);

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
        isUnread
          ? "border-rpg-primary/30 bg-rpg-primary-soft"
          : "border-rpg-border bg-rpg-surface-muted"
      }`}
    >
      <div className="flex min-w-0 gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rpg-primary text-white">
          {notification.type === "campaign_invite" ? (
            <ScrollTextIcon className="h-5 w-5" />
          ) : (
            <UserPlusIcon className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-rpg-text">
            {notification.title}
          </h2>
          <p className="mt-1 text-justify text-sm leading-6 text-rpg-muted">
            {notification.message}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {isCampaignInviteAction ? (
          <>
            <Button
              className="flex items-center gap-2 rounded-lg bg-rpg-primary px-3 py-2 text-sm font-bold text-white"
              onPress={() => onAcceptInvite(notification.relatedEntityId ?? "")}
            >
              <CheckCheckIcon className="h-4 w-4" />
              Aceitar
            </Button>
            <Button
              className="flex items-center gap-2 rounded-lg border border-rpg-border px-3 py-2 text-sm font-bold text-rpg-muted hover:bg-rpg-surface"
              onPress={() => onDeclineInvite(notification.relatedEntityId ?? "")}
              variant="secondary"
            >
              <XIcon className="h-4 w-4" />
              Recusar
            </Button>
          </>
        ) : null}
        {notification.actionUrl && !isCampaignInviteAction ? (
          <Link
            className="rounded-lg bg-rpg-primary px-3 py-2 text-sm font-bold text-white"
            href={notification.actionUrl}
          >
            Ver
          </Link>
        ) : null}
        {isUnread && !isCampaignInviteAction ? (
          <Button
            className="rounded-lg border border-rpg-border px-3 py-2 text-sm font-bold text-rpg-muted hover:bg-rpg-surface"
            isDisabled={isPending}
            onPress={onMarkAsRead}
            variant="secondary"
          >
            Lida
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface p-5 text-center text-sm font-semibold text-rpg-muted">
      {text}
    </div>
  );
}
