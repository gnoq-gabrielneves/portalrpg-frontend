import { CampaignHubPage } from "@/features/campaigns/pages/CampaignHubPage";

type CampaignPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Campaign({ params }: CampaignPageProps) {
  const { id } = await params;

  return <CampaignHubPage campaignId={id} />;
}
