import { CampaignMasterShieldPage } from "@/features/campaigns/pages/CampaignMasterShieldPage";

type CampaignMasterShieldRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignMasterShield({
  params,
}: CampaignMasterShieldRouteProps) {
  const { id } = await params;

  return <CampaignMasterShieldPage campaignId={id} />;
}
