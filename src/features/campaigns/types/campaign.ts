export type CampaignStatus = "active" | "archived";

export type Campaign = {
  _id: string;
  activeMapId?: string;
  createdAt?: string;
  description?: string;
  iconUrl?: string;
  maps?: CampaignMap[];
  name: string;
  ownerId: string;
  status: CampaignStatus;
  chatMessages?: CampaignChatMessage[];
  sounds?: CampaignSound[];
  system?: string;
  tableTokens?: CampaignTableToken[];
  supportedSystemId?: string;
  theme?: string;
  updatedAt?: string;
};

export type CampaignMapGrid = {
  color: string;
  offsetX: number;
  offsetY: number;
  opacity: number;
  show: boolean;
  size: number;
};

export type CampaignMap = {
  createdAt?: string;
  grid: CampaignMapGrid;
  hasEmbeddedGrid: boolean;
  id: string;
  imageUrl: string;
  name: string;
};

export type CampaignSoundType = "effect" | "music";

export type CampaignSound = {
  audioUrl: string;
  createdAt?: string;
  id: string;
  name: string;
  type: CampaignSoundType;
};

export type CreateCampaignSoundPayload = {
  name: string;
  sound: File;
  type: CampaignSoundType;
};

export type UpdateCampaignSoundPayload = Partial<{
  name: string;
  type: CampaignSoundType;
}>;

export type CampaignTableToken = {
  characterEntityId: string;
  createdAt?: string;
  id: string;
  status?: CampaignTableTokenStatus;
  x: number;
  y: number;
};

export type CampaignTableTokenStatus =
  | "dead"
  | "dying"
  | "injured"
  | "normal"
  | "unconscious";

export type CreateCampaignTableTokenPayload = {
  characterEntityId: string;
};

export type UpdateCampaignTableTokenPayload = Partial<{
  status: CampaignTableTokenStatus;
  x: number;
  y: number;
}>;

export type CampaignChatMessageType = "message" | "roll";

export type CampaignChatMessage = {
  authorId: string;
  authorAvatarUrl?: string;
  authorName: string;
  characterEntityId?: string;
  characterName?: string;
  createdAt?: string;
  id: string;
  rollFormula?: string;
  rollResult?: number;
  text: string;
  type: CampaignChatMessageType;
};

export type CreateCampaignChatMessagePayload = {
  characterEntityId?: string;
  characterName?: string;
  rollFormula?: string;
  rollResult?: number;
  text: string;
  type?: CampaignChatMessageType;
};

export type CreateCampaignMapPayload = {
  gridColor?: string;
  gridOffsetX?: number;
  gridOffsetY?: number;
  gridOpacity?: number;
  gridSize?: number;
  hasEmbeddedGrid?: boolean;
  map: File;
  name: string;
  showGrid?: boolean;
};

export type UpdateCampaignMapPayload = Partial<
  Omit<CreateCampaignMapPayload, "map">
>;

export type CampaignFilters = {
  search?: string;
  supportedSystemId?: string;
};

export type CreateCampaignPayload = {
  description?: string;
  name: string;
  supportedSystemId: string;
  theme?: string;
};

export type UpdateCampaignPayload = {
  description?: string;
  icon?: File | null;
  name?: string;
};

export type DeleteCampaignResponse = {
  deleted: boolean;
};

export type DeleteCampaignCharacterResponse = {
  deleted: boolean;
};

export type CampaignUser = {
  avatarUrl?: string;
  displayName: string;
  email: string;
  id: string;
};

export type CampaignInviteStatus = "accepted" | "declined" | "pending";

export type CampaignInviteFriendStatus = "available" | "member" | "pending";

export type CampaignInviteFriend = {
  friend: CampaignUser;
  friendshipId: string;
  inviteId?: string;
  status: CampaignInviteFriendStatus;
};

export type CampaignInvite = {
  campaignId: string;
  createdAt?: string;
  id: string;
  recipient: CampaignUser;
  requester: CampaignUser;
  status: CampaignInviteStatus;
  updatedAt?: string;
};

export type CampaignMemberRole = "game_master" | "player";

export type CampaignMember = {
  id: string;
  joinedAt?: string;
  role: CampaignMemberRole;
  user: CampaignUser;
};

export type CampaignEntitySystem = "ordem_paranormal";

export type CampaignEntityType = "enemy" | "npc" | "player_character";

export type OrdemAgentClass = "combatente" | "especialista" | "ocultista";

export type OrdemAgentAttributes = {
  agility: number;
  intellect: number;
  presence: number;
  strength: number;
  vigor: number;
};

export type OrdemAgentPools = {
  defense: number;
  effortPoints: number;
  healthPoints: number;
  maxEffortPoints: number;
  maxHealthPoints: number;
  maxSanity: number;
  sanity: number;
};

export type OrdemAgentDerivedStats = {
  block: number;
  defense: number;
  dodge: number;
  effortLimitPerTurn: number;
  maxEffortPoints: number;
  maxHealthPoints: number;
  maxSanity: number;
  movement: number;
};

export type OrdemAgentSkillAttribute = "AGI" | "FOR" | "INT" | "PRE" | "VIG";

export type OrdemAgentSkillKey =
  | "acrobatics"
  | "aim"
  | "animal_handling"
  | "arts"
  | "athletics"
  | "crime"
  | "current_affairs"
  | "deception"
  | "diplomacy"
  | "fortitude"
  | "initiative"
  | "intimidation"
  | "intuition"
  | "investigation"
  | "medicine"
  | "occultism"
  | "perception"
  | "pilotage"
  | "profession"
  | "reflexes"
  | "religion"
  | "sciences"
  | "stealth"
  | "survival"
  | "tactics"
  | "technology"
  | "weaponry"
  | "will";

export type OrdemAgentSkill = {
  attribute: OrdemAgentSkillAttribute;
  key: OrdemAgentSkillKey;
  label: string;
  otherBonus: number;
  trainingBonus: number;
};

export type OrdemAgentManualPower = {
  category?: string;
  damageRoll?: string;
  description: string;
  hasDamageRoll?: boolean;
  hasTestRoll?: boolean;
  id: string;
  isRollable?: boolean;
  name: string;
  testRoll?: string;
};

export type CampaignCharacter = {
  agentClass?: OrdemAgentClass;
  appearance?: string;
  attributes?: OrdemAgentAttributes;
  avatarUrl?: string;
  concept?: string;
  createdAt?: string;
  derivedStats?: OrdemAgentDerivedStats;
  entityId: string;
  history?: string;
  id: string;
  manualPowers?: OrdemAgentManualPower[];
  movement?: number;
  name: string;
  nex?: number;
  notes?: string;
  objective?: string;
  origin?: string;
  owner: CampaignUser;
  path?: string;
  personality?: string;
  pools?: OrdemAgentPools;
  skills?: OrdemAgentSkill[];
  systemKey: CampaignEntitySystem;
  type: CampaignEntityType;
  updatedAt?: string;
};

export type CreateOrdemAgentPayload = {
  agentClass: OrdemAgentClass;
  agility?: number;
  appearance?: string;
  concept?: string;
  defense?: number;
  effortPoints?: number;
  healthPoints?: number;
  history?: string;
  icon?: File | null;
  intellect?: number;
  maxEffortPoints?: number;
  maxHealthPoints?: number;
  maxSanity?: number;
  movement?: number;
  name: string;
  nex: number;
  notes?: string;
  objective?: string;
  origin?: string;
  ownerId: string;
  path?: string;
  personality?: string;
  presence?: number;
  sanity?: number;
  strength?: number;
  vigor?: number;
};

export type UpdateOrdemAgentPayload = {
  agentClass?: OrdemAgentClass;
  agility?: number;
  appearance?: string;
  concept?: string;
  effortPoints?: number;
  healthPoints?: number;
  history?: string;
  icon?: File | null;
  intellect?: number;
  maxEffortPoints?: number;
  maxHealthPoints?: number;
  maxSanity?: number;
  manualPowers?: OrdemAgentManualPower[];
  name?: string;
  nex?: number;
  notes?: string;
  objective?: string;
  origin?: string;
  path?: string;
  personality?: string;
  presence?: number;
  sanity?: number;
  strength?: number;
  vigor?: number;
};

export type UpdateOrdemAgentSkillPayload = {
  key: OrdemAgentSkillKey;
  otherBonus: number;
  trainingBonus: number;
};

export type UpdateOrdemAgentSkillsPayload = {
  skills: UpdateOrdemAgentSkillPayload[];
};
