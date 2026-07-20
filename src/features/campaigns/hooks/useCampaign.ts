import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaign } from "../services/campaignsService";

export function useCampaign(campaignId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId),
    queryFn: () => getCampaign(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId],
  });
}
