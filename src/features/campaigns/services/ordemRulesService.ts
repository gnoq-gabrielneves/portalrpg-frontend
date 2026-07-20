import { parseApiResponse } from "@/shared/services/apiClient";
import { OrdemAgentClass } from "../types/campaign";
import {
  OrdemClassTrack,
  OrdemOrigin,
  OrdemOriginPower,
} from "../types/ordemRules";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function getOrdemOrigins(): Promise<OrdemOrigin[]> {
  const response = await fetch(`${apiBaseUrl}/ordem-rules/origins`);

  return parseApiResponse<OrdemOrigin[]>(response);
}

export async function getOrdemOriginPowers(): Promise<OrdemOriginPower[]> {
  const response = await fetch(`${apiBaseUrl}/ordem-rules/origin-powers`);

  return parseApiResponse<OrdemOriginPower[]>(response);
}

export async function getOrdemClassTracks(
  agentClass: OrdemAgentClass,
  nex: number,
): Promise<OrdemClassTrack[]> {
  const searchParams = new URLSearchParams({
    classKey: agentClass,
    nex: String(nex),
  });
  const response = await fetch(
    `${apiBaseUrl}/ordem-rules/class-tracks?${searchParams.toString()}`,
  );

  return parseApiResponse<OrdemClassTrack[]>(response);
}
