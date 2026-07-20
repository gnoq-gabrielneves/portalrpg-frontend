"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCampaignInviteFriends } from "../services/campaignsService";

export function useCampaignInviteFriends(campaignId: string) {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken && campaignId),
    queryFn: () => getCampaignInviteFriends(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId, "invite-friends"],
  });
}
