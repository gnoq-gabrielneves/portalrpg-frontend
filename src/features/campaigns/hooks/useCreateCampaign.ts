import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createCampaign } from "../services/campaignsService";
import { CreateCampaignPayload } from "../types/campaign";

export function useCreateCampaign() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      createCampaign(accessToken ?? "", payload),
    onError: (error) => {
      showToast({
        title: "Campanha nao criada",
        description: error instanceof ApiClientError
          ? getApiErrorMessage(error.response)
          : "Nao foi possivel criar a campanha agora.",
        type: "error",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      showToast({
        title: "Campanha criada",
        description: "O hub da sua mesa ja esta pronto.",
        type: "success",
      });
    },
  });
}
