import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getFriendRequests } from "../services/friendsService";

export function useFriendRequests() {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getFriendRequests(accessToken ?? ""),
    queryKey: ["friend-requests"],
  });
}
