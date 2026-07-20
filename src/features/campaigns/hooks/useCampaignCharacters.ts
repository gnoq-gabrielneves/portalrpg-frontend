"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaignCharacters } from "../services/campaignsService";

export function useCampaignCharacters(campaignId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId),
    queryFn: () => getCampaignCharacters(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId, "characters"],
  });
}
