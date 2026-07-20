"use client";

import {
  ArrowLeftIcon,
  BookOpenIcon,
  ClipboardListIcon,
  Dice5Icon,
  SwordsIcon,
  UserRoundIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useCampaign } from "../hooks/useCampaign";
import { useCampaignCharacters } from "../hooks/useCampaignCharacters";
import {
  CampaignCharacter,
  OrdemAgentAttributes,
  OrdemAgentClass,
  OrdemAgentPools,
} from "../types/campaign";

type CampaignMasterShieldPageProps = {
  campaignId: string;
};

const masterShieldTabs = [
  "Agentes",
  "Combates",
  "Investigação",
  "Relatórios",
  "Dados",
];

const attributeCards: Array<{
  key: keyof OrdemAgentAttributes;
  label: string;
}> = [
  { key: "agility", label: "AGI" },
  { key: "strength", label: "FOR" },
  { key: "intellect", label: "INT" },
  { key: "presence", label: "PRE" },
  { key: "vigor", label: "VIG" },
];

export function CampaignMasterShieldPage({
  campaignId,
}: CampaignMasterShieldPageProps) {
  const campaign = useCampaign(campaignId);
  const characters = useCampaignCharacters(campaignId);
  const [activeTab, setActiveTab] = useState(masterShieldTabs[0]);
  const agentCharacters = characters.data ?? [];

  return (
    <motion.section
      animate="visible"
      className="min-h-[calc(100vh-5rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-sm"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.header
        className="flex flex-col justify-between gap-4 border-b border-rpg-border px-5 py-4 lg:flex-row lg:items-center"
        variants={fadeInUp}
      >
        <div className="min-w-0">
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-bold text-rpg-muted transition hover:text-rpg-primary"
            href={`/campaigns/${campaignId}`}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para campanha
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/25">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rpg-primary">
                Escudo do mestre
              </p>
              <h1 className="truncate text-2xl font-black tracking-normal">
                {campaign.data?.name ?? "Campanha"}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {masterShieldTabs.map((tab) => (
            <button
              className={`rounded-none border-b-2 px-3 py-2 text-sm font-black uppercase transition ${
                activeTab === tab
                  ? "border-rpg-primary text-rpg-primary"
                  : "border-transparent text-rpg-muted hover:text-rpg-text"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.header>

      <motion.div
        className="grid min-h-[42rem] gap-5 p-5 xl:grid-cols-[20rem_minmax(0,1fr)]"
        variants={fadeInUp}
      >
        <MasterResultPanel />

        <div className="min-w-0">
          {activeTab === "Agentes" ? (
            <AgentsShieldView
              campaignId={campaignId}
              characters={agentCharacters}
              isLoading={characters.isLoading}
            />
          ) : (
            <EmptyShieldTab tab={activeTab} />
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}

function MasterResultPanel() {
  return (
    <aside className="grid min-h-72 content-start gap-4 rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4 shadow-sm">
      <div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rpg-primary">
            Resultados
          </p>
          <h2 className="mt-1 text-lg font-black tracking-normal">
            Rolagens da mesa
          </h2>
        </div>
      </div>

      <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-rpg-border bg-white p-4 text-center">
        <div>
          <Dice5Icon className="mx-auto h-8 w-8 text-rpg-muted/60" />
          <p className="mt-3 text-sm font-semibold leading-6 text-rpg-muted">
            As rolagens importantes da sessão aparecem aqui.
          </p>
        </div>
      </div>
    </aside>
  );
}

function AgentsShieldView({
  campaignId,
  characters,
  isLoading,
}: Readonly<{
  campaignId: string;
  characters: CampaignCharacter[];
  isLoading: boolean;
}>) {
  if (isLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
        Carregando agentes...
      </p>
    );
  }

  if (characters.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
        Nenhum agente criado nesta campanha.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {characters.map((character) => (
        <MasterAgentCard
          campaignId={campaignId}
          character={character}
          key={character.entityId}
        />
      ))}
    </div>
  );
}

function MasterAgentCard({
  campaignId,
  character,
}: Readonly<{
  campaignId: string;
  character: CampaignCharacter;
}>) {
  const avatarUrl = getImageUrl(character.avatarUrl);
  const attributes = character.attributes ?? getFallbackAttributes();
  const pools = character.pools ?? getFallbackPools();
  const derivedStats = character.derivedStats;

  return (
    <article className="overflow-hidden rounded-2xl border border-rpg-border bg-white shadow-sm">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-b border-rpg-border p-4">
        <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-rpg-surface-muted">
          {avatarUrl ? (
            <span
              aria-hidden="true"
              className="h-full w-full bg-cover bg-[center_22%]"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            />
          ) : (
            <UserRoundIcon className="h-8 w-8 text-rpg-muted" />
          )}
        </div>
        <div className="min-w-0 self-center">
          <h3 className="truncate text-xl font-black tracking-normal">
            {character.name}
          </h3>
          <p className="mt-1 truncate text-sm font-bold text-rpg-muted">
            {getClassLabel(character.agentClass)} •{" "}
            {formatOriginLabel(character.origin)}
          </p>
          <p className="mt-1 text-sm font-black text-rpg-primary">
            NEX {character.nex ?? 5}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div className="grid grid-cols-5 gap-2">
          {attributeCards.map((attribute) => (
            <div
              className="rounded-xl border border-rpg-border bg-rpg-surface-muted p-2 text-center"
              key={attribute.key}
            >
              <p className="text-xs font-black text-rpg-muted">
                {attribute.label}
              </p>
              <p className="mt-1 text-lg font-black">
                {attributes[attribute.key]}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <ResourceBar
            colorClassName="bg-red-600"
            current={pools.healthPoints}
            label="Vida"
            max={pools.maxHealthPoints}
          />
          <ResourceBar
            colorClassName="bg-violet-600"
            current={pools.sanity}
            label="Sanidade"
            max={pools.maxSanity}
          />
          <ResourceBar
            colorClassName="bg-orange-500"
            current={pools.effortPoints}
            label="Esforço"
            max={pools.maxEffortPoints}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Defesa" value={derivedStats?.defense ?? 10} />
          <StatTile label="Bloqueio" value={derivedStats?.block ?? 0} />
          <StatTile label="Esquiva" value={derivedStats?.dodge ?? 10} />
        </div>

        <Link
          className="ml-auto inline-flex w-fit items-center gap-2 rounded-xl bg-rpg-primary px-4 py-2 text-sm font-black text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
          href={`/campaigns/${campaignId}/characters/${character.entityId}`}
        >
          Ficha
        </Link>
      </div>
    </article>
  );
}

function ResourceBar({
  colorClassName,
  current,
  label,
  max,
}: Readonly<{
  colorClassName: string;
  current: number;
  label: string;
  max: number;
}>) {
  const normalizedMax = Math.max(1, max);
  const percentage = Math.min(100, Math.max(0, (current / normalizedMax) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-black uppercase text-rpg-muted">
        <span>{label}</span>
        <span className="text-rpg-text">
          {current}/{max}
        </span>
      </div>
      <div className="h-5 overflow-hidden rounded-lg bg-rpg-border/60">
        <div
          className={`grid h-full place-items-center text-xs font-black text-white ${colorClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
}: Readonly<{
  label: string;
  value: number;
}>) {
  return (
    <div className="rounded-xl border border-rpg-border bg-rpg-surface-muted p-3 text-center">
      <p className="text-xs font-black uppercase text-rpg-muted">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function EmptyShieldTab({ tab }: Readonly<{ tab: string }>) {
  const Icon = tab === "Combates" ? SwordsIcon : ClipboardListIcon;

  return (
    <div className="grid min-h-96 place-items-center rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-8 text-center">
      <div>
        <Icon className="mx-auto h-10 w-10 text-rpg-muted/60" />
        <h2 className="mt-4 text-xl font-black tracking-normal">{tab}</h2>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-rpg-muted">
          Esta área já está reservada no escudo do mestre.
        </p>
      </div>
    </div>
  );
}

function getClassLabel(agentClass?: OrdemAgentClass) {
  if (agentClass === "especialista") {
    return "Especialista";
  }

  if (agentClass === "ocultista") {
    return "Ocultista";
  }

  return "Combatente";
}

function formatOriginLabel(origin?: string) {
  if (!origin) {
    return "Sem Origem";
  }

  return origin
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toLocaleUpperCase("pt-BR")}${part.slice(1)}`)
    .join(" ");
}

function getImageUrl(iconUrl?: string) {
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

function getFallbackAttributes(): OrdemAgentAttributes {
  return {
    agility: 1,
    intellect: 1,
    presence: 1,
    strength: 1,
    vigor: 1,
  };
}

function getFallbackPools(): OrdemAgentPools {
  return {
    defense: 10,
    effortPoints: 0,
    healthPoints: 0,
    maxEffortPoints: 0,
    maxHealthPoints: 0,
    maxSanity: 0,
    sanity: 0,
  };
}
