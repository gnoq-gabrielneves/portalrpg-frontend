import { UpdateOrdemAgentPayload } from "./campaign";

export type AttributeFieldName =
  | "agility"
  | "intellect"
  | "presence"
  | "strength"
  | "vigor";

export type ResourceFieldName = "effortPoints" | "healthPoints" | "sanity";

export type ResourceMaxFieldName =
  | "maxEffortPoints"
  | "maxHealthPoints"
  | "maxSanity";

export type SheetTab = "combat" | "description" | "inventory" | "powers" | "rituals";

export type OrdemAgentInputName = keyof UpdateOrdemAgentPayload;
