"use client";

import { Button, Card, Switch } from "@heroui/react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { BellRingIcon, SettingsIcon, Volume2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  notificationSoundDisabledEventName,
  notificationSoundEnabledEventName,
  notificationSoundEnabledStorageKey,
  notificationSoundUrl,
} from "@/features/notifications/constants/notificationSound";

export function SettingsPage() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(getSavedSoundStatus);
  const [isTestingSound, setIsTestingSound] = useState(false);

  function disableNotificationSound() {
    localStorage.removeItem(notificationSoundEnabledStorageKey);
    setIsSoundEnabled(false);
    window.dispatchEvent(new Event(notificationSoundDisabledEventName));
  }

  async function enableNotificationSound() {
    setIsTestingSound(true);

    try {
      const audio = new Audio(notificationSoundUrl);
      audio.volume = 0.65;
      await audio.play();

      localStorage.setItem(notificationSoundEnabledStorageKey, "true");
      setIsSoundEnabled(true);
      window.dispatchEvent(new Event(notificationSoundEnabledEventName));
    } finally {
      setIsTestingSound(false);
    }
  }

  function handleSoundEnabledChange(isSelected: boolean) {
    if (isSelected) {
      void enableNotificationSound();
      return;
    }

    disableNotificationSound();
  }

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
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
              Preferências
            </p>
            <h1 className="text-3xl font-black tracking-normal text-rpg-text">
              Configurações
            </h1>
          </div>
        </div>
      </motion.header>

      <motion.div variants={fadeInUp}>
        <Card className="max-w-lg border border-rpg-border bg-rpg-surface shadow-sm">
          <Card.Header className="border-b border-rpg-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-rpg-primary-soft text-rpg-primary">
                <BellRingIcon className="h-5 w-5" />
              </div>
              <div>
                <Card.Title className="text-lg font-black text-rpg-text">
                  Som das notificações
                </Card.Title>
                <Card.Description className="mt-1 text-sm text-rpg-muted">
                  Avise com áudio quando algo novo chegar.
                </Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content className="grid gap-3 p-5">
            <div className="rounded-2xl border border-rpg-border bg-rpg-surface-muted p-3">
              <Switch
                className="w-full"
                isSelected={isSoundEnabled}
                onChange={handleSoundEnabledChange}
                size="md"
              >
                {({ isSelected }) => (
                  <Switch.Content className="flex w-full items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-rpg-primary text-white">
                        <Volume2Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-rpg-text">
                          Sons de notificação
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-rpg-muted">
                          {isSelected ? "Ligado" : "Desligado"}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                        isSelected ? "bg-rpg-primary" : "bg-rpg-border"
                      }`}
                    >
                      <span
                        className={`block size-4 rounded-full bg-white shadow-sm transition ${
                          isSelected ? "translate-x-5" : ""
                        }`}
                      />
                    </span>
                  </Switch.Content>
                )}
              </Switch>
            </div>

            <Button
              className="flex w-fit items-center justify-center gap-2 rounded-2xl border border-rpg-border px-4 py-2.5 font-bold text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
              isDisabled={!isSoundEnabled || isTestingSound}
              onPress={() => void enableNotificationSound()}
              variant="secondary"
            >
              <Volume2Icon className="h-5 w-5" />
              {isTestingSound ? "Testando..." : "Testar som"}
            </Button>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.section>
  );
}

function getSavedSoundStatus() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(notificationSoundEnabledStorageKey) === "true";
}
