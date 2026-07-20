import {
  OrdemAgentAttributes,
  OrdemAgentClass,
  OrdemAgentDerivedStats,
  OrdemAgentSkill,
  OrdemAgentSkillAttribute,
  OrdemAgentSkillKey,
} from "../types/campaign";

type OrdemAgentClassProgression = {
  baseEffortPoints: number;
  baseHealthPoints: number;
  baseSanity: number;
  effortPointsPerNex: number;
  healthPointsPerNex: number;
  sanityPerNex: number;
};

const ORDEM_AGENT_CLASS_PROGRESSION: Record<
  OrdemAgentClass,
  OrdemAgentClassProgression
> = {
  combatente: {
    baseEffortPoints: 2,
    baseHealthPoints: 20,
    baseSanity: 12,
    effortPointsPerNex: 2,
    healthPointsPerNex: 4,
    sanityPerNex: 3,
  },
  especialista: {
    baseEffortPoints: 3,
    baseHealthPoints: 16,
    baseSanity: 16,
    effortPointsPerNex: 3,
    healthPointsPerNex: 3,
    sanityPerNex: 4,
  },
  ocultista: {
    baseEffortPoints: 4,
    baseHealthPoints: 12,
    baseSanity: 20,
    effortPointsPerNex: 4,
    healthPointsPerNex: 2,
    sanityPerNex: 5,
  },
};

const ORDEM_AGENT_ATTRIBUTE_BY_SKILL: Record<
  OrdemAgentSkillAttribute,
  keyof OrdemAgentAttributes
> = {
  AGI: "agility",
  FOR: "strength",
  INT: "intellect",
  PRE: "presence",
  VIG: "vigor",
};

export function calculateOrdemAgentDerivedStats({
  agentClass,
  attributes,
  movement,
  nex,
  origin,
  skills,
}: {
  agentClass: OrdemAgentClass;
  attributes: OrdemAgentAttributes;
  movement?: number;
  nex: number;
  origin?: string;
  skills: OrdemAgentSkill[];
}): OrdemAgentDerivedStats {
  const progression = ORDEM_AGENT_CLASS_PROGRESSION[agentClass];
  const progressionSteps = getNexProgressionSteps(nex);
  const healthGainPerStep = progression.healthPointsPerNex + attributes.vigor;
  const effortGainPerStep = progression.effortPointsPerNex + attributes.presence;
  let defense = 10 + attributes.agility;
  let effortLimitPerTurn = getEffortLimitPerTurn(nex);
  const fortitude = getSkillStaticBonus("fortitude", attributes, skills);
  const reflexes = getSkillStaticBonus("reflexes", attributes, skills);
  let maxEffortPoints =
    progression.baseEffortPoints +
    attributes.presence +
    progressionSteps * effortGainPerStep;
  let maxHealthPoints =
    progression.baseHealthPoints +
    attributes.vigor +
    progressionSteps * healthGainPerStep;
  let maxSanity =
    progression.baseSanity + progressionSteps * progression.sanityPerNex;

  if (origin === "desgarrado") {
    maxHealthPoints += Math.floor(normalizeNex(nex) / 5);
  }

  if (origin === "policial") {
    defense += 2;
  }

  if (origin === "universitario") {
    maxEffortPoints += getUniversitarioExtraEffortPoints(nex);
    effortLimitPerTurn += 1;
  }

  if (origin === "cultista-arrependido") {
    maxSanity = Math.floor(maxSanity / 2);
  }

  return {
    block: fortitude,
    defense,
    dodge: defense + reflexes,
    effortLimitPerTurn,
    maxEffortPoints,
    maxHealthPoints,
    maxSanity,
    movement: movement ?? 9,
  };
}

function getNexProgressionSteps(nex: number) {
  return Math.max(0, Math.floor(normalizeNex(nex) / 5) - 1);
}

function getEffortLimitPerTurn(nex: number) {
  return Math.max(1, Math.ceil(normalizeNex(nex) / 5));
}

function getUniversitarioExtraEffortPoints(nex: number) {
  const normalizedNex = normalizeNex(nex);

  if (normalizedNex < 15) {
    return 1;
  }

  return 1 + Math.floor((normalizedNex - 5) / 10);
}

function getSkillStaticBonus(
  key: OrdemAgentSkillKey,
  attributes: OrdemAgentAttributes,
  skills: OrdemAgentSkill[],
) {
  const skill = skills.find((item) => item.key === key);

  if (!skill || skill.trainingBonus <= 0) {
    return 0;
  }

  return (
    attributes[ORDEM_AGENT_ATTRIBUTE_BY_SKILL[skill.attribute]] +
    skill.trainingBonus +
    skill.otherBonus
  );
}

function normalizeNex(nex: number) {
  return Math.min(99, Math.max(5, nex));
}
