import { CampaignTablePage } from "@/features/campaigns/pages/CampaignTablePage";

type CampaignTableRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CampaignTable({ params }: CampaignTableRouteProps) {
  const { id } = await params;

  return <CampaignTablePage campaignId={id} />;
}
