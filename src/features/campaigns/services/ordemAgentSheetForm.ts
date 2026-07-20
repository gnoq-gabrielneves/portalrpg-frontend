import {
  CampaignCharacter,
  OrdemAgentClass,
  OrdemAgentManualPower,
  OrdemAgentSkill,
  OrdemAgentSkillKey,
  UpdateOrdemAgentPayload,
  UpdateOrdemAgentSkillPayload,
} from "../types/campaign";

export type OrdemAgentResourcePreview = {
  effortPoints: number;
  healthPoints: number;
  sanity: number;
};

export function buildSkillPayload(
  formData: FormData,
  skills: OrdemAgentSkill[],
): UpdateOrdemAgentSkillPayload[] {
  return skills.map((skill) => ({
    key: skill.key,
    otherBonus: getNumericFormValue(
      formData,
      getSkillInputName(skill.key, "otherBonus"),
      skill.otherBonus,
    ),
    trainingBonus: normalizeTrainingBonus(
      getNumericFormValue(
        formData,
        getSkillInputName(skill.key, "trainingBonus"),
        skill.trainingBonus,
      ),
    ),
  }));
}

export function buildOrdemAgentPayload(
  formData: FormData,
  agentClass: OrdemAgentClass,
): UpdateOrdemAgentPayload {
  return {
    agentClass,
    agility: getFormNumber(formData, "agility", 1),
    appearance: getTrimmedFormString(formData, "appearance"),
    concept: getTrimmedFormString(formData, "concept"),
    effortPoints: getFormNumber(formData, "effortPoints", 0),
    healthPoints: getFormNumber(formData, "healthPoints", 0),
    history: getTrimmedFormString(formData, "history"),
    icon: getFormFile(formData, "icon"),
    intellect: getFormNumber(formData, "intellect", 1),
  maxEffortPoints: getFormNumber(formData, "maxEffortPoints", 0),
  maxHealthPoints: getFormNumber(formData, "maxHealthPoints", 0),
  maxSanity: getFormNumber(formData, "maxSanity", 0),
  manualPowers: getManualPowers(formData),
  name: getTrimmedFormString(formData, "name"),
    nex: getFormNumber(formData, "nex", 5),
    notes: getTrimmedFormString(formData, "notes"),
    objective: getTrimmedFormString(formData, "objective"),
    origin: getTrimmedFormString(formData, "origin"),
    path: getTrimmedFormString(formData, "path"),
    personality: getTrimmedFormString(formData, "personality"),
    presence: getFormNumber(formData, "presence", 1),
    sanity: getFormNumber(formData, "sanity", 0),
    strength: getFormNumber(formData, "strength", 1),
    vigor: getFormNumber(formData, "vigor", 1),
  };
}

export function buildResourcePreview(
  formData: FormData,
  fallback: OrdemAgentResourcePreview,
): OrdemAgentResourcePreview {
  return {
    effortPoints: getFormNumber(
      formData,
      "effortPoints",
      fallback.effortPoints,
    ),
    healthPoints: getFormNumber(
      formData,
      "healthPoints",
      fallback.healthPoints,
    ),
    sanity: getFormNumber(formData, "sanity", fallback.sanity),
  };
}

export function buildSkillPreview(
  formData: FormData,
  skills: OrdemAgentSkill[],
): OrdemAgentSkill[] {
  const updatesByKey = new Map(
    buildSkillPayload(formData, skills).map((skill) => [skill.key, skill]),
  );

  return skills.map((skill) => {
    const update = updatesByKey.get(skill.key);

    return {
      ...skill,
      otherBonus: update?.otherBonus ?? skill.otherBonus,
      trainingBonus: update?.trainingBonus ?? skill.trainingBonus,
    };
  });
}

export function hasOrdemAgentPayloadChanges(
  payload: UpdateOrdemAgentPayload,
  character: CampaignCharacter,
) {
  if (payload.icon) {
    return true;
  }

  return (
    payload.agentClass !== character.agentClass ||
    payload.agility !== character.attributes?.agility ||
    payload.appearance !== (character.appearance ?? "") ||
    payload.concept !== (character.concept ?? "") ||
    payload.effortPoints !== character.pools?.effortPoints ||
    payload.healthPoints !== character.pools?.healthPoints ||
    payload.history !== (character.history ?? "") ||
    payload.intellect !== character.attributes?.intellect ||
    payload.maxEffortPoints !==
      getDerivedOrPoolValue(character, "maxEffortPoints") ||
    payload.maxHealthPoints !==
      getDerivedOrPoolValue(character, "maxHealthPoints") ||
    payload.maxSanity !== getDerivedOrPoolValue(character, "maxSanity") ||
    hasManualPowersChanges(payload, character) ||
    payload.name !== character.name ||
    payload.nex !== character.nex ||
    payload.notes !== (character.notes ?? "") ||
    payload.objective !== (character.objective ?? "") ||
    payload.origin !== (character.origin ?? "") ||
    payload.path !== (character.path ?? "") ||
    payload.personality !== (character.personality ?? "") ||
    payload.presence !== character.attributes?.presence ||
    payload.sanity !== character.pools?.sanity ||
    payload.strength !== character.attributes?.strength ||
    payload.vigor !== character.attributes?.vigor
  );
}

function getManualPowers(formData: FormData) {
  const value = formData.get("manualPowers");

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = JSON.parse(value) as OrdemAgentManualPower[];

  return parsedValue.map((power) => ({
    category: power.category,
    damageRoll: power.damageRoll,
    description: power.description,
    hasDamageRoll: power.hasDamageRoll,
    hasTestRoll: power.hasTestRoll,
    id: power.id,
    isRollable: power.isRollable,
    name: power.name,
    testRoll: power.testRoll,
  }));
}

function hasManualPowersChanges(
  payload: UpdateOrdemAgentPayload,
  character: CampaignCharacter,
) {
  if (payload.manualPowers === undefined) {
    return false;
  }

  return (
    JSON.stringify(payload.manualPowers) !==
    JSON.stringify(character.manualPowers ?? [])
  );
}

export function hasSkillPayloadChanges(
  payload: UpdateOrdemAgentSkillPayload[],
  skills: OrdemAgentSkill[],
) {
  const currentSkillsByKey = new Map(skills.map((skill) => [skill.key, skill]));

  return payload.some((skill) => {
    const currentSkill = currentSkillsByKey.get(skill.key);

    return (
      skill.otherBonus !== currentSkill?.otherBonus ||
      skill.trainingBonus !== currentSkill?.trainingBonus
    );
  });
}

export function getFormFile(
  formData: FormData,
  key: keyof UpdateOrdemAgentPayload,
) {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

export function getFormNumber(
  formData: FormData,
  key: keyof UpdateOrdemAgentPayload,
  fallback: number,
) {
  return getNumericFormValue(formData, key, fallback);
}

function getTrimmedFormString(
  formData: FormData,
  key: keyof UpdateOrdemAgentPayload,
) {
  return String(formData.get(key) ?? "").trim();
}

export function getImageUrl(iconUrl?: string) {
  if (!iconUrl) {
    return null;
  }

  if (iconUrl.startsWith("http")) {
    return iconUrl;
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

  return `${apiBaseUrl}${iconUrl}`;
}

export function getSkillInputName(
  skillKey: OrdemAgentSkillKey,
  field: "otherBonus" | "trainingBonus",
) {
  return `skill.${skillKey}.${field}`;
}

function getNumericFormValue(
  formData: FormData,
  key: string,
  fallback: number,
) {
  const value = Number(formData.get(key));

  return Number.isFinite(value) ? value : fallback;
}

function getDerivedOrPoolValue(
  character: CampaignCharacter,
  key: "maxEffortPoints" | "maxHealthPoints" | "maxSanity",
) {
  return character.derivedStats?.[key] ?? character.pools?.[key];
}

function normalizeTrainingBonus(value: number) {
  if (value >= 15) {
    return 15;
  }

  if (value >= 10) {
    return 10;
  }

  if (value >= 5) {
    return 5;
  }

  return 0;
}
