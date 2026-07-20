"use client";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { ToastProvider } from "../components/Toast";
import { getApiErrorMessage } from "../helpers/backend";
import { useToast } from "../hooks/useToast";
import { ApiClientError } from "../services/apiClient";

export function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <AuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function QueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { showToast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          // Erro global de queries: qualquer useQuery que falhar cai aqui.
          onError: (error) => {
            if (error instanceof ApiClientError && error.statusCode === 401) {
              return;
            }

            showToast({
              title: "Erro ao carregar dados",
              description: error instanceof ApiClientError
                ? getApiErrorMessage(error.response)
                : "Nao foi possivel buscar as informacoes agora.",
              type: "error",
            });
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
