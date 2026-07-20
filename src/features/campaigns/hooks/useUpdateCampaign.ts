import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { updateCampaign } from "../services/campaignsService";
import { UpdateCampaignPayload } from "../types/campaign";

type UpdateCampaignMutationInput = {
  campaignId: string;
  payload: UpdateCampaignPayload;
};

export function useUpdateCampaign() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, payload }: UpdateCampaignMutationInput) =>
      updateCampaign(accessToken ?? "", campaignId, payload),
    onError: (error) => {
      showToast({
        title: "Campanha nao atualizada",
        description: error instanceof ApiClientError
          ? getApiErrorMessage(error.response)
          : "Nao foi possivel atualizar a campanha agora.",
        type: "error",
      });
    },
    onSuccess: async (campaign) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["campaign", campaign._id] }),
        queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
      ]);

      showToast({
        title: "Campanha atualizada",
        description: "As informacoes da campanha foram salvas.",
        type: "success",
      });
    },
  });
}
