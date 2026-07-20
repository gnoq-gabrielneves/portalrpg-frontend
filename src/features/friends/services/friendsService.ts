import { parseApiResponse } from "@/shared/services/apiClient";
import {
  FriendRequest,
  FriendRequestsResponse,
  FriendSearchResult,
  Friendship,
  RemoveFriendResponse,
} from "../types/friend";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function searchFriends(
  accessToken: string,
  search: string,
): Promise<FriendSearchResult[]> {
  const searchParams = new URLSearchParams();

  if (search.trim()) {
    searchParams.set("search", search.trim());
  }

  const response = await fetch(
    `${apiBaseUrl}/friends/search?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return parseApiResponse<FriendSearchResult[]>(response);
}

export async function getFriends(accessToken: string): Promise<Friendship[]> {
  const response = await fetch(`${apiBaseUrl}/friends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<Friendship[]>(response);
}

export async function getFriendRequests(
  accessToken: string,
): Promise<FriendRequestsResponse> {
  const response = await fetch(`${apiBaseUrl}/friends/requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseApiResponse<FriendRequestsResponse>(response);
}

export async function createFriendRequest(
  accessToken: string,
  recipientUserId: string,
): Promise<FriendRequest> {
  const response = await fetch(`${apiBaseUrl}/friends/requests`, {
    body: JSON.stringify({ recipientUserId }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return parseApiResponse<FriendRequest>(response);
}

export async function acceptFriendRequest(
  accessToken: string,
  requestId: string,
): Promise<FriendRequest> {
  const response = await fetch(
    `${apiBaseUrl}/friends/requests/${requestId}/accept`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<FriendRequest>(response);
}

export async function declineFriendRequest(
  accessToken: string,
  requestId: string,
): Promise<FriendRequest> {
  const response = await fetch(
    `${apiBaseUrl}/friends/requests/${requestId}/decline`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "PATCH",
    },
  );

  return parseApiResponse<FriendRequest>(response);
}

export async function removeFriend(
  accessToken: string,
  friendshipId: string,
): Promise<RemoveFriendResponse> {
  const response = await fetch(`${apiBaseUrl}/friends/${friendshipId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
  });

  return parseApiResponse<RemoveFriendResponse>(response);
}
