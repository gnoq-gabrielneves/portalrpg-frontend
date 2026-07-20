import { parseApiResponse } from "@/shared/services/apiClient";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type RegisterUserPayload = {
  displayName: string;
  email: string;
  password: string;
};

export type RegisterUserResponse = {
  _id: string;
  email: string;
};

export async function registerUser(
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> {
  const response = await fetch(`${apiBaseUrl}/users`, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<RegisterUserResponse>(response);
}
