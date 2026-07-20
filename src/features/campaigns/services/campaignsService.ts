import { parseApiResponse } from "@/shared/services/apiClient";
import {
  Campaign,
  CampaignCharacter,
  CampaignEntityType,
  CampaignChatMessage,
  CampaignFilters,
  CampaignInvite,
  CampaignInviteFriend,
  CampaignMember,
  CreateCampaignChatMessagePayload,
  CreateCampaignPayload,
  CreateCampaignMapPayload,
  CreateCampaignSoundPayload,
  CreateCampaignTableTokenPayload,
  CreateOrdemAgentPayload,
  DeleteCampaignCharacterResponse,
  DeleteCampaignResponse,
  UpdateCampaignPayload,
  UpdateCampaignMapPayload,
  UpdateCampaignSoundPayload,
  UpdateCampaignTableTokenPayload,
  UpdateOrdemAgentPayload,
  UpdateOrdemAgentSkillsPayload,
} from "../types/campaign";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function getCampaigns(
  accessToken: string,
  filters?: CampaignFilters,
): Promise<Campaign[]> {
  const searchParams = new URLSearchParams();

  if (filters?.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters?.supportedSystemId) {
    searchParams.set("supportedSystemId", filters.supportedSystemId);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${apiBaseUrl}/campaigns${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<Campaign[]>(response);
}

export async function getCampaign(
  accessToken: string,
  campaignId: string,
): Promise<Campaign> {
  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<Campaign>(response);
}

export async function deleteCampaign(
  accessToken: string,
  campaignId: string,
): Promise<DeleteCampaignResponse> {
  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
  });

  return parseApiResponse<DeleteCampaignResponse>(response);
}

export async function deleteCampaignCharacter(
  accessToken: string,
  campaignId: string,
  entityId: string,
): Promise<DeleteCampaignCharacterResponse> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters/${entityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    },
  );

  return parseApiResponse<DeleteCampaignCharacterResponse>(response);
}

export async function getCampaignInviteFriends(
  accessToken: string,
  campaignId: string,
): Promise<CampaignInviteFriend[]> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/invite-friends`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<CampaignInviteFriend[]>(response);
}

export async function createCampaignInvite(
  accessToken: string,
  campaignId: string,
  recipientUserId: string,
): Promise<CampaignInvite> {
  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}/invites`, {
    body: JSON.stringify({ recipientUserId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<CampaignInvite>(response);
}

export async function acceptCampaignInvite(
  accessToken: string,
  inviteId: string,
): Promise<CampaignInvite> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/invites/${inviteId}/accept`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<CampaignInvite>(response);
}

export async function declineCampaignInvite(
  accessToken: string,
  inviteId: string,
): Promise<CampaignInvite> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/invites/${inviteId}/decline`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<CampaignInvite>(response);
}

export async function getCampaignMembers(
  accessToken: string,
  campaignId: string,
): Promise<CampaignMember[]> {
  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}/members`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<CampaignMember[]>(response);
}

export async function getCampaignCharacters(
  accessToken: string,
  campaignId: string,
  entityType?: CampaignEntityType,
): Promise<CampaignCharacter[]> {
  const searchParams = new URLSearchParams();

  if (entityType) {
    searchParams.set("type", entityType);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<CampaignCharacter[]>(response);
}

export async function getCampaignCharacter(
  accessToken: string,
  campaignId: string,
  entityId: string,
): Promise<CampaignCharacter> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters/${entityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<CampaignCharacter>(response);
}

export async function createOrdemAgent(
  accessToken: string,
  campaignId: string,
  payload: CreateOrdemAgentPayload,
): Promise<CampaignCharacter> {
  const formData = new FormData();

  formData.append("agentClass", payload.agentClass);
  formData.append("name", payload.name);
  formData.append("nex", String(payload.nex));
  formData.append("ownerId", payload.ownerId);

  appendOptionalNumber(formData, "agility", payload.agility);
  appendOptionalNumber(formData, "defense", payload.defense);
  appendOptionalNumber(formData, "effortPoints", payload.effortPoints);
  appendOptionalNumber(formData, "healthPoints", payload.healthPoints);
  appendOptionalNumber(formData, "intellect", payload.intellect);
  appendOptionalNumber(formData, "maxEffortPoints", payload.maxEffortPoints);
  appendOptionalNumber(formData, "maxHealthPoints", payload.maxHealthPoints);
  appendOptionalNumber(formData, "maxSanity", payload.maxSanity);
  appendOptionalNumber(formData, "movement", payload.movement);
  appendOptionalNumber(formData, "presence", payload.presence);
  appendOptionalNumber(formData, "sanity", payload.sanity);
  appendOptionalNumber(formData, "strength", payload.strength);
  appendOptionalNumber(formData, "vigor", payload.vigor);

  if (payload.concept !== undefined) {
    formData.append("concept", payload.concept);
  }

  if (payload.appearance !== undefined) {
    formData.append("appearance", payload.appearance);
  }

  if (payload.history !== undefined) {
    formData.append("history", payload.history);
  }

  if (payload.notes !== undefined) {
    formData.append("notes", payload.notes);
  }

  if (payload.objective !== undefined) {
    formData.append("objective", payload.objective);
  }

  if (payload.origin !== undefined) {
    formData.append("origin", payload.origin);
  }

  if (payload.path !== undefined) {
    formData.append("path", payload.path);
  }

  if (payload.personality !== undefined) {
    formData.append("personality", payload.personality);
  }

  if (payload.icon) {
    formData.append("icon", payload.icon);
  }

  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters/ordem-agents`,
    {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    },
  );

  return parseApiResponse<CampaignCharacter>(response);
}

export async function updateOrdemAgent(
  accessToken: string,
  campaignId: string,
  entityId: string,
  payload: UpdateOrdemAgentPayload,
): Promise<CampaignCharacter> {
  const formData = new FormData();

  appendOptionalString(formData, "agentClass", payload.agentClass);
  appendOptionalString(formData, "appearance", payload.appearance);
  appendOptionalString(formData, "concept", payload.concept);
  appendOptionalString(formData, "history", payload.history);
  appendOptionalString(formData, "name", payload.name);
  appendOptionalString(formData, "notes", payload.notes);
  appendOptionalString(formData, "objective", payload.objective);
  appendOptionalString(formData, "origin", payload.origin);
  appendOptionalString(formData, "path", payload.path);
  appendOptionalString(formData, "personality", payload.personality);
  appendOptionalNumber(formData, "agility", payload.agility);
  appendOptionalNumber(formData, "effortPoints", payload.effortPoints);
  appendOptionalNumber(formData, "healthPoints", payload.healthPoints);
  appendOptionalNumber(formData, "intellect", payload.intellect);
  appendOptionalJson(formData, "manualPowers", payload.manualPowers);
  appendOptionalNumber(formData, "maxEffortPoints", payload.maxEffortPoints);
  appendOptionalNumber(formData, "maxHealthPoints", payload.maxHealthPoints);
  appendOptionalNumber(formData, "maxSanity", payload.maxSanity);
  appendOptionalNumber(formData, "nex", payload.nex);
  appendOptionalNumber(formData, "presence", payload.presence);
  appendOptionalNumber(formData, "sanity", payload.sanity);
  appendOptionalNumber(formData, "strength", payload.strength);
  appendOptionalNumber(formData, "vigor", payload.vigor);

  if (payload.icon) {
    formData.append("icon", payload.icon);
  }

  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters/${entityId}/ordem-agent`,
    {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<CampaignCharacter>(response);
}

export async function updateOrdemAgentSkills(
  accessToken: string,
  campaignId: string,
  entityId: string,
  payload: UpdateOrdemAgentSkillsPayload,
): Promise<CampaignCharacter> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/characters/${entityId}/ordem-agent/skills`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<CampaignCharacter>(response);
}

export async function createCampaign(
  accessToken: string,
  payload: CreateCampaignPayload,
): Promise<Campaign> {
  const response = await fetch(`${apiBaseUrl}/campaigns`, {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<Campaign>(response);
}

function appendOptionalNumber(
  formData: FormData,
  key: string,
  value: number | undefined,
) {
  if (value !== undefined) {
    formData.append(key, String(value));
  }
}

function appendOptionalString(
  formData: FormData,
  key: keyof UpdateOrdemAgentPayload,
  value: string | undefined,
) {
  if (value !== undefined) {
    formData.append(key, value);
  }
}

function appendOptionalJson(
  formData: FormData,
  key: keyof UpdateOrdemAgentPayload,
  value: object | undefined,
) {
  if (value !== undefined) {
    formData.append(key, JSON.stringify(value));
  }
}

export async function updateCampaign(
  accessToken: string,
  campaignId: string,
  payload: UpdateCampaignPayload,
): Promise<Campaign> {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }

  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }

  if (payload.icon) {
    formData.append("icon", payload.icon);
  }

  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "PATCH",
  });

  return parseApiResponse<Campaign>(response);
}

export async function createCampaignMap(
  accessToken: string,
  campaignId: string,
  payload: CreateCampaignMapPayload,
): Promise<Campaign> {
  const formData = new FormData();

  formData.append("map", payload.map);
  appendCampaignMapFields(formData, payload);

  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}/maps`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
  });

  return parseApiResponse<Campaign>(response);
}

export async function updateCampaignMap(
  accessToken: string,
  campaignId: string,
  mapId: string,
  payload: UpdateCampaignMapPayload,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/maps/${mapId}`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function setActiveCampaignMap(
  accessToken: string,
  campaignId: string,
  mapId: string,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/maps/${mapId}/active`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function deleteCampaignMap(
  accessToken: string,
  campaignId: string,
  mapId: string,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/maps/${mapId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function createCampaignSound(
  accessToken: string,
  campaignId: string,
  payload: CreateCampaignSoundPayload,
): Promise<Campaign> {
  const formData = new FormData();

  formData.append("sound", payload.sound);
  formData.append("name", payload.name);
  formData.append("type", payload.type);

  const response = await fetch(`${apiBaseUrl}/campaigns/${campaignId}/sounds`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
  });

  return parseApiResponse<Campaign>(response);
}

export async function updateCampaignSound(
  accessToken: string,
  campaignId: string,
  soundId: string,
  payload: UpdateCampaignSoundPayload,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/sounds/${soundId}`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function deleteCampaignSound(
  accessToken: string,
  campaignId: string,
  soundId: string,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/sounds/${soundId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function createCampaignTableToken(
  accessToken: string,
  campaignId: string,
  payload: CreateCampaignTableTokenPayload,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/table-tokens`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function updateCampaignTableToken(
  accessToken: string,
  campaignId: string,
  tokenId: string,
  payload: UpdateCampaignTableTokenPayload,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/table-tokens/${tokenId}`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function deleteCampaignTableToken(
  accessToken: string,
  campaignId: string,
  tokenId: string,
): Promise<Campaign> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/table-tokens/${tokenId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    },
  );

  return parseApiResponse<Campaign>(response);
}

export async function getCampaignChatMessages(
  accessToken: string,
  campaignId: string,
): Promise<CampaignChatMessage[]> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/chat-messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<CampaignChatMessage[]>(response);
}

export async function createCampaignChatMessage(
  accessToken: string,
  campaignId: string,
  payload: CreateCampaignChatMessagePayload,
): Promise<CampaignChatMessage> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/chat-messages`,
    {
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  return parseApiResponse<CampaignChatMessage>(response);
}

export async function clearCampaignChatMessages(
  accessToken: string,
  campaignId: string,
): Promise<{ cleared: boolean }> {
  const response = await fetch(
    `${apiBaseUrl}/campaigns/${campaignId}/chat-messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    },
  );

  return parseApiResponse<{ cleared: boolean }>(response);
}

export function getCampaignAssetUrl(assetUrl?: string) {
  if (!assetUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl;
  }

  return `${apiBaseUrl}${assetUrl}`;
}

function appendCampaignMapFields(
  formData: FormData,
  payload: CreateCampaignMapPayload,
) {
  formData.append("name", payload.name);

  if (payload.hasEmbeddedGrid !== undefined) {
    formData.append("hasEmbeddedGrid", String(payload.hasEmbeddedGrid));
  }

  if (payload.showGrid !== undefined) {
    formData.append("showGrid", String(payload.showGrid));
  }

  appendOptionalNumber(formData, "gridSize", payload.gridSize);
  appendOptionalNumber(formData, "gridOffsetX", payload.gridOffsetX);
  appendOptionalNumber(formData, "gridOffsetY", payload.gridOffsetY);
  appendOptionalNumber(formData, "gridOpacity", payload.gridOpacity);

  if (payload.gridColor !== undefined) {
    formData.append("gridColor", payload.gridColor);
  }
}
