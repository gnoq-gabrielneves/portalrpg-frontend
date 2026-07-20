export type FriendRequestStatus = "accepted" | "declined" | "pending";

export type FriendSearchStatus =
  | "friend"
  | "none"
  | "pending_received"
  | "pending_sent";

export type FriendUser = {
  avatarUrl?: string;
  displayName: string;
  email: string;
  id: string;
};

export type FriendSearchResult = FriendUser & {
  friendshipStatus: FriendSearchStatus;
};

export type FriendRequest = {
  createdAt?: string;
  id: string;
  recipient: FriendUser;
  requester: FriendUser;
  status: FriendRequestStatus;
  updatedAt?: string;
};

export type FriendRequestsResponse = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

export type Friendship = {
  createdAt?: string;
  friend: FriendUser;
  id: string;
};

export type RemoveFriendResponse = {
  removed: boolean;
};
