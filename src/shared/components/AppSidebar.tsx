"use client";

import {
  BellIcon,
  ChevronUpIcon,
  FlagIcon,
  HelpCircleIcon,
  HomeIcon,
  LogOutIcon,
  LucideIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { toAbsoluteApiAssetUrl } from "@/features/profile/services/profileService";

type SidebarRoute = {
  icon: LucideIcon;
  name: string;
  url: string;
};

type SidebarGroup = {
  name: string;
  routes: SidebarRoute[];
};

// Grupos exibidos na sidebar. Para adicionar novas categorias, basta criar outro objeto aqui.
const sidebarGroups: SidebarGroup[] = [
  {
    name: "Principal",
    routes: [
      {
        icon: HomeIcon,
        name: "Home",
        url: "/home",
      },
      {
        icon: FlagIcon,
        name: "Campanhas",
        url: "/campaigns",
      },
    ],
  },
  {
    name: "Social",
    routes: [
      {
        icon: UsersRoundIcon,
        name: "Amigos",
        url: "/friends",
      },
      {
        icon: BellIcon,
        name: "Notificações",
        url: "/notifications",
      },
    ],
  },
  {
    name: "Outros",
    routes: [
      {
        icon: SettingsIcon,
        name: "Configurações",
        url: "/settings",
      },
      {
        icon: HelpCircleIcon,
        name: "Ajuda",
        url: "/help",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { data: unreadNotifications } = useNotificationUnreadCount();
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const displayName = user?.profile?.displayName ?? "Jogador";
  const avatarUrl = toAbsoluteApiAssetUrl(user?.profile?.avatarUrl);
  const isOnline = user?.status === "active";
  const unreadCount = unreadNotifications?.count ?? 0;

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-rpg-border bg-rpg-surface px-4 py-6">
      <div className="mb-8 px-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
          Portal RPG
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-normal text-rpg-text">
          Painel
        </h1>
      </div>

      <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-6">
        {sidebarGroups.map((group) => (
          <div className="grid gap-2" key={group.name}>
            <div className="flex items-center gap-3 px-3">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                {group.name}
              </span>
              <span className="h-px flex-1 bg-rpg-border" />
            </div>

            {group.routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.url;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20"
                      : "text-rpg-muted hover:bg-rpg-primary-soft hover:text-rpg-primary"
                  }`}
                  href={route.url}
                  key={route.url}
                >
                  <Icon className="h-5 w-5" />
                  <span className="min-w-0 flex-1 truncate">{route.name}</span>
                  {route.url === "/notifications" && unreadCount > 0 ? (
                    <span
                      className={`grid min-w-5 place-items-center rounded-full px-1.5 text-xs font-black ${
                        isActive
                          ? "bg-white text-rpg-primary"
                          : "bg-rpg-primary text-white"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Menu de conta fica no rodape para separar navegacao da sessao do usuario. */}
      <div className="relative border-t border-rpg-border pt-4">
        <AnimatePresence>
          {isProfileMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 right-0 mb-3 overflow-hidden rounded-lg border border-rpg-border bg-rpg-surface shadow-xl"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Link
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                href="/profile"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <UserRoundIcon className="h-5 w-5" />
                Acessar perfil
              </Link>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-rpg-danger transition hover:bg-red-50"
                onClick={() => void logout()}
                type="button"
              >
                <LogOutIcon className="h-5 w-5" />
                Deslogar
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          aria-expanded={isProfileMenuOpen}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-rpg-surface-muted"
          onClick={() => setIsProfileMenuOpen((current) => !current)}
          type="button"
        >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-rpg-border bg-rpg-primary text-white shadow-sm">
            {avatarUrl && !hasAvatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Foto de perfil"
                className="h-full w-full object-cover"
                onError={() => setHasAvatarError(true)}
                src={avatarUrl}
              />
            ) : (
              <UserRoundIcon className="h-5 w-5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black text-rpg-text">
              {displayName}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-bold text-rpg-muted">
              <span
                className={`size-2 rounded-full ${
                  isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isOnline ? "Online" : "Offline"}
            </span>
          </span>
          <ChevronUpIcon
            className={`h-4 w-4 shrink-0 text-rpg-muted transition ${
              isProfileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
