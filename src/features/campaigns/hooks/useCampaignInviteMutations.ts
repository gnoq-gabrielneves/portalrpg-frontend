"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import {
  acceptCampaignInvite,
  createCampaignInvite,
  declineCampaignInvite,
} from "../services/campaignsService";

type CreateCampaignInviteInput = {
  campaignId: string;
  recipientUserId: string;
};

export function useCampaignInviteMutations() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const refreshCampaignSocial = async (campaignId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      }),
      queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
      campaignId
        ? queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId, "invite-friends"],
          })
        : Promise.resolve(),
      campaignId
        ? queryClient.invalidateQueries({
            queryKey: ["campaign", campaignId, "members"],
          })
        : Promise.resolve(),
    ]);
  };

  const showMutationError = (error: Error, fallbackMessage: string) => {
    showToast({
      title: "Convite nao atualizado",
      description:
        error instanceof ApiClientError
          ? getApiErrorMessage(error.response)
          : fallbackMessage,
      type: "error",
    });
  };

  const createInvite = useMutation({
    mutationFn: ({ campaignId, recipientUserId }: CreateCampaignInviteInput) =>
      createCampaignInvite(accessToken ?? "", campaignId, recipientUserId),
    onError: (error) => {
      showMutationError(error, "Nao foi possivel enviar o convite agora.");
    },
    onSuccess: async (invite) => {
      await refreshCampaignSocial(invite.campaignId);
      showToast({
        title: "Convite enviado",
        description: "Seu amigo recebeu uma notificacao da campanha.",
        type: "success",
      });
    },
  });

  const acceptInvite = useMutation({
    mutationFn: (inviteId: string) =>
      acceptCampaignInvite(accessToken ?? "", inviteId),
    onError: (error) => {
      showMutationError(error, "Nao foi possivel aceitar o convite agora.");
    },
    onSuccess: async (invite) => {
      await refreshCampaignSocial(invite.campaignId);
      showToast({
        title: "Convite aceito",
        description: "A campanha foi adicionada ao seu painel.",
        type: "success",
      });
    },
  });

  const declineInvite = useMutation({
    mutationFn: (inviteId: string) =>
      declineCampaignInvite(accessToken ?? "", inviteId),
    onError: (error) => {
      showMutationError(error, "Nao foi possivel recusar o convite agora.");
    },
    onSuccess: async (invite) => {
      await refreshCampaignSocial(invite.campaignId);
      showToast({
        title: "Convite recusado",
        description: "O convite saiu da sua lista de pendencias.",
        type: "success",
      });
    },
  });

  return {
    acceptInvite,
    createInvite,
    declineInvite,
  };
}
