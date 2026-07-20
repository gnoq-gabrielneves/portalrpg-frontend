"use client";

import { useEffect, useRef } from "react";
import {
  useNotificationUnreadCount,
  useNotifications,
} from "../hooks/useNotifications";
import {
  notificationSoundDisabledEventName,
  notificationSoundEnabledEventName,
  notificationSoundEnabledStorageKey,
  notificationSoundUrl,
} from "../constants/notificationSound";

export function NotificationSound() {
  const { data: unreadNotifications } = useNotificationUnreadCount();
  const { data: notificationsPage } = useNotifications(1);
  const latestUnreadNotification = notificationsPage?.items.find(
    (notification) => notification.status === "unread",
  );
  const previousUnreadCountRef = useRef<number | null>(null);
  const previousLatestUnreadIdRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlaySoundRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio(notificationSoundUrl);
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.55;
    canPlaySoundRef.current =
      localStorage.getItem(notificationSoundEnabledStorageKey) === "true";
  }, []);

  useEffect(() => {
    const enableSound = () => {
      canPlaySoundRef.current = true;
    };
    const disableSound = () => {
      canPlaySoundRef.current = false;
    };

    const unlockSound = () => {
      const isSoundEnabled =
        localStorage.getItem(notificationSoundEnabledStorageKey) === "true";

      if (!audioRef.current || !isSoundEnabled) {
        return;
      }

      canPlaySoundRef.current = true;
      const originalVolume = audioRef.current.volume;

      audioRef.current.volume = 0;
      void audioRef.current
        .play()
        .then(() => {
          if (!audioRef.current) {
            return;
          }

          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.volume = originalVolume;
        })
        .catch(() => {
          if (audioRef.current) {
            audioRef.current.volume = originalVolume;
          }
        });
    };

    window.addEventListener("pointerdown", unlockSound, { once: true });
    window.addEventListener("keydown", unlockSound, { once: true });
    window.addEventListener("touchstart", unlockSound, { once: true });
    window.addEventListener(notificationSoundEnabledEventName, enableSound);
    window.addEventListener(notificationSoundDisabledEventName, disableSound);

    return () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
      window.removeEventListener("touchstart", unlockSound);
      window.removeEventListener(notificationSoundEnabledEventName, enableSound);
      window.removeEventListener(notificationSoundDisabledEventName, disableSound);
    };
  }, []);

  useEffect(() => {
    const unreadCount = unreadNotifications?.count;
    const latestUnreadId = latestUnreadNotification?.id ?? null;

    if (unreadCount === undefined) {
      return;
    }

    const previousUnreadCount = previousUnreadCountRef.current;
    const previousLatestUnreadId = previousLatestUnreadIdRef.current;
    previousUnreadCountRef.current = unreadCount;
    previousLatestUnreadIdRef.current = latestUnreadId;
    const hasNewUnreadCount =
      previousUnreadCount !== null && unreadCount > previousUnreadCount;
    const hasNewUnreadNotification =
      previousLatestUnreadId !== null &&
      latestUnreadId !== null &&
      latestUnreadId !== previousLatestUnreadId;

    if (
      (!hasNewUnreadCount && !hasNewUnreadNotification) ||
      !canPlaySoundRef.current ||
      !audioRef.current
    ) {
      return;
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => {
      canPlaySoundRef.current = false;
    });
  }, [
    latestUnreadNotification?.id,
    unreadNotifications?.count,
  ]);

  return null;
}
