import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { RegisterUserPayload, registerUser } from "../services/registerUser";

type UseRegisterUserOptions = {
  onSuccess?: () => void;
};

export function useRegisterUser(options?: UseRegisterUserOptions) {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (payload: RegisterUserPayload) => registerUser(payload),
    onError: (error) => {
      showToast({
        title: "Cadastro nao concluido",
        description: error instanceof ApiClientError
          ? getApiErrorMessage(error.response)
          : "Nao foi possivel criar sua conta agora.",
        type: "error",
      });
    },
    onSuccess: () => {
      showToast({
        title: "Cadastro criado",
        description: "Sua conta esta pronta para entrar no portal.",
        type: "success",
      });
      options?.onSuccess?.();
    },
  });
}
