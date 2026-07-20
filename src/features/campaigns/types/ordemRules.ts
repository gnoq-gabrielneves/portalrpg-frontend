import { OrdemAgentClass, OrdemAgentSkillKey } from "./campaign";

export type OrdemOrigin = {
  _id: string;
  description: string;
  isActive: boolean;
  key: string;
  name: string;
  powerKey: string;
  trainedSkillKeys: OrdemAgentSkillKey[];
};

export type OrdemOriginPower = {
  _id: string;
  isActive: boolean;
  key: string;
  name: string;
  originKey: string;
  summary: string;
};

export type OrdemClassTrack = {
  _id: string;
  classKey: OrdemAgentClass;
  isActive: boolean;
  key: string;
  name: string;
  unlockNex: number;
};
