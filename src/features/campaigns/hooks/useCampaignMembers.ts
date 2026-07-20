"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaignMembers } from "../services/campaignsService";

export function useCampaignMembers(campaignId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId),
    queryFn: () => getCampaignMembers(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId, "members"],
  });
}
