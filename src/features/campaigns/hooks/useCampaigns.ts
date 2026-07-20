import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaigns } from "../services/campaignsService";
import { CampaignFilters } from "../types/campaign";

export function useCampaigns(filters?: CampaignFilters) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getCampaigns(accessToken ?? "", filters),
    queryKey: ["campaigns", filters],
  });
}
