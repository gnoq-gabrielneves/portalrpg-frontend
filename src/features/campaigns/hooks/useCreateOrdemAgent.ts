"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { createOrdemAgent } from "../services/campaignsService";
import { CreateOrdemAgentPayload } from "../types/campaign";

type CreateOrdemAgentInput = {
  campaignId: string;
  payload: CreateOrdemAgentPayload;
};

export function useCreateOrdemAgent() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, payload }: CreateOrdemAgentInput) =>
      createOrdemAgent(accessToken ?? "", campaignId, payload),
    onError: (error) => {
      showToast({
        title: "Agente nao criado",
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Nao foi possivel criar o agente agora.",
        type: "error",
      });
    },
    onSuccess: async (_character, input) => {
      await queryClient.invalidateQueries({
        queryKey: ["campaign", input.campaignId, "characters"],
      });
      showToast({
        title: "Agente criado",
        description: "A ficha inicial foi adicionada a campanha.",
        type: "success",
      });
    },
  });
}
