"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/features/auth/hooks/useAuth";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

//! Hook = liga a mesa ao canal de tempo real (Socket.IO).
//* O servidor so avisa "algo mudou"; aqui refazemos as buscas afetadas.
//* Os dados continuam vindo pelo REST, que filtra por papel (fog of war intacto).
export function useCampaignRealtime(campaignId: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken || !campaignId) {
      return;
    }

    const socket = io(apiBaseUrl, {
      auth: { token: accessToken },
    });

    //* Ao (re)conectar, entra na sala da campanha.
    socket.on("connect", () => {
      socket.emit("campaign:join", campaignId);
    });

    //* Mudou o estado da mesa (tokens, mapas, sons, fichas): refaz campanha e personagens.
    socket.on("campaign:updated", () => {
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: ["campaign", campaignId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["campaign", campaignId, "characters"],
      });
    });

    //* Mudou o chat: refaz apenas as mensagens.
    socket.on("chat:updated", () => {
      void queryClient.invalidateQueries({
        queryKey: ["campaign", campaignId, "chat-messages"],
      });
    });

    return () => {
      socket.emit("campaign:leave", campaignId);
      socket.disconnect();
    };
  }, [accessToken, campaignId, queryClient]);
}
