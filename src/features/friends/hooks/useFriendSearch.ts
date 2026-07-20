import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { searchFriends } from "../services/friendsService";

export function useFriendSearch(search: string) {
  const { accessToken } = useAuth();
  const normalizedSearch = search.trim();

  return useQuery({
    enabled: Boolean(accessToken && normalizedSearch.length >= 2),
    queryFn: () => searchFriends(accessToken ?? "", normalizedSearch),
    queryKey: ["friend-search", normalizedSearch],
  });
}
