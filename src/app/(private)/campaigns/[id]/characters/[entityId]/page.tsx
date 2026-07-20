import { CampaignCharacterPage } from "@/features/campaigns/pages/CampaignCharacterPage";

type CampaignCharacterRouteProps = {
  params: Promise<{
    entityId: string;
    id: string;
  }>;
};

export default async function CampaignCharacter({
  params,
}: CampaignCharacterRouteProps) {
  const { entityId, id } = await params;

  return <CampaignCharacterPage campaignId={id} entityId={entityId} />;
}
