"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { NotificationSound } from "@/features/notifications/components/NotificationSound";
import { AppSidebar } from "./AppSidebar";

export function PrivateAppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-rpg-surface-muted text-rpg-muted">
        Carregando sessao...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-rpg-surface-muted text-rpg-text">
      <NotificationSound />
      {/* Sidebar fixa das rotas privadas do app. */}
      <AppSidebar />
      {/* Area onde cada pagina privada e renderizada ao lado da sidebar. */}
      <main className="min-w-0 flex-1 p-6 2xl:p-8">{children}</main>
    </div>
  );
}
