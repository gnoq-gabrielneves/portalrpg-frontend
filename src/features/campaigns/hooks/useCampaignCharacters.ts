"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaignCharacters } from "../services/campaignsService";
import { CampaignEntityType } from "../types/campaign";

export function useCampaignCharacters(
  campaignId: string,
  entityType: CampaignEntityType = "player_character",
) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId),
    queryFn: () =>
      getCampaignCharacters(accessToken ?? "", campaignId, entityType),
    queryKey: ["campaign", campaignId, "characters", entityType],
  });
}
