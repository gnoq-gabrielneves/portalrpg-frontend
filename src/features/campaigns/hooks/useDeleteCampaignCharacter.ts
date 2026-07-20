"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { deleteCampaignCharacter } from "../services/campaignsService";

type DeleteCampaignCharacterInput = {
  campaignId: string;
  entityId: string;
};

export function useDeleteCampaignCharacter() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ campaignId, entityId }: DeleteCampaignCharacterInput) =>
      deleteCampaignCharacter(accessToken ?? "", campaignId, entityId),
    onError: (error) => {
      showToast({
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Nao foi possivel excluir a ficha agora.",
        title: "Ficha nao excluida",
        type: "error",
      });
    },
    onSuccess: async (_response, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters", input.entityId],
        }),
      ]);

      showToast({
        description: "A ficha foi removida da campanha.",
        title: "Ficha excluida",
        type: "success",
      });

      router.push(`/campaigns/${input.campaignId}`);
    },
  });
}
