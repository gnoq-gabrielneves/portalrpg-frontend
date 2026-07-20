import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getFriends } from "../services/friendsService";

export function useFriends() {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getFriends(accessToken ?? ""),
    queryKey: ["friends"],
  });
}
