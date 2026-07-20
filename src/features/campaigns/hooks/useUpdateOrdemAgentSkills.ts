"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { updateOrdemAgentSkills } from "../services/campaignsService";
import { UpdateOrdemAgentSkillsPayload } from "../types/campaign";

type UpdateOrdemAgentSkillsInput = {
  campaignId: string;
  entityId: string;
  payload: UpdateOrdemAgentSkillsPayload;
};

export function useUpdateOrdemAgentSkills() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      entityId,
      payload,
    }: UpdateOrdemAgentSkillsInput) =>
      updateOrdemAgentSkills(accessToken ?? "", campaignId, entityId, payload),
    onError: (error) => {
      showToast({
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Nao foi possivel salvar as pericias agora.",
        title: "Pericias nao atualizadas",
        type: "error",
      });
    },
    onSuccess: async (_character, input) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaign", input.campaignId, "characters", input.entityId],
        }),
      ]);
    },
  });
}
