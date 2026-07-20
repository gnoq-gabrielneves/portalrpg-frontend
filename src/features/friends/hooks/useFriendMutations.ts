import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { ApiClientError } from "@/shared/services/apiClient";
import { useToast } from "@/shared/hooks/useToast";
import {
  acceptFriendRequest,
  createFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../services/friendsService";

export function useFriendMutations() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const refreshFriendQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["friends"] }),
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] }),
      queryClient.invalidateQueries({ queryKey: ["friend-search"] }),
    ]);
  };

  const sendRequest = useMutation({
    mutationFn: (recipientUserId: string) =>
      createFriendRequest(accessToken ?? "", recipientUserId),
    onError: (error) => {
      showToast({
        title: "Solicitação não enviada",
        description:
          error instanceof ApiClientError
            ? getApiErrorMessage(error.response)
            : "Não foi possível enviar o pedido agora.",
        type: "error",
      });
    },
    onSuccess: async () => {
      await refreshFriendQueries();
      showToast({
        title: "Solicitação enviada",
        description: "Agora é só aguardar a pessoa aceitar.",
        type: "success",
      });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: (requestId: string) =>
      acceptFriendRequest(accessToken ?? "", requestId),
    onSuccess: async () => {
      await refreshFriendQueries();
      showToast({
        title: "Amizade adicionada",
        description: "Vocês já podem se convidar para campanhas.",
        type: "success",
      });
    },
  });

  const declineRequest = useMutation({
    mutationFn: (requestId: string) =>
      declineFriendRequest(accessToken ?? "", requestId),
    onSuccess: async () => {
      await refreshFriendQueries();
      showToast({
        title: "Solicitação recusada",
        description: "O pedido foi removido da sua lista.",
        type: "success",
      });
    },
  });

  const removeFriendship = useMutation({
    mutationFn: (friendshipId: string) => removeFriend(accessToken ?? "", friendshipId),
    onSuccess: async () => {
      await refreshFriendQueries();
      showToast({
        title: "Amizade removida",
        description: "A pessoa saiu da sua lista de amigos.",
        type: "success",
      });
    },
  });

  return {
    acceptRequest,
    declineRequest,
    removeFriendship,
    sendRequest,
  };
}
