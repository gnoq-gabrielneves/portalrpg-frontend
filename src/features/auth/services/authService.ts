import { parseApiResponse } from "@/shared/services/apiClient";
import { AuthSession, AuthUser, LoginRequestPayload } from "../types/auth";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function loginUser(
  payload: LoginRequestPayload,
): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<AuthSession>(response);
}

export async function refreshAuthSession(
  refreshToken: string,
): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<AuthSession>(response);
}

export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<AuthUser>(response);
}

export async function logoutUser(refreshToken: string) {
  const response = await fetch(`${apiBaseUrl}/auth/logout`, {
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    return;
  }

  return parseApiResponse<{ loggedOut: boolean }>(response);
}
