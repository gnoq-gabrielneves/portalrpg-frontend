import {
  BackpackIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
  UserRoundIcon,
} from "lucide-react";
import {
  OrdemAgentClass,
  OrdemAgentDerivedStats,
  OrdemAgentSkill,
  OrdemAgentSkillAttribute,
  OrdemAgentSkillKey,
} from "../types/campaign";
import {
  AttributeFieldName,
  ResourceMaxFieldName,
  ResourceFieldName,
  SheetTab,
} from "../types/ordemAgentSheet";

export const CHARACTER_ICON_MAX_SIZE = 20 * 1024 * 1024;
export const ATTRIBUTE_WHEEL_IMAGE = "/assets/ordem/attributes.png";

export const ordemAgentClassOptions: Array<{
  label: string;
  value: OrdemAgentClass;
}> = [
  { label: "Combatente", value: "combatente" },
  { label: "Especialista", value: "especialista" },
  { label: "Ocultista", value: "ocultista" },
];

export const attributeFields: Array<{
  abbreviation: string;
  label: string;
  name: AttributeFieldName;
  x: number;
  y: number;
}> = [
  { abbreviation: "AGI", label: "Agilidade", name: "agility", x: 50, y: 17 },
  { abbreviation: "FOR", label: "Força", name: "strength", x: 19, y: 39 },
  { abbreviation: "INT", label: "Intelecto", name: "intellect", x: 81, y: 39 },
  { abbreviation: "PRE", label: "Presença", name: "presence", x: 29, y: 75 },
  { abbreviation: "VIG", label: "Vigor", name: "vigor", x: 70, y: 75 },
];

export const resourceFields: Array<{
  barClassName: string;
  derivedMaxName: keyof Pick<
    OrdemAgentDerivedStats,
    "maxEffortPoints" | "maxHealthPoints" | "maxSanity"
  >;
  label: string;
  maxName: ResourceMaxFieldName;
  name: ResourceFieldName;
}> = [
  {
    barClassName: "bg-red-700",
    derivedMaxName: "maxHealthPoints",
    label: "Vida",
    maxName: "maxHealthPoints",
    name: "healthPoints",
  },
  {
    barClassName: "bg-violet-600",
    derivedMaxName: "maxSanity",
    label: "Sanidade",
    maxName: "maxSanity",
    name: "sanity",
  },
  {
    barClassName: "bg-orange-500",
    derivedMaxName: "maxEffortPoints",
    label: "Esforço",
    maxName: "maxEffortPoints",
    name: "effortPoints",
  },
];

export const defaultOrdemAgentSkills: OrdemAgentSkill[] = [
  createSkill("acrobatics", "Acrobacia+", "AGI"),
  createSkill("animal_handling", "Adestramento*", "PRE"),
  createSkill("arts", "Artes*", "PRE"),
  createSkill("athletics", "Atletismo", "FOR"),
  createSkill("current_affairs", "Atualidades", "INT"),
  createSkill("sciences", "Ciências*", "INT"),
  createSkill("crime", "Crime*+", "AGI"),
  createSkill("diplomacy", "Diplomacia", "PRE"),
  createSkill("deception", "Enganação", "PRE"),
  createSkill("fortitude", "Fortitude", "VIG"),
  createSkill("stealth", "Furtividade+", "AGI"),
  createSkill("initiative", "Iniciativa", "AGI"),
  createSkill("intimidation", "Intimidação", "PRE"),
  createSkill("intuition", "Intuição", "PRE"),
  createSkill("investigation", "Investigação", "INT"),
  createSkill("weaponry", "Luta", "FOR"),
  createSkill("medicine", "Medicina", "INT"),
  createSkill("occultism", "Ocultismo*", "INT"),
  createSkill("perception", "Percepção", "PRE"),
  createSkill("pilotage", "Pilotagem*", "AGI"),
  createSkill("aim", "Pontaria", "AGI"),
  createSkill("profession", "Profissão*", "INT"),
  createSkill("reflexes", "Reflexos", "AGI"),
  createSkill("religion", "Religião*", "PRE"),
  createSkill("survival", "Sobrevivência", "INT"),
  createSkill("tactics", "Tática*", "INT"),
  createSkill("technology", "Tecnologia*", "INT"),
  createSkill("will", "Vontade", "PRE"),
];

export const sheetTabs: Array<{
  icon: typeof SwordsIcon;
  label: string;
  value: SheetTab;
}> = [
  { icon: SwordsIcon, label: "Combate", value: "combat" },
  { icon: ShieldIcon, label: "Habilidades", value: "powers" },
  { icon: SparklesIcon, label: "Rituais", value: "rituals" },
  { icon: BackpackIcon, label: "Inventário", value: "inventory" },
  { icon: UserRoundIcon, label: "Descrição", value: "description" },
];

export const emptyTabActions: Record<SheetTab, string> = {
  combat: "Novo ataque",
  description: "Editar descrição",
  inventory: "Novo item",
  powers: "Nova habilidade",
  rituals: "Novo ritual",
};

export const emptyTabMessages: Record<SheetTab, string> = {
  combat: "Você ainda não possui ataques",
  description: "Descrição do agente",
  inventory: "Você ainda não possui itens",
  powers: "Você ainda não possui habilidades",
  rituals: "Você ainda não possui rituais",
};

function createSkill(
  key: OrdemAgentSkillKey,
  label: string,
  attribute: OrdemAgentSkillAttribute,
): OrdemAgentSkill {
  return {
    attribute,
    key,
    label,
    otherBonus: 0,
    trainingBonus: 0,
  };
}
