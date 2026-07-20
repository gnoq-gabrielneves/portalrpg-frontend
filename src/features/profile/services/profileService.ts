import { parseApiResponse } from "@/shared/services/apiClient";
import { AuthProfileSocialLink, AuthUser } from "@/features/auth/types/auth";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export type UpdateProfilePayload = {
  avatar?: File | null;
  bio: string;
  displayName: string;
  preferredSystems: string[];
  socialLinks: AuthProfileSocialLink[];
};

export async function updateMyProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
): Promise<AuthUser> {
  const formData = new FormData();

  formData.append("displayName", payload.displayName);
  formData.append("bio", payload.bio);
  formData.append(
    "preferredSystems",
    JSON.stringify(payload.preferredSystems),
  );
  formData.append("socialLinks", JSON.stringify(payload.socialLinks));

  if (payload.avatar) {
    formData.append("avatar", payload.avatar);
  }

  const response = await fetch(`${apiBaseUrl}/users/me/profile`, {
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "PATCH",
  });

  return parseApiResponse<AuthUser>(response);
}

export function toAbsoluteApiAssetUrl(assetUrl?: string) {
  if (!assetUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(assetUrl)) {
    return assetUrl;
  }

  return `${apiBaseUrl}${assetUrl}`;
}
