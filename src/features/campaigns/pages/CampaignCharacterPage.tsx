"use client";

import { Button, Form } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcwIcon } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useToast } from "@/shared/hooks/useToast";
import { CampaignCharacterHeader } from "../components/CampaignCharacterHeader";
import { DeleteCharacterModal } from "../components/DeleteCharacterModal";
import { OrdemAgentAttributeWheel } from "../components/OrdemAgentAttributeWheel";
import { OrdemAgentDefensePanel } from "../components/OrdemAgentDefensePanel";
import { OrdemAgentIdentityPanel } from "../components/OrdemAgentIdentityPanel";
import { OrdemAgentResourceBar } from "../components/OrdemAgentResourceBar";
import {
  OrdemAgentSheetTabs,
  PowerRollCompletePayload,
} from "../components/OrdemAgentSheetTabs";
import {
  OrdemAgentSkillsPanel,
  SkillRollCompletePayload,
} from "../components/OrdemAgentSkillsPanel";
import {
  defaultOrdemAgentSkills,
  resourceFields,
} from "../constants/ordemAgentSheet";
import { useCampaignCharacter } from "../hooks/useCampaignCharacter";
import { useCampaign } from "../hooks/useCampaign";
import { useDeleteCampaignCharacter } from "../hooks/useDeleteCampaignCharacter";
import { useOrdemClassTracks } from "../hooks/useOrdemClassTracks";
import { useOrdemOriginPowers } from "../hooks/useOrdemOriginPowers";
import { useOrdemOrigins } from "../hooks/useOrdemOrigins";
import { useUpdateOrdemAgent } from "../hooks/useUpdateOrdemAgent";
import { useUpdateOrdemAgentSkills } from "../hooks/useUpdateOrdemAgentSkills";
import {
  buildOrdemAgentPayload,
  buildResourcePreview,
  buildSkillPreview,
  buildSkillPayload,
  getFormNumber,
  getImageUrl,
  hasOrdemAgentPayloadChanges,
  hasSkillPayloadChanges,
  OrdemAgentResourcePreview,
} from "../services/ordemAgentSheetForm";
import { calculateOrdemAgentDerivedStats } from "../services/ordemAgentRules";
import { createCampaignChatMessage } from "../services/campaignsService";
import {
  CampaignChatMessage,
  OrdemAgentClass,
  OrdemAgentDerivedStats,
  OrdemAgentManualPower,
  OrdemAgentSkill,
} from "../types/campaign";
import { ResourceFieldName, SheetTab } from "../types/ordemAgentSheet";
import { OrdemClassTrack, OrdemOrigin } from "../types/ordemRules";

type CampaignCharacterPageProps = {
  campaignId: string;
  entityId: string;
};

export function CampaignCharacterPage({
  campaignId,
  entityId,
}: CampaignCharacterPageProps) {
  const { accessToken, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const campaign = useCampaign(campaignId);
  const character = useCampaignCharacter(campaignId, entityId);
  const deleteCampaignCharacter = useDeleteCampaignCharacter();
  const updateOrdemAgent = useUpdateOrdemAgent();
  const updateOrdemAgentSkills = useUpdateOrdemAgentSkills();
  const [activeTab, setActiveTab] = useState<SheetTab>("combat");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedAgentClass, setSelectedAgentClass] = useState<
    OrdemAgentClass | ""
  >("");
  const [selectedOriginKey, setSelectedOriginKey] = useState("");
  const [selectedPathKey, setSelectedPathKey] = useState("");
  const [previewNex, setPreviewNex] = useState<number | null>(null);
  const [manualPowersDraft, setManualPowersDraft] = useState<
    OrdemAgentManualPower[] | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewDerivedStats, setPreviewDerivedStats] =
    useState<OrdemAgentDerivedStats | null>(null);
  const [previewResources, setPreviewResources] =
    useState<OrdemAgentResourcePreview | null>(null);
  const [selectedIconError, setSelectedIconError] = useState("");
  const [selectedIconName, setSelectedIconName] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  const agentClass =
    selectedAgentClass || character.data?.agentClass || "combatente";
  const nexValue = previewNex ?? character.data?.nex ?? 5;
  const origins = useOrdemOrigins();
  const originPowers = useOrdemOriginPowers();
  const classTracks = useOrdemClassTracks(agentClass, nexValue);
  const resourceAutosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const createChatRoll = useMutation({
    mutationFn: ({
      expression,
      title,
      total,
    }: {
      expression: string;
      title: string;
      total: number;
    }) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return createCampaignChatMessage(accessToken, campaignId, {
        characterEntityId: entityId,
        characterName: character.data?.name,
        rollFormula: expression,
        rollResult: total,
        text: formatRollTitle(title),
        type: "roll",
      });
    },
    onSuccess: (createdMessage) => {
      queryClient.setQueryData<CampaignChatMessage[]>(
        ["campaign", campaignId, "chat-messages"],
        (currentMessages) => {
          if (
            currentMessages?.some(
              (chatMessage) => chatMessage.id === createdMessage.id,
            )
          ) {
            return currentMessages;
          }

          return [...(currentMessages ?? []), createdMessage];
        },
      );
    },
  });

  useEffect(() => {
    if (!character.data || !previewResources) {
      return;
    }

    const currentPools = character.data.pools;
    const hasResourceChanges =
      previewResources.effortPoints !== currentPools?.effortPoints ||
      previewResources.healthPoints !== currentPools?.healthPoints ||
      previewResources.sanity !== currentPools?.sanity;

    if (!hasResourceChanges) {
      return;
    }

    if (resourceAutosaveTimeout.current) {
      clearTimeout(resourceAutosaveTimeout.current);
    }

    resourceAutosaveTimeout.current = setTimeout(() => {
      updateOrdemAgent.mutate({
        campaignId,
        entityId,
        payload: {
          effortPoints: previewResources.effortPoints,
          healthPoints: previewResources.healthPoints,
          sanity: previewResources.sanity,
        },
        showSuccessToast: false,
      });
    }, 600);

    return () => {
      if (resourceAutosaveTimeout.current) {
        clearTimeout(resourceAutosaveTimeout.current);
      }
    };
  }, [
    campaignId,
    character.data,
    entityId,
    previewResources,
    updateOrdemAgent,
  ]);

  if (character.isLoading) {
    return (
      <div className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 text-sm font-semibold text-rpg-muted shadow-sm">
        Carregando ficha...
      </div>
    );
  }

  if (!character.data) {
    return (
      <div className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 text-sm font-semibold text-rpg-muted shadow-sm">
        Ficha nao encontrada.
      </div>
    );
  }

  const characterData = character.data;
  const isGameMaster = campaign.data?.ownerId === user?.id;
  const avatarUrl = getImageUrl(characterData.avatarUrl);
  const isSaving = updateOrdemAgent.isPending || updateOrdemAgentSkills.isPending;
  const originKey = selectedOriginKey
    || resolveRuleKey(characterData.origin ?? "", origins.data ?? []);
  const pathKey = selectedPathKey
    || resolveRuleKey(characterData.path ?? "", classTracks.data ?? []);
  const manualPowers = manualPowersDraft ?? characterData.manualPowers ?? [];
  const automaticPowers = (originPowers.data ?? []).filter(
    (power) => power.originKey === originKey,
  );
  const skills = applyOriginTraining(
    characterData.skills ?? defaultOrdemAgentSkills,
    originKey,
    origins.data ?? [],
  );
  const attributes = characterData.attributes ?? {
    agility: 1,
    intellect: 1,
    presence: 1,
    strength: 1,
    vigor: 1,
  };
  const resourceValues = previewResources ?? {
    effortPoints: characterData.pools?.effortPoints ?? 0,
    healthPoints: characterData.pools?.healthPoints ?? 0,
    sanity: characterData.pools?.sanity ?? 0,
  };
  const derivedStats =
    previewDerivedStats ??
    calculateOrdemAgentDerivedStats({
      agentClass,
      attributes,
      movement: characterData.movement,
      nex: characterData.nex ?? 5,
      origin: originKey,
      skills,
    });

  function handleFormInput(event: FormEvent<HTMLElement>) {
    const form = event.currentTarget.querySelector("form");

    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const target = event.target;
    const shouldUpdateOnlyResources =
      target instanceof HTMLInputElement && isResourceFieldName(target.name);

    if (shouldUpdateOnlyResources) {
      setPreviewResources(buildResourcePreview(formData, resourceValues));
      return;
    }

    const nextNex = getFormNumber(formData, "nex", characterData.nex ?? 5);
    setIsDirty(true);
    setPreviewNex(nextNex);
    setPreviewResources(buildResourcePreview(formData, resourceValues));

    setPreviewDerivedStats(
      calculateOrdemAgentDerivedStats({
        agentClass,
        attributes: {
          agility: getFormNumber(formData, "agility", attributes.agility),
          intellect: getFormNumber(formData, "intellect", attributes.intellect),
          presence: getFormNumber(formData, "presence", attributes.presence),
          strength: getFormNumber(formData, "strength", attributes.strength),
          vigor: getFormNumber(formData, "vigor", attributes.vigor),
        },
        movement: characterData.movement,
        nex: nextNex,
        origin: originKey,
        skills: buildSkillPreview(formData, skills),
      }),
    );
  }

  function handleClassChange(value: OrdemAgentClass | "") {
    setSelectedAgentClass(value);
    setSelectedPathKey("");
    setIsDirty(true);
    setPreviewDerivedStats(null);
  }

  function handleOriginChange(value: string) {
    setSelectedOriginKey(value);
    setIsDirty(true);
  }

  function handlePathChange(value: string) {
    setSelectedPathKey(value);
    setIsDirty(true);
  }

  function handleManualPowersChange(powers: OrdemAgentManualPower[]) {
    setManualPowersDraft(powers);
    setIsDirty(true);
  }

  function handleRollComplete(
    roll: PowerRollCompletePayload | SkillRollCompletePayload,
  ) {
    if (isGameMaster || !accessToken) {
      return;
    }

    createChatRoll.mutate({
      expression: roll.expression,
      title: "kind" in roll ? `${roll.kind}: ${roll.title}` : roll.title,
      total: roll.total,
    });
  }

  function handleResourceAdjust(name: ResourceFieldName, delta: number) {
    setPreviewResources({
      ...resourceValues,
      [name]: Math.max(0, resourceValues[name] + delta),
    });
  }

  function handleResourceChange(name: ResourceFieldName, value: number) {
    setPreviewResources({
      ...resourceValues,
      [name]: Number.isFinite(value) ? Math.max(0, value) : 0,
    });
  }

  function handleResetResources() {
    setPreviewResources({
      effortPoints: derivedStats.maxEffortPoints,
      healthPoints: derivedStats.maxHealthPoints,
      sanity: derivedStats.maxSanity,
    });
  }

  function resetDraftChanges() {
    formRef.current?.reset();
    setIsDirty(false);
    setManualPowersDraft(null);
    setPreviewDerivedStats(null);
    setPreviewNex(null);
    setPreviewResources(null);
    setSelectedAgentClass("");
    setSelectedIconError("");
    setSelectedIconName("");
    setSelectedOriginKey("");
    setSelectedPathKey("");
  }

  function handleToggleCustomization() {
    if (!isCustomizing) {
      setIsCustomizing(true);
      return;
    }

    if (isDirty) {
      const shouldClose = window.confirm(
        "Existem alteracoes nao salvas. Deseja sair da edicao e descartar as alteracoes?",
      );

      if (!shouldClose) {
        return;
      }

      resetDraftChanges();
    }

    setIsCustomizing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isDirty) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const attributes = {
      agility: getFormNumber(formData, "agility", 1),
      intellect: getFormNumber(formData, "intellect", 1),
      presence: getFormNumber(formData, "presence", 1),
      strength: getFormNumber(formData, "strength", 1),
      vigor: getFormNumber(formData, "vigor", 1),
    };
    const attributesTotal =
      attributes.agility +
      attributes.intellect +
      attributes.presence +
      attributes.strength +
      attributes.vigor;

    if (attributesTotal > 10) {
      showToast({
        description:
          "A ficha inicial pode ter no maximo 10 pontos somando os atributos.",
        title: "Atributos acima do limite",
        type: "error",
      });
      return;
    }

    const payload = buildOrdemAgentPayload(formData, agentClass);
    const skillPayload = buildSkillPayload(formData, skills);
    const shouldUpdateAgent = hasOrdemAgentPayloadChanges(
      payload,
      characterData,
    );
    const shouldUpdateSkills = hasSkillPayloadChanges(skillPayload, skills);

    if (!shouldUpdateAgent && !shouldUpdateSkills) {
      setIsDirty(false);
      setPreviewDerivedStats(null);
      setPreviewResources(null);
      setPreviewNex(null);
      setManualPowersDraft(null);
      return;
    }

    try {
      await Promise.all([
        shouldUpdateAgent
          ? updateOrdemAgent.mutateAsync({ campaignId, entityId, payload })
          : Promise.resolve(),
        shouldUpdateSkills
          ? updateOrdemAgentSkills.mutateAsync({
              campaignId,
              entityId,
              payload: { skills: skillPayload },
            })
          : Promise.resolve(),
      ]);
    } catch {
      return;
    }

    setIsDirty(false);
    setPreviewDerivedStats(null);
    setPreviewResources(null);
    setPreviewNex(null);
    setManualPowersDraft(null);

    if (!shouldUpdateAgent && shouldUpdateSkills) {
      showToast({
        description: "As pericias da ficha foram atualizadas.",
        title: "Ficha salva",
        type: "success",
      });
    }
  }

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 text-rpg-text 2xl:gap-8"
      initial="hidden"
      onInput={handleFormInput}
      transition={{ staggerChildren: 0.08 }}
    >
      <Form className="grid gap-6" ref={formRef} onSubmit={handleSubmit}>
        <input
          name="manualPowers"
          type="hidden"
          value={JSON.stringify(manualPowers)}
        />
        <motion.header
          className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm"
          variants={fadeInUp}
        >
          <CampaignCharacterHeader
            campaignId={campaignId}
            isCustomizing={isCustomizing}
            isSaveDisabled={isSaving || !isDirty || Boolean(selectedIconError)}
            isSaving={isSaving}
            onDelete={() => setIsDeleteModalOpen(true)}
            onToggleCustomization={handleToggleCustomization}
          />
        </motion.header>

        <motion.div variants={fadeInUp}>
          <OrdemAgentIdentityPanel
            agentClass={agentClass}
            avatarUrl={avatarUrl}
            characterName={characterData.name}
            defaultNex={characterData.nex ?? 5}
            defaultOrigin={characterData.origin ?? ""}
            defaultPath={characterData.path ?? ""}
            isCustomizing={isCustomizing}
            isLoadingRules={origins.isLoading || classTracks.isLoading}
            nexValue={nexValue}
            onClassChange={handleClassChange}
            onDirty={() => setIsDirty(true)}
            onOriginChange={handleOriginChange}
            onPathChange={handlePathChange}
            origins={origins.data ?? []}
            paths={classTracks.data ?? []}
            selectedOriginKey={originKey}
            selectedPathKey={pathKey}
            selectedIconError={selectedIconError}
            selectedIconName={selectedIconName}
            setSelectedIconError={setSelectedIconError}
            setSelectedIconName={setSelectedIconName}
          />
        </motion.div>

        <motion.div
          className="grid gap-6 xl:grid-cols-[minmax(20rem,23rem)_minmax(21rem,25rem)_minmax(0,1fr)]"
          variants={fadeInUp}
        >
          <aside className="grid h-fit min-w-0 gap-5 overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface p-5 shadow-sm">
            <OrdemAgentAttributeWheel
              attributes={attributes}
              isCustomizing={isCustomizing}
            />

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase text-rpg-muted">
                  Status
                </p>
                <Button
                  className="flex items-center gap-2 rounded-lg border border-rpg-border bg-white px-3 py-2 text-xs font-black text-rpg-muted shadow-sm transition hover:border-rpg-primary hover:text-rpg-primary"
                  onPress={handleResetResources}
                  type="button"
                  variant="secondary"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  Resetar
                </Button>
              </div>
              {resourceFields.map((field) => (
                <OrdemAgentResourceBar
                  barClassName={field.barClassName}
                  currentValue={resourceValues[field.name]}
                  key={field.name}
                  label={field.label}
                  maxDefaultValue={String(
                    derivedStats[field.derivedMaxName],
                  )}
                  maxValue={derivedStats[field.derivedMaxName]}
                  maxName={field.maxName}
                  name={field.name}
                  onAdjust={handleResourceAdjust}
                  onCurrentChange={handleResourceChange}
                  shouldLockMax
                />
              ))}
            </div>

            <OrdemAgentDefensePanel
              block={derivedStats.block}
              defense={derivedStats.defense}
              dodge={derivedStats.dodge}
            />
          </aside>

          <OrdemAgentSkillsPanel
            attributes={attributes}
            isCustomizing={isCustomizing}
            key={originKey}
            onRollComplete={handleRollComplete}
            skills={skills}
          />

          <OrdemAgentSheetTabs
            activeTab={activeTab}
            appearance={characterData.appearance ?? ""}
            automaticPowers={automaticPowers}
            history={characterData.history ?? ""}
            isCustomizing={isCustomizing}
            manualPowers={manualPowers}
            notes={characterData.notes ?? ""}
            objective={characterData.objective ?? ""}
            onManualPowersChange={handleManualPowersChange}
            onRollComplete={handleRollComplete}
            onTabChange={setActiveTab}
            personality={characterData.personality ?? ""}
          />
        </motion.div>
      </Form>

      <DeleteCharacterModal
        characterName={characterData.name}
        isDeleting={deleteCampaignCharacter.isPending}
        isOpen={isDeleteModalOpen}
        onConfirm={() =>
          deleteCampaignCharacter.mutate({
            campaignId,
            entityId,
          })
        }
        onOpenChange={setIsDeleteModalOpen}
      />
    </motion.section>
  );
}

function resolveRuleKey(
  currentValue: string,
  options: Array<OrdemOrigin | OrdemClassTrack>,
) {
  const normalizedCurrentValue = normalizeRuleValue(currentValue);
  const option = options.find(
    (item) =>
      item.key === currentValue ||
      normalizeRuleValue(item.name) === normalizedCurrentValue,
  );

  return option?.key ?? "";
}

function normalizeRuleValue(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

function formatRollTitle(title: string) {
  return title.replace(/[+*]+$/g, "").trim();
}

function applyOriginTraining(
  skills: OrdemAgentSkill[],
  originKey: string,
  origins: OrdemOrigin[],
) {
  const origin = origins.find((item) => item.key === originKey);

  if (!origin) {
    return skills;
  }

  const trainedSkillKeys = new Set(origin.trainedSkillKeys);

  return skills.map((skill) => ({
    ...skill,
    trainingBonus: trainedSkillKeys.has(skill.key)
      ? Math.max(skill.trainingBonus, 5)
      : skill.trainingBonus,
  }));
}

function isResourceFieldName(value: string): value is ResourceFieldName {
  return resourceFields.some((field) => field.name === value);
}
