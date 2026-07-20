"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { deleteCampaign } from "../services/campaignsService";

export function useDeleteCampaign() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (campaignId: string) =>
      deleteCampaign(accessToken ?? "", campaignId),
    onError: (error) => {
      showToast({
        title: "Campanha nao excluida",
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Nao foi possivel excluir a campanha agora.",
        type: "error",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      showToast({
        title: "Campanha excluida",
        description: "A campanha foi removida da sua lista.",
        type: "success",
      });

      router.push("/campaigns");
    },
  });
}
