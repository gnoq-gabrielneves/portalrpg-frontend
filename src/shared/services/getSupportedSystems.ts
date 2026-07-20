import { SupportedSystem } from "../database/SupportedSystems";
import { parseApiResponse } from "./apiClient";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function getSupportedSystems(): Promise<SupportedSystem[]> {
  const response = await fetch(`${apiBaseUrl}/supported-systems`);

  return parseApiResponse<SupportedSystem[]>(response);
}
