"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { updateOrdemAgent } from "../services/campaignsService";
import { UpdateOrdemAgentPayload } from "../types/campaign";

type UpdateOrdemAgentInput = {
  campaignId: string;
  entityId: string;
  payload: UpdateOrdemAgentPayload;
  showSuccessToast?: boolean;
};

export function useUpdateOrdemAgent() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, entityId, payload }: UpdateOrdemAgentInput) =>
      updateOrdemAgent(accessToken ?? "", campaignId, entityId, payload),
    onError: (error) => {
      showToast({
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Nao foi possivel salvar a ficha agora.",
        title: "Ficha nao atualizada",
        type: "error",
      });
    },
    onSuccess: async (character, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters", input.entityId],
        }),
      ]);

      if (input.showSuccessToast ?? true) {
        showToast({
          description: `A ficha de ${character.name} foi atualizada.`,
          title: "Ficha salva",
          type: "success",
        });
      }
    },
  });
}
