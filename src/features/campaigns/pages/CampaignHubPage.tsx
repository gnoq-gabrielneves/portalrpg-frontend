"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  FlagIcon,
  ImageIcon,
  MailPlusIcon,
  MapIcon,
  MusicIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RepeatIcon,
  SaveIcon,
  SettingsIcon,
  ShieldIcon,
  SquareIcon,
  Trash2Icon,
  UserRoundIcon,
  UsersIcon,
  Volume2Icon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { campaignHubTabs } from "../constants/campaigns";
import { useCampaign } from "../hooks/useCampaign";
import { useCampaignCharacters } from "../hooks/useCampaignCharacters";
import { useCampaignInviteFriends } from "../hooks/useCampaignInviteFriends";
import { useCampaignInviteMutations } from "../hooks/useCampaignInviteMutations";
import { useCampaignMembers } from "../hooks/useCampaignMembers";
import { useCreateOrdemAgent } from "../hooks/useCreateOrdemAgent";
import { useDeleteCampaign } from "../hooks/useDeleteCampaign";
import { useUpdateCampaign } from "../hooks/useUpdateCampaign";
import {
  createCampaignMap,
  createCampaignSound,
  deleteCampaignMap,
  deleteCampaignSound,
  updateCampaignMap,
  updateCampaignSound,
} from "../services/campaignsService";
import {
  Campaign,
  CampaignCharacter,
  CampaignInviteFriend,
  CampaignMap,
  CampaignMember,
  CampaignMemberRole,
  CampaignSound,
  CampaignSoundType,
  CreateOrdemAgentPayload,
  OrdemAgentClass,
} from "../types/campaign";

type CampaignHubPageProps = {
  campaignId: string;
};

const CHARACTER_ICON_MAX_SIZE = 20 * 1024 * 1024;

const ordemAttributeFields: Array<{
  label: string;
  name: keyof CreateOrdemAgentPayload;
}> = [
  { label: "Agilidade", name: "agility" },
  { label: "Força", name: "strength" },
  { label: "Intelecto", name: "intellect" },
  { label: "Presença", name: "presence" },
  { label: "Vigor", name: "vigor" },
];

const ordemPoolFields: Array<{
  defaultValue: string;
  label: string;
  max: number;
  name: keyof CreateOrdemAgentPayload;
}> = [
  { defaultValue: "0", label: "PV", max: 999, name: "healthPoints" },
  { defaultValue: "0", label: "PE", max: 999, name: "effortPoints" },
  { defaultValue: "0", label: "SAN", max: 999, name: "sanity" },
];

const ordemAgentClassOptions: Array<{
  description: string;
  label: string;
  value: OrdemAgentClass;
}> = [
  {
    description: "Linha de frente.",
    label: "Combatente",
    value: "combatente",
  },
  {
    description: "Perícias e recursos.",
    label: "Especialista",
    value: "especialista",
  },
  {
    description: "Rituais e ocultismo.",
    label: "Ocultista",
    value: "ocultista",
  },
];

export function CampaignHubPage({ campaignId }: CampaignHubPageProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const characters = useCampaignCharacters(campaignId);
  const createOrdemAgent = useCreateOrdemAgent();
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const deleteCampaign = useDeleteCampaign();
  const inviteFriends = useCampaignInviteFriends(campaignId);
  const inviteMutations = useCampaignInviteMutations();
  const members = useCampaignMembers(campaignId);
  const updateCampaign = useUpdateCampaign();
  const [activeTab, setActiveTab] = useState(campaignHubTabs[0]);
  const [agentClass, setAgentClass] = useState<OrdemAgentClass>("combatente");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isCharacterTypeModalOpen, setIsCharacterTypeModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCharacterIconError, setSelectedCharacterIconError] =
    useState("");
  const [selectedCharacterIconName, setSelectedCharacterIconName] =
    useState("");
  const [selectedIconName, setSelectedIconName] = useState("");
  const resolvedCharacterOwnerId =
    members.data?.find((member) => member.user.id === user?.id)?.user.id ||
    members.data?.[0]?.user.id ||
    "";

  if (isLoading) {
    return (
      <div className="rounded-lg border border-rpg-border bg-rpg-surface p-6 text-sm text-rpg-muted">
        Carregando campanha...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-lg border border-rpg-border bg-rpg-surface p-6 text-sm text-rpg-muted">
        Campanha nao encontrada.
      </div>
    );
  }

  const iconUrl = getCampaignIconUrl(campaign.iconUrl);
  const formattedUpdatedAt = campaign.updatedAt
    ? new Date(campaign.updatedAt).toLocaleDateString("pt-BR")
    : "Campanha recente";

  function handleUpdateCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!campaign) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const icon = formData.get("icon");

    updateCampaign.mutate(
      {
        campaignId: campaign._id,
        payload: {
          description: String(formData.get("description") ?? "").trim(),
          icon: icon instanceof File && icon.size > 0 ? icon : null,
          name: String(formData.get("name") ?? "").trim(),
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedIconName("");
        },
      },
    );
  }

  function handleCreateOrdemAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!campaign) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const icon = formData.get("icon");
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
          "Comece com 1 em cada atributo e distribua ate 4 pontos extras.",
        title: "Atributos acima do limite",
        type: "error",
      });
      return;
    }

    const effortPoints = getFormNumber(formData, "effortPoints", 0);
    const healthPoints = getFormNumber(formData, "healthPoints", 0);
    const sanity = getFormNumber(formData, "sanity", 0);

    createOrdemAgent.mutate(
      {
        campaignId: campaign._id,
        payload: {
          agentClass,
          agility: attributes.agility,
          concept: String(formData.get("concept") ?? "").trim(),
          effortPoints,
          healthPoints,
          icon: icon instanceof File && icon.size > 0 ? icon : null,
          intellect: attributes.intellect,
          maxEffortPoints: effortPoints,
          maxHealthPoints: healthPoints,
          maxSanity: sanity,
          name: String(formData.get("name") ?? "").trim(),
          nex: Number(formData.get("nex") ?? 5),
          notes: String(formData.get("notes") ?? "").trim(),
          origin: String(formData.get("origin") ?? "").trim(),
          ownerId: resolvedCharacterOwnerId,
          path: String(formData.get("path") ?? "").trim(),
          presence: attributes.presence,
          sanity,
          strength: attributes.strength,
          vigor: attributes.vigor,
        },
      },
      {
        onSuccess: () => {
          setIsCharacterModalOpen(false);
          setSelectedCharacterIconError("");
          setSelectedCharacterIconName("");
          setActiveTab("Personagens");
        },
      },
    );
  }

  function closeCharacterModal() {
    setIsCharacterModalOpen(false);
    setSelectedCharacterIconError("");
    setSelectedCharacterIconName("");
  }

  function openOrdemAgentModal() {
    setIsCharacterTypeModalOpen(false);
    setIsCharacterModalOpen(true);
  }

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.div
        className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
        variants={fadeInUp}
      >
        <header className="relative flex min-h-80 flex-col rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8">
          <div>
            <Link
              className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-rpg-muted transition hover:text-rpg-primary"
              href="/campaigns"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Voltar para campanhas
            </Link>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
                {iconUrl ? (
                  <div
                    aria-hidden="true"
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${iconUrl})` }}
                  />
                ) : (
                  <FlagIcon className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
                  {campaign.system || "Sistema a definir"}
                </p>
                <h1 className="truncate text-3xl font-black tracking-normal text-rpg-text">
                  {campaign.name}
                </h1>
              </div>
            </div>

            <div className="mt-4 flex w-fit items-center gap-2 rounded-2xl border border-rpg-border bg-rpg-surface-muted px-3 py-2 text-sm font-bold text-rpg-muted">
              <CalendarDaysIcon className="h-4 w-4 text-rpg-primary" />
              Atualizada em {formattedUpdatedAt}
            </div>

            <p className="mt-4 max-w-4xl text-justify text-sm leading-6 text-rpg-muted">
              {campaign.description || "Sem descricao por enquanto."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 sm:absolute sm:right-6 sm:top-6 sm:mt-0 2xl:right-8 2xl:top-8">
            <Button
              className="flex items-center justify-center gap-2 rounded-2xl bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
              onPress={() => setIsEditModalOpen(true)}
            >
              <PencilIcon className="h-5 w-5" />
              Editar campanha
            </Button>

            <Button
              className="flex items-center justify-center gap-2 rounded-2xl bg-rpg-danger px-4 py-3 font-bold text-white shadow-lg shadow-rpg-danger/20 transition hover:brightness-95"
              onPress={() => setIsDeleteModalOpen(true)}
            >
              <Trash2Icon className="h-5 w-5" />
              Excluir
            </Button>
          </div>
        </header>

        <aside className="flex min-h-80 items-stretch">
          <div className="aspect-square w-full overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface-muted shadow-sm">
            {iconUrl ? (
              <div
                aria-hidden="true"
                className="h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${iconUrl})` }}
              />
            ) : (
              <div className="grid h-full place-items-center text-rpg-muted">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>
        </aside>
      </motion.div>

      <motion.section
        className="overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface shadow-sm"
        variants={fadeInUp}
      >
        {/* Hero compacto da campanha: sera o ponto de entrada para mesa, notas e elenco. */}
        <div className="bg-rpg-night px-6 py-4 text-white">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-center">
            <div>
              <p className="text-sm font-bold text-rpg-success">
                Hub da campanha
              </p>
              <p className="mt-2 max-w-2xl text-justify text-sm leading-6 text-white/72">
                Organize jogadores, personagens, sessoes, mapas e notas em um so
                lugar.
              </p>
            </div>

            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-rpg-primary px-3.5 py-2 text-sm font-black text-white shadow-sm shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover hover:shadow-md hover:shadow-rpg-primary/20"
                href={`/campaigns/${campaign._id}/table`}
              >
                <MapIcon className="h-4 w-4" />
                Mesa virtual
              </Link>
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.07] px-3.5 py-2 text-sm font-black text-white/90 transition hover:border-white/25 hover:bg-white/12 hover:text-white"
                href={`/campaigns/${campaign._id}/master-shield`}
              >
                <ShieldIcon className="h-4 w-4" />
                Escudo do mestre
              </Link>
            </div>
          </div>
        </div>

        <div className="border-b border-rpg-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {campaignHubTabs.map((tab) => (
              <button
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  tab === activeTab
                    ? "bg-rpg-primary text-white"
                    : "text-rpg-muted hover:bg-rpg-primary-soft hover:text-rpg-primary"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Jogadores" ? (
          <CampaignMembersPanel
            isLoading={members.isLoading}
            members={members.data ?? []}
            onInvite={() => setIsInviteModalOpen(true)}
          />
        ) : activeTab === "Personagens" ? (
          <CampaignCharactersPanel
            campaignId={campaign._id}
            characters={characters.data ?? []}
            isLoading={characters.isLoading}
            onCreate={() => setIsCharacterTypeModalOpen(true)}
          />
        ) : activeTab === "Mapas" ? (
          <CampaignMapsPanel
            campaignId={campaign._id}
            maps={campaign.maps ?? []}
          />
        ) : activeTab === "Sons" ? (
          <CampaignSoundsPanel
            campaignId={campaign._id}
            sounds={campaign.sounds ?? []}
          />
        ) : (
          <CampaignOverviewPanel />
        )}
      </motion.section>

      <Modal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <PencilIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Campanha
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Editar campanha
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de edicao"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsEditModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5"
                onSubmit={handleUpdateCampaign}
              >
                <TextField
                  className="flex flex-col gap-2"
                  defaultValue={campaign.name}
                  isRequired
                  name="name"
                  validate={(value) => {
                    if (value.trim().length < 3) {
                      return "Use um nome com pelo menos 3 caracteres.";
                    }
                    return null;
                  }}
                >
                  <Label className="text-sm font-semibold text-rpg-text">
                    Titulo
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400" />
                  </InputGroup>
                  <FieldError className="text-sm font-medium text-rpg-danger" />
                </TextField>

                <TextField
                  className="flex flex-col gap-2"
                  defaultValue={campaign.description ?? ""}
                  name="description"
                >
                  <Label className="text-sm font-semibold text-rpg-text">
                    Descricao
                  </Label>
                  <InputGroup
                    className="min-h-36 rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.TextArea
                      className="min-h-32 min-w-0 flex-1 resize-none bg-transparent text-sm font-semibold leading-6 text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="Qual e a premissa da campanha?"
                    />
                  </InputGroup>
                </TextField>

                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Icone da campanha
                  </Label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-rpg-border bg-white px-4 py-4 text-sm font-semibold text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary">
                    <span className="flex min-w-0 items-center gap-3">
                      <ImageIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate">
                        {selectedIconName || "Selecionar imagem ate 15MB"}
                      </span>
                    </span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      name="icon"
                      onChange={(event) => {
                        setSelectedIconName(
                          event.target.files?.[0]?.name ?? "",
                        );
                      }}
                      type="file"
                    />
                  </label>
                </div>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={() => setIsEditModalOpen(false)}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={updateCampaign.isPending}
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {updateCampaign.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="md">
            <Modal.Dialog className="relative overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-danger text-white">
                    <AlertTriangleIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Excluir campanha
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Tem certeza?
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de exclusao"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsDeleteModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Modal.Body className="grid gap-3 px-6 py-5">
                <p className="text-justify text-sm leading-6 text-rpg-muted">
                  A campanha{" "}
                  <strong className="text-rpg-text">{campaign.name}</strong>{" "}
                  sera removida da sua lista junto com os vinculos de jogadores.
                </p>
                <p className="text-sm font-semibold text-rpg-danger">
                  Essa acao nao pode ser desfeita.
                </p>
              </Modal.Body>

              <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border px-6 py-5">
                <Button
                  className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                  onPress={() => setIsDeleteModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex items-center justify-center gap-2 rounded-lg bg-rpg-danger px-5 py-2 font-bold text-white shadow-lg shadow-rpg-danger/20 transition hover:brightness-95"
                  isDisabled={deleteCampaign.isPending}
                  onPress={() => deleteCampaign.mutate(campaign._id)}
                >
                  <Trash2Icon className="h-5 w-5" />
                  {deleteCampaign.isPending
                    ? "Excluindo..."
                    : "Excluir campanha"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <MailPlusIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Social
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Convidar jogadores
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de convites"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsInviteModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Modal.Body className="grid max-h-[calc(100vh-13rem)] gap-3 overflow-y-auto px-6 py-5">
                {inviteFriends.isLoading ? (
                  <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
                    Carregando amigos...
                  </p>
                ) : null}
                {!inviteFriends.isLoading &&
                (inviteFriends.data ?? []).length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
                    Adicione amigos antes de convidar jogadores para a campanha.
                  </p>
                ) : null}
                {(inviteFriends.data ?? []).map((inviteFriend) => (
                  <InviteFriendItem
                    campaignId={campaign._id}
                    inviteFriend={inviteFriend}
                    isPending={inviteMutations.createInvite.isPending}
                    key={inviteFriend.friend.id}
                    onInvite={(recipientUserId) =>
                      inviteMutations.createInvite.mutate({
                        campaignId: campaign._id,
                        recipientUserId,
                      })
                    }
                  />
                ))}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={isCharacterTypeModalOpen}
        onOpenChange={setIsCharacterTypeModalOpen}
      >
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="md">
            <Modal.Dialog className="relative overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <PlusIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Personagem
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      O que voce quer criar?
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar seletor de personagem"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsCharacterTypeModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Modal.Body className="grid gap-3 px-6 py-5">
                <EntityTypeChoice
                  description="Ficha de jogador para participar da missao."
                  icon={<UserRoundIcon className="h-5 w-5" />}
                  label="Agente"
                  onSelect={openOrdemAgentModal}
                />
                <EntityTypeChoice
                  description="Personagem narrativo controlado pelo mestre."
                  icon={<UsersIcon className="h-5 w-5" />}
                  isDisabled
                  label="NPC"
                />
                <EntityTypeChoice
                  description="Criatura, inimigo ou outro perigo de cena."
                  icon={<ShieldIcon className="h-5 w-5" />}
                  isDisabled
                  label="Ameaça"
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={isCharacterModalOpen}
        onOpenChange={(isOpen) => {
          setIsCharacterModalOpen(isOpen);

          if (!isOpen) {
            setSelectedCharacterIconError("");
            setSelectedCharacterIconName("");
          }
        }}
      >
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="cover">
            <Modal.Dialog className="relative max-h-[calc(100vh-2rem)] w-[min(94vw,72rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <UserRoundIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Personagem
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Criar agente
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de personagem"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={closeCharacterModal}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-11rem)] gap-6 overflow-y-auto px-6 py-5"
                onSubmit={handleCreateOrdemAgent}
              >
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Icone do agente
                  </Label>
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed border-rpg-border bg-white px-4 py-4 text-sm font-bold text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary">
                    <ImageIcon className="h-5 w-5" />
                    <span className="truncate">
                      {selectedCharacterIconName ||
                        "Selecionar imagem ate 20MB"}
                    </span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      name="icon"
                      onChange={(event) => {
                        const selectedFile = event.currentTarget.files?.[0];

                        if (!selectedFile) {
                          setSelectedCharacterIconError("");
                          setSelectedCharacterIconName("");
                          return;
                        }

                        if (selectedFile.size > CHARACTER_ICON_MAX_SIZE) {
                          event.currentTarget.value = "";
                          setSelectedCharacterIconError(
                            "Use uma imagem com ate 20MB.",
                          );
                          setSelectedCharacterIconName("");
                          return;
                        }

                        setSelectedCharacterIconError("");
                        setSelectedCharacterIconName(selectedFile.name);
                      }}
                      type="file"
                    />
                  </label>
                  {selectedCharacterIconError ? (
                    <p className="text-sm font-medium text-rpg-danger">
                      {selectedCharacterIconError}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
                  <TextField
                    className="flex flex-col gap-2"
                    isRequired
                    name="name"
                    validate={(value) => {
                      if (value.trim().length < 2) {
                        return "Use um nome com pelo menos 2 caracteres.";
                      }
                      return null;
                    }}
                  >
                    <Label className="text-sm font-semibold text-rpg-text">
                      Nome do agente
                    </Label>
                    <InputGroup
                      className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                      fullWidth
                      variant="secondary"
                    >
                      <InputGroup.Input
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                        placeholder="Ex: Dante"
                      />
                    </InputGroup>
                    <FieldError className="text-sm font-medium text-rpg-danger" />
                  </TextField>

                  <Select
                    className="flex flex-col gap-2"
                    fullWidth
                    onSelectionChange={(key) => {
                      if (isOrdemAgentClass(key)) {
                        setAgentClass(key);
                      }
                    }}
                    selectedKey={agentClass}
                    variant="secondary"
                  >
                    <Label className="text-sm font-semibold text-rpg-text">
                      Classe
                    </Label>
                    <Select.Trigger className="flex min-h-10 items-center justify-between rounded-lg border border-rpg-border bg-white px-3 py-2 text-sm font-semibold text-rpg-text shadow-sm transition focus-visible:border-rpg-primary focus-visible:ring-4 focus-visible:ring-rpg-primary-soft">
                      <Select.Value className="truncate" />
                      <Select.Indicator className="h-4 w-4 text-rpg-muted" />
                    </Select.Trigger>
                    <Select.Popover className="rounded-lg border border-rpg-border bg-white p-1 shadow-xl">
                      <ListBox>
                        {ordemAgentClassOptions.map((option) => (
                          <ListBox.Item
                            className="rounded-md px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                            id={option.value}
                            key={option.value}
                            textValue={option.label}
                          >
                            {option.label}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <TextField className="flex flex-col gap-2" name="concept">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Conceito
                  </Label>
                  <InputGroup
                    className="min-h-20 rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.TextArea
                      className="min-h-16 min-w-0 flex-1 resize-none bg-transparent text-sm font-semibold leading-6 text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      maxLength={240}
                      placeholder="Quem era esse agente antes da Ordem e o que ele quer fazer agora?"
                    />
                  </InputGroup>
                </TextField>

                <div className="grid gap-4 md:grid-cols-3">
                  <TextField className="flex flex-col gap-2" name="origin">
                    <Label className="text-sm font-semibold text-rpg-text">
                      Origem
                    </Label>
                    <InputGroup
                      className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                      fullWidth
                      variant="secondary"
                    >
                      <InputGroup.Input
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                        placeholder="Ex: Acadêmico"
                      />
                    </InputGroup>
                  </TextField>

                  <TextField
                    className="flex flex-col gap-2"
                    defaultValue="5"
                    isRequired
                    name="nex"
                    type="number"
                  >
                    <Label className="text-sm font-semibold text-rpg-text">
                      NEX
                    </Label>
                    <InputGroup
                      className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                      fullWidth
                      variant="secondary"
                    >
                      <InputGroup.Input className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400" />
                    </InputGroup>
                  </TextField>

                  <TextField className="flex flex-col gap-2" name="path">
                    <Label className="text-sm font-semibold text-rpg-text">
                      Trilha
                    </Label>
                    <InputGroup
                      className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                      fullWidth
                      variant="secondary"
                    >
                      <InputGroup.Input
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                        placeholder="Opcional"
                      />
                    </InputGroup>
                  </TextField>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-sm font-semibold text-rpg-text">
                      Atributos
                    </Label>
                    <p className="mt-1 text-xs font-semibold text-rpg-muted">
                      Inicio em 1, distribua pontos e mantenha cada atributo no
                      maximo 3.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {ordemAttributeFields.map((field) => (
                      <NumberField
                        defaultValue="1"
                        key={field.name}
                        label={field.label}
                        max={3}
                        min={0}
                        name={field.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label className="text-sm font-semibold text-rpg-text">
                      Recursos
                    </Label>
                    <p className="mt-1 text-xs font-semibold text-rpg-muted">
                      PV, PE, SAN e valores derivados usados durante a sessão.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-5">
                    {ordemPoolFields.map((field) => (
                      <NumberField
                        defaultValue={field.defaultValue}
                        key={field.name}
                        label={field.label}
                        max={field.max}
                        min={0}
                        name={field.name}
                      />
                    ))}
                  </div>
                </div>

                <TextField className="flex flex-col gap-2" name="notes">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Anotações
                  </Label>
                  <InputGroup
                    className="min-h-28 rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.TextArea
                      className="min-h-24 min-w-0 flex-1 resize-none bg-transparent text-sm font-semibold leading-6 text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="Detalhes iniciais do agente."
                    />
                  </InputGroup>
                </TextField>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={closeCharacterModal}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={
                      createOrdemAgent.isPending || !resolvedCharacterOwnerId
                    }
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {createOrdemAgent.isPending ? "Criando..." : "Criar agente"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </motion.section>
  );
}

function CampaignOverviewPanel() {
  return (
    <div className="grid gap-4 p-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-rpg-surface-muted p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
            Proximo passo
          </p>
          <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
            Convide jogadores
          </h2>
          <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
            Traga seus amigos para a mesa e controle quem participa da campanha.
          </p>
        </div>

        <div className="rounded-lg bg-rpg-surface-muted p-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
            Personagens
          </p>
          <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
            Fichas conectadas
          </h2>
          <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
            Aqui entram personagens por campanha antes da mesa virtual ficar
            completa.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-rpg-surface-muted p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
          Sessoes
        </p>
        <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
          Histórico de jogo
        </h2>
        <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
          Sessões, notas e rolagens vão formar uma linha do tempo bem mais clara
          que a do Roll20.
        </p>
      </div>
    </div>
  );
}

function CampaignMembersPanel({
  isLoading,
  members,
  onInvite,
}: Readonly<{
  isLoading: boolean;
  members: CampaignMember[];
  onInvite: () => void;
}>) {
  return (
    <div className="grid gap-4 p-6">
      <div className="flex flex-col justify-between gap-3 rounded-lg bg-rpg-surface-muted p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
            Jogadores
          </p>
          <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
            Pessoas na campanha
          </h2>
        </div>
        <Button
          className="flex w-fit items-center gap-2 rounded-lg bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
          onPress={onInvite}
        >
          <UsersIcon className="h-5 w-5" />
          Convidar jogadores
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading ? (
          <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
            Carregando jogadores...
          </p>
        ) : null}
        {!isLoading && members.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
            Nenhum jogador listado ainda.
          </p>
        ) : null}
        {members.map((member) => (
          <CampaignMemberItem key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

function CampaignCharactersPanel({
  campaignId,
  characters,
  isLoading,
  onCreate,
}: Readonly<{
  campaignId: string;
  characters: CampaignCharacter[];
  isLoading: boolean;
  onCreate: () => void;
}>) {
  return (
    <div className="grid gap-4 p-6">
      <div className="flex flex-col justify-between gap-3 rounded-lg bg-rpg-surface-muted p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
            Personagens
          </p>
          <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
            Fichas da campanha
          </h2>
        </div>
        <Button
          className="flex w-fit items-center gap-2 rounded-lg bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
          onPress={onCreate}
        >
          <PlusIcon className="h-5 w-5" />
          Novo personagem
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
            Carregando personagens...
          </p>
        ) : null}
        {!isLoading && characters.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface-muted p-4 text-sm font-semibold text-rpg-muted">
            Nenhum personagem criado ainda.
          </p>
        ) : null}
        {characters.map((character) => (
          <CampaignCharacterItem
            campaignId={campaignId}
            character={character}
            key={character.entityId}
          />
        ))}
      </div>
    </div>
  );
}

function CampaignMapsPanel({
  campaignId,
  maps,
}: Readonly<{
  campaignId: string;
  maps: CampaignMap[];
}>) {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [newMapFile, setNewMapFile] = useState<File | null>(null);
  const [newMapName, setNewMapName] = useState("");
  const [newMapHasEmbeddedGrid, setNewMapHasEmbeddedGrid] = useState(false);
  const [editingMap, setEditingMap] = useState<CampaignMap | null>(null);
  const [editingMapName, setEditingMapName] = useState("");
  const [editingMapHasEmbeddedGrid, setEditingMapHasEmbeddedGrid] =
    useState(false);
  const [previewMap, setPreviewMap] = useState<CampaignMap | null>(null);

  const createMapMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !newMapFile) {
        throw new Error("Selecione uma imagem de mapa.");
      }

      return createCampaignMap(accessToken, campaignId, {
        hasEmbeddedGrid: newMapHasEmbeddedGrid,
        map: newMapFile,
        name: newMapName.trim() || newMapFile.name,
        showGrid: !newMapHasEmbeddedGrid,
      });
    },
    onError: (error) => {
      showToast({
        title: "Mapa nao salvo",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      setIsMapModalOpen(false);
      setNewMapFile(null);
      setNewMapName("");
      setNewMapHasEmbeddedGrid(false);
      showToast({
        title: "Mapa adicionado",
        description: "Ele ja esta disponivel na mesa virtual.",
        type: "success",
      });
    },
  });

  const updateMapMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !editingMap) {
        throw new Error("Mapa indisponivel.");
      }

      return updateCampaignMap(accessToken, campaignId, editingMap.id, {
        hasEmbeddedGrid: editingMapHasEmbeddedGrid,
        name: editingMapName.trim() || editingMap.name,
        showGrid: !editingMapHasEmbeddedGrid,
      });
    },
    onError: (error) => {
      showToast({
        title: "Mapa nao atualizado",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      setEditingMap(null);
      showToast({
        title: "Mapa atualizado",
        description: "As alteracoes foram salvas.",
        type: "success",
      });
    },
  });

  const deleteMapMutation = useMutation({
    mutationFn: (mapId: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return deleteCampaignMap(accessToken, campaignId, mapId);
    },
    onError: (error) => {
      showToast({
        title: "Mapa nao excluido",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      showToast({
        title: "Mapa excluido",
        description: "Ele foi removido da campanha.",
        type: "success",
      });
    },
  });

  function handleCreateMap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMapMutation.mutate();
  }

  function handleOpenEditMap(map: CampaignMap) {
    setEditingMap(map);
    setEditingMapName(map.name);
    setEditingMapHasEmbeddedGrid(map.hasEmbeddedGrid);
  }

  function handleUpdateMap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMapMutation.mutate();
  }

  function handleDeleteMap(map: CampaignMap) {
    const shouldDelete = window.confirm(`Excluir o mapa "${map.name}"?`);

    if (!shouldDelete) {
      return;
    }

    deleteMapMutation.mutate(map.id);
  }

  return (
    <>
      <div className="grid gap-4 p-6">
        <div className="flex flex-col justify-between gap-3 rounded-lg bg-rpg-surface-muted p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
              Mapas
            </p>
            <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
              Mapas da campanha
            </h2>
          </div>
          <Button
            className="flex w-fit items-center gap-2 rounded-lg bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
            onPress={() => setIsMapModalOpen(true)}
          >
            <PlusIcon className="h-5 w-5" />
            Novo mapa
          </Button>
        </div>

        {maps.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {maps.map((map) => {
              const imageUrl = getCampaignIconUrl(map.imageUrl);

              return (
                <div
                  className="group grid overflow-hidden rounded-lg border border-rpg-border bg-rpg-surface text-left text-rpg-text shadow-sm transition hover:border-rpg-primary hover:shadow-lg hover:shadow-rpg-primary/10"
                  key={map.id}
                >
                  <button
                    className="relative block aspect-[3/1] overflow-hidden bg-rpg-surface-muted text-left"
                    onClick={() => setPreviewMap(map)}
                    type="button"
                  >
                    {imageUrl ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                      />
                    ) : (
                      <span className="grid h-full place-items-center">
                        <MapIcon className="h-8 w-8 text-rpg-primary" />
                      </span>
                    )}
                  </button>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3">
                    <button
                      className="block truncate text-left text-base font-black tracking-normal transition hover:text-rpg-primary"
                      onClick={() => setPreviewMap(map)}
                      type="button"
                    >
                      {map.name}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`Editar mapa ${map.name}`}
                        className="grid size-8 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                        onClick={() => handleOpenEditMap(map)}
                        title="Editar mapa"
                        type="button"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`Excluir mapa ${map.name}`}
                        className="grid size-8 place-items-center rounded-lg text-rpg-muted transition hover:bg-red-50 hover:text-rpg-danger"
                        disabled={deleteMapMutation.isPending}
                        onClick={() => handleDeleteMap(map)}
                        title="Excluir mapa"
                        type="button"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-rpg-border bg-rpg-surface-muted p-10 text-center">
            <MapIcon className="h-10 w-10 text-rpg-primary" />
            <h2 className="mt-4 text-xl font-black tracking-normal text-rpg-text">
              Nenhum mapa cadastrado
            </h2>
            <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-rpg-muted">
              Cadastre o primeiro mapa para ele aparecer na mesa virtual.
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <MapIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Mapas
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Novo mapa
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de mapa"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsMapModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5"
                onSubmit={handleCreateMap}
              >
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Imagem do mapa
                  </Label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-rpg-border bg-white px-4 py-4 text-sm font-semibold text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary">
                    <span className="flex min-w-0 items-center gap-3">
                      <ImageIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate">
                        {newMapFile
                          ? newMapFile.name
                          : "Selecionar imagem do mapa"}
                      </span>
                    </span>
                    <input
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) =>
                        setNewMapFile(event.target.files?.[0] ?? null)
                      }
                      type="file"
                    />
                  </label>
                </div>

                <TextField className="flex flex-col gap-2" name="name">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Nome do mapa
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      onChange={(event) => setNewMapName(event.target.value)}
                      placeholder="Ex.: Mansao - Terreo"
                      value={newMapName}
                    />
                  </InputGroup>
                </TextField>

                <label className="flex items-center gap-2 text-sm font-semibold text-rpg-muted">
                  <input
                    checked={newMapHasEmbeddedGrid}
                    className="size-4 accent-rpg-primary"
                    onChange={(event) =>
                      setNewMapHasEmbeddedGrid(event.target.checked)
                    }
                    type="checkbox"
                  />
                  A imagem ja tem grid
                </label>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={() => setIsMapModalOpen(false)}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={!newMapFile || createMapMutation.isPending}
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {createMapMutation.isPending
                      ? "Salvando..."
                      : "Salvar mapa"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={Boolean(editingMap)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingMap(null);
          }
        }}
      >
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <PencilIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Mapas
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Editar mapa
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de edicao do mapa"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setEditingMap(null)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5"
                onSubmit={handleUpdateMap}
              >
                <TextField className="flex flex-col gap-2" name="name">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Nome do mapa
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      onChange={(event) =>
                        setEditingMapName(event.target.value)
                      }
                      placeholder="Ex.: Mansao - Terreo"
                      value={editingMapName}
                    />
                  </InputGroup>
                </TextField>

                <label className="flex items-center gap-2 text-sm font-semibold text-rpg-muted">
                  <input
                    checked={editingMapHasEmbeddedGrid}
                    className="size-4 accent-rpg-primary"
                    onChange={(event) =>
                      setEditingMapHasEmbeddedGrid(event.target.checked)
                    }
                    type="checkbox"
                  />
                  A imagem ja tem grid
                </label>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={() => setEditingMap(null)}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={!editingMap || updateMapMutation.isPending}
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {updateMapMutation.isPending
                      ? "Salvando..."
                      : "Salvar alteracoes"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={Boolean(previewMap)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewMap(null);
          }
        }}
      >
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="cover">
            <Modal.Dialog className="relative max-h-[calc(100vh-2rem)] w-[min(94vw,72rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <MapIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Mapa
                    </p>
                    <Modal.Heading className="truncate text-xl font-black tracking-normal text-rpg-text">
                      {previewMap?.name}
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar visualizacao do mapa"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setPreviewMap(null)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Modal.Body className="max-h-[calc(100vh-9rem)] overflow-auto bg-rpg-surface-muted p-4">
                {previewMap ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={previewMap.name}
                    className="mx-auto max-h-[calc(100vh-12rem)] max-w-full rounded-2xl border border-rpg-border bg-white object-contain shadow-sm"
                    src={getCampaignIconUrl(previewMap.imageUrl) ?? ""}
                  />
                ) : null}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

function CampaignSoundsPanel({
  campaignId,
  sounds,
}: Readonly<{
  campaignId: string;
  sounds: CampaignSound[];
}>) {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [newSoundFile, setNewSoundFile] = useState<File | null>(null);
  const [newSoundName, setNewSoundName] = useState("");
  const [newSoundType, setNewSoundType] =
    useState<CampaignSoundType>("effect");
  const [editingSound, setEditingSound] = useState<CampaignSound | null>(null);
  const [editingSoundName, setEditingSoundName] = useState("");
  const [editingSoundType, setEditingSoundType] =
    useState<CampaignSoundType>("effect");

  const createSoundMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !newSoundFile) {
        throw new Error("Selecione um arquivo de audio.");
      }

      return createCampaignSound(accessToken, campaignId, {
        name: newSoundName.trim() || newSoundFile.name,
        sound: newSoundFile,
        type: newSoundType,
      });
    },
    onError: (error) => {
      showToast({
        title: "Som nao salvo",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      setIsSoundModalOpen(false);
      setNewSoundFile(null);
      setNewSoundName("");
      setNewSoundType("effect");
      showToast({
        title: "Som adicionado",
        description: "Ele ja esta disponivel na mesa virtual.",
        type: "success",
      });
    },
  });

  const updateSoundMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !editingSound) {
        throw new Error("Som indisponivel.");
      }

      return updateCampaignSound(accessToken, campaignId, editingSound.id, {
        name: editingSoundName.trim() || editingSound.name,
        type: editingSoundType,
      });
    },
    onError: (error) => {
      showToast({
        title: "Som nao atualizado",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      setEditingSound(null);
      showToast({
        title: "Som atualizado",
        description: "As alteracoes foram salvas.",
        type: "success",
      });
    },
  });

  const deleteSoundMutation = useMutation({
    mutationFn: (soundId: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return deleteCampaignSound(accessToken, campaignId, soundId);
    },
    onError: (error) => {
      showToast({
        title: "Som nao excluido",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      showToast({
        title: "Som excluido",
        description: "Ele foi removido da campanha.",
        type: "success",
      });
    },
  });

  function handleCreateSound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createSoundMutation.mutate();
  }

  function handleOpenEditSound(sound: CampaignSound) {
    setEditingSound(sound);
    setEditingSoundName(sound.name);
    setEditingSoundType(sound.type);
  }

  function handleUpdateSound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateSoundMutation.mutate();
  }

  function handleDeleteSound(sound: CampaignSound) {
    const shouldDelete = window.confirm(`Excluir o som "${sound.name}"?`);

    if (!shouldDelete) {
      return;
    }

    deleteSoundMutation.mutate(sound.id);
  }

  return (
    <>
      <div className="grid gap-4 p-6">
        <div className="flex flex-col justify-between gap-3 rounded-lg bg-rpg-surface-muted p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rpg-muted">
              Sons
            </p>
            <h2 className="mt-2 text-lg font-black tracking-normal text-rpg-text">
              Musicas e efeitos
            </h2>
          </div>
          <Button
            className="flex w-fit items-center gap-2 rounded-lg bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
            onPress={() => setIsSoundModalOpen(true)}
          >
            <PlusIcon className="h-5 w-5" />
            Novo som
          </Button>
        </div>

        {sounds.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sounds.map((sound) => (
              <SoundPlayerCard
                actions={
                  <>
                    <button
                      aria-label={`Editar som ${sound.name}`}
                      className="grid size-8 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                      onClick={() => handleOpenEditSound(sound)}
                      title="Editar som"
                      type="button"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Excluir som ${sound.name}`}
                      className="grid size-8 place-items-center rounded-lg text-rpg-muted transition hover:bg-red-50 hover:text-rpg-danger"
                      disabled={deleteSoundMutation.isPending}
                      onClick={() => handleDeleteSound(sound)}
                      title="Excluir som"
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </>
                }
                key={sound.id}
                sound={sound}
              />
            ))}
          </div>
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-rpg-border bg-rpg-surface-muted p-10 text-center">
            <Volume2Icon className="h-10 w-10 text-rpg-primary" />
            <h2 className="mt-4 text-xl font-black tracking-normal text-rpg-text">
              Nenhum som cadastrado
            </h2>
            <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-rpg-muted">
              Cadastre musicas e efeitos para usar durante a mesa virtual.
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isSoundModalOpen} onOpenChange={setIsSoundModalOpen}>
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <Volume2Icon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Sons
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Novo som
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de som"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setIsSoundModalOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5"
                onSubmit={handleCreateSound}
              >
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Arquivo de audio
                  </Label>
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-rpg-border bg-white px-4 py-4 text-sm font-semibold text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary">
                    <span className="flex min-w-0 items-center gap-3">
                      <Volume2Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">
                        {newSoundFile
                          ? newSoundFile.name
                          : "Selecionar arquivo de audio"}
                      </span>
                    </span>
                    <input
                      accept="audio/*"
                      className="sr-only"
                      onChange={(event) =>
                        setNewSoundFile(event.target.files?.[0] ?? null)
                      }
                      type="file"
                    />
                  </label>
                </div>

                <TextField className="flex flex-col gap-2" name="name">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Nome do som
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      onChange={(event) => setNewSoundName(event.target.value)}
                      placeholder="Ex.: Tema de combate"
                      value={newSoundName}
                    />
                  </InputGroup>
                </TextField>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Efeito", value: "effect" },
                    { label: "Musica", value: "music" },
                  ].map((option) => (
                    <button
                      className={`rounded-lg border px-3 py-2 text-sm font-black transition ${
                        newSoundType === option.value
                          ? "border-rpg-primary bg-rpg-primary-soft text-rpg-primary"
                          : "border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
                      }`}
                      key={option.value}
                      onClick={() =>
                        setNewSoundType(option.value as CampaignSoundType)
                      }
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={() => setIsSoundModalOpen(false)}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={!newSoundFile || createSoundMutation.isPending}
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {createSoundMutation.isPending
                      ? "Salvando..."
                      : "Salvar som"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={Boolean(editingSound)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingSound(null);
          }
        }}
      >
        <Modal.Backdrop className="bg-black/45" variant="blur">
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="relative max-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl">
              <Modal.Header className="!flex !flex-row !items-start !justify-between gap-4 border-b border-rpg-border px-6 py-5 text-left">
                <div className="flex min-w-0 items-center gap-3">
                  <Modal.Icon className="grid size-10 place-items-center rounded-2xl bg-rpg-primary text-white">
                    <PencilIcon className="h-5 w-5" />
                  </Modal.Icon>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-rpg-muted">
                      Sons
                    </p>
                    <Modal.Heading className="text-xl font-black tracking-normal text-rpg-text">
                      Editar som
                    </Modal.Heading>
                  </div>
                </div>

                <Button
                  aria-label="Fechar modal de edicao do som"
                  className="ml-auto grid size-9 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
                  onPress={() => setEditingSound(null)}
                  type="button"
                  variant="secondary"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </Modal.Header>

              <Form
                className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5"
                onSubmit={handleUpdateSound}
              >
                <TextField className="flex flex-col gap-2" name="name">
                  <Label className="text-sm font-semibold text-rpg-text">
                    Nome do som
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      onChange={(event) =>
                        setEditingSoundName(event.target.value)
                      }
                      placeholder="Ex.: Tema de combate"
                      value={editingSoundName}
                    />
                  </InputGroup>
                </TextField>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Efeito", value: "effect" },
                    { label: "Musica", value: "music" },
                  ].map((option) => (
                    <button
                      className={`rounded-lg border px-3 py-2 text-sm font-black transition ${
                        editingSoundType === option.value
                          ? "border-rpg-primary bg-rpg-primary-soft text-rpg-primary"
                          : "border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
                      }`}
                      key={option.value}
                      onClick={() =>
                        setEditingSoundType(option.value as CampaignSoundType)
                      }
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <Modal.Footer className="flex justify-end gap-3 border-t border-rpg-border pt-5">
                  <Button
                    className="rounded-lg border border-rpg-border px-4 py-2 text-sm font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                    onPress={() => setEditingSound(null)}
                    type="button"
                    variant="secondary"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                    isDisabled={!editingSound || updateSoundMutation.isPending}
                    type="submit"
                  >
                    <SaveIcon className="h-5 w-5" />
                    {updateSoundMutation.isPending
                      ? "Salvando..."
                      : "Salvar alteracoes"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

function SoundPlayerCard({
  actions,
  sound,
}: Readonly<{
  actions?: ReactNode;
  sound: CampaignSound;
}>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleTogglePlay() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play();
    setIsPlaying(true);
  }

  function handleStop() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function handleSeek(value: string) {
    const nextTime = Number(value);
    const audio = audioRef.current;

    if (!audio || Number.isNaN(nextTime)) {
      return;
    }

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function handleToggleLoop() {
    const nextIsLooping = !isLooping;

    setIsLooping(nextIsLooping);

    if (audioRef.current) {
      audioRef.current.loop = nextIsLooping;
    }
  }

  return (
    <div className="grid gap-3 rounded-lg border border-rpg-border bg-rpg-surface p-3 shadow-sm transition hover:border-rpg-primary">
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3">
        <span className="grid aspect-square place-items-center rounded-lg bg-rpg-primary-soft text-rpg-primary">
          {sound.type === "music" ? (
            <MusicIcon className="h-5 w-5" />
          ) : (
            <Volume2Icon className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-black text-rpg-text">
            {sound.name}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-rpg-muted">
            {sound.type === "music" ? "Musica" : "Efeito"}
          </span>
        </span>
        {actions ? <span className="flex items-center gap-1">{actions}</span> : null}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <button
            aria-label={`${isPlaying ? "Pausar" : "Tocar"} ${sound.name}`}
            className={`grid size-9 place-items-center rounded-lg transition ${
              isPlaying
                ? "bg-rpg-primary text-white"
                : "border border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
            }`}
            onClick={handleTogglePlay}
            type="button"
          >
            {isPlaying ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </button>
          <button
            aria-label={`Parar ${sound.name}`}
            className="grid size-9 place-items-center rounded-lg border border-rpg-border text-rpg-muted transition hover:border-rpg-danger hover:text-rpg-danger"
            onClick={handleStop}
            type="button"
          >
            <SquareIcon className="h-3.5 w-3.5 fill-current" />
          </button>
          <button
            aria-label={`${isLooping ? "Desativar" : "Ativar"} repeticao de ${sound.name}`}
            className={`grid size-9 place-items-center rounded-lg border transition ${
              isLooping
                ? "border-rpg-primary bg-rpg-primary-soft text-rpg-primary"
                : "border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
            }`}
            onClick={handleToggleLoop}
            type="button"
          >
            <RepeatIcon className="h-4 w-4" />
          </button>
          <span className="ml-auto text-xs font-black text-rpg-muted">
            {formatSoundTime(currentTime)} / {formatSoundTime(duration)}
          </span>
        </div>

        <input
          className="w-full accent-rpg-primary"
          max={duration || 0}
          min={0}
          onChange={(event) => handleSeek(event.target.value)}
          step={0.1}
          type="range"
          value={duration ? currentTime : 0}
        />
      </div>

      <audio
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
          }
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        ref={audioRef}
        src={getCampaignIconUrl(sound.audioUrl) ?? ""}
      />
    </div>
  );
}

function CampaignCharacterItem({
  campaignId,
  character,
}: Readonly<{ campaignId: string; character: CampaignCharacter }>) {
  const avatarUrl = getCampaignIconUrl(character.avatarUrl);
  const createdAt = character.createdAt
    ? new Date(character.createdAt).toLocaleDateString("pt-BR")
    : "sem data";

  return (
    <Link
      className="group grid min-h-36 grid-cols-[8.5rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-rpg-border bg-rpg-surface text-rpg-text shadow-sm transition hover:border-rpg-primary hover:shadow-lg hover:shadow-rpg-primary/10"
      href={`/campaigns/${campaignId}/characters/${character.entityId}`}
    >
      <span className="grid h-full min-h-36 place-items-center overflow-hidden bg-rpg-surface-muted">
        {avatarUrl ? (
          <span
            aria-hidden="true"
            className="h-full w-full bg-cover bg-[center_22%] transition duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        ) : (
          <UserRoundIcon className="h-10 w-10 text-rpg-primary" />
        )}
      </span>

      <span className="relative grid min-w-0 content-between gap-3 p-4">
        <SettingsIcon className="absolute right-3 top-3 h-4 w-4 text-rpg-muted transition group-hover:text-rpg-primary" />

        <span className="min-w-0 pr-8">
          <span className="block truncate text-lg font-black tracking-normal">
            {character.name}
          </span>
          <span className="mt-1 block truncate text-sm font-bold text-rpg-primary">
            {getOrdemAgentClassLabel(character.agentClass)}
          </span>
          <span className="mt-2 block truncate text-xs font-semibold text-rpg-muted">
            Registrado em {createdAt}
          </span>
        </span>

        <span className="ml-auto inline-flex w-fit items-center rounded-md bg-rpg-primary px-3 py-2 text-xs font-black text-white shadow-lg shadow-rpg-primary/20 transition group-hover:bg-rpg-primary-hover">
          Acessar ficha
        </span>
      </span>
    </Link>
  );
}

function CampaignMemberItem({ member }: Readonly<{ member: CampaignMember }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          avatarUrl={member.user.avatarUrl}
          name={member.user.displayName}
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-rpg-text">
            {member.user.displayName}
          </h3>
          <p className="truncate text-sm font-semibold text-rpg-muted">
            {member.user.email}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-lg bg-rpg-primary-soft px-3 py-2 text-xs font-black text-rpg-primary">
        {getCampaignMemberRoleLabel(member.role)}
      </span>
    </div>
  );
}

function EntityTypeChoice({
  description,
  icon,
  isActive,
  isDisabled,
  label,
  onSelect,
}: Readonly<{
  description: string;
  icon: ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  label: string;
  onSelect?: () => void;
}>) {
  return (
    <button
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
        isActive
          ? "border-rpg-primary bg-rpg-primary-soft"
          : "border-rpg-border bg-white"
      } ${isDisabled ? "cursor-not-allowed opacity-60" : "hover:border-rpg-primary"}`}
      disabled={isDisabled}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          isActive
            ? "bg-rpg-primary text-white"
            : "bg-rpg-primary-soft text-rpg-primary"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-rpg-text">{label}</span>
        <span className="mt-1 block text-xs font-semibold text-rpg-muted">
          {description}
        </span>
      </span>
    </button>
  );
}

function InviteFriendItem({
  campaignId,
  inviteFriend,
  isPending,
  onInvite,
}: Readonly<{
  campaignId: string;
  inviteFriend: CampaignInviteFriend;
  isPending: boolean;
  onInvite: (recipientUserId: string) => void;
}>) {
  const canInvite = inviteFriend.status === "available";

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          avatarUrl={inviteFriend.friend.avatarUrl}
          name={inviteFriend.friend.displayName}
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-rpg-text">
            {inviteFriend.friend.displayName}
          </h3>
          <p className="truncate text-sm font-semibold text-rpg-muted">
            {inviteFriend.friend.email}
          </p>
        </div>
      </div>

      <Button
        className={`flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${
          canInvite
            ? "bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20"
            : "border border-rpg-border text-rpg-muted"
        }`}
        isDisabled={!canInvite || isPending}
        onPress={() => onInvite(inviteFriend.friend.id)}
        variant={canInvite ? "primary" : "secondary"}
      >
        <MailPlusIcon className="h-4 w-4" />
        {getInviteFriendStatusLabel(inviteFriend.status, campaignId)}
      </Button>
    </div>
  );
}

function NumberField({
  defaultValue,
  label,
  max,
  min,
  name,
}: Readonly<{
  defaultValue: string;
  label: string;
  max: number;
  min: number;
  name: keyof CreateOrdemAgentPayload;
}>) {
  return (
    <TextField
      className="flex flex-col gap-2"
      defaultValue={defaultValue}
      name={name}
      type="number"
    >
      <Label className="text-sm font-semibold text-rpg-text">{label}</Label>
      <InputGroup
        className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
        fullWidth
        variant="secondary"
      >
        <InputGroup.Input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
          max={max}
          min={min}
        />
      </InputGroup>
    </TextField>
  );
}

function UserAvatar({
  avatarUrl,
  name,
}: Readonly<{ avatarUrl?: string; name: string }>) {
  const imageUrl = getCampaignIconUrl(avatarUrl);

  return (
    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-rpg-primary text-sm font-black text-white">
      {imageUrl ? (
        <img alt="" className="h-full w-full object-cover" src={imageUrl} />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function getCampaignMemberRoleLabel(role: CampaignMemberRole) {
  return role === "game_master" ? "Mestre" : "Jogador";
}

function getOrdemAgentClassLabel(agentClass?: OrdemAgentClass) {
  if (agentClass === "especialista") {
    return "Especialista";
  }

  if (agentClass === "ocultista") {
    return "Ocultista";
  }

  return "Combatente";
}

function isOrdemAgentClass(
  value: string | number | null,
): value is OrdemAgentClass {
  if (value === null) {
    return false;
  }

  return ordemAgentClassOptions.some((option) => option.value === value);
}

function getInviteFriendStatusLabel(
  status: CampaignInviteFriend["status"],
  campaignId: string,
) {
  if (status === "member") {
    return "Ja participa";
  }

  if (status === "pending") {
    return "Convite pendente";
  }

  return campaignId ? "Convidar" : "Convidar";
}

function getFormNumber(
  formData: FormData,
  key: keyof CreateOrdemAgentPayload,
  fallback: number,
) {
  const value = Number(formData.get(key));

  if (Number.isFinite(value)) {
    return value;
  }

  return fallback;
}

function getCampaignIconUrl(iconUrl?: string) {
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

function formatSoundTime(value: number) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateCampaignCache(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId: string,
  campaign: Campaign,
) {
  queryClient.setQueryData(["campaign", campaignId], campaign);
}

function getMutationErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const message = error.response.message;

    return Array.isArray(message) ? message[0] : message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Tente novamente em instantes.";
}
