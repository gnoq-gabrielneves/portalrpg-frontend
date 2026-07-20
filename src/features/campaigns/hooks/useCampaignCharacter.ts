"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaignCharacter } from "../services/campaignsService";

export function useCampaignCharacter(campaignId: string, entityId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId && entityId),
    queryFn: () => getCampaignCharacter(accessToken ?? "", campaignId, entityId),
    queryKey: ["campaign", campaignId, "characters", entityId],
  });
}
