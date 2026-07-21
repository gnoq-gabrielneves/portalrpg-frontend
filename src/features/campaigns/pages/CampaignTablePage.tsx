"use client";

import { Button, Slider, Switch } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  CircleIcon,
  CrownIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  Grid3X3Icon,
  HeartCrackIcon,
  LayersIcon,
  MapIcon,
  Maximize2Icon,
  MessageSquareIcon,
  Minimize2Icon,
  MoreVerticalIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  SkullIcon,
  SaveIcon,
  SettingsIcon,
  ShieldAlertIcon,
  SendIcon,
  SquareIcon,
  Trash2Icon,
  UsersIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  type FormEvent,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import { useCampaignCharacters } from "../hooks/useCampaignCharacters";
import { useCampaignRealtime } from "../hooks/useCampaignRealtime";
import {
  clearCampaignChatMessages,
  createCampaignChatMessage,
  createCampaignTableToken,
  deleteCampaignTableToken,
  getCampaign,
  getCampaignAssetUrl,
  getCampaignChatMessages,
  setActiveCampaignMap,
  updateCampaignMap,
  updateCampaignSound,
  updateCampaignTableToken,
} from "../services/campaignsService";
import {
  Campaign,
  CampaignCharacter,
  CampaignChatMessage,
  CampaignMap,
  CampaignMapGrid,
  CampaignSound,
  CampaignTableToken,
  CampaignTableTokenStatus,
} from "../types/campaign";

type CampaignTablePageProps = {
  campaignId: string;
};

const defaultGrid = {
  color: "#7c3aed",
  offsetX: 0,
  offsetY: 0,
  opacity: 0.28,
  show: true,
  size: 64,
};
const tableTokenSize = 44;
const minimumTableTokenSize = 42;
const tokenStatusOptions: Array<{
  icon: ReactNode;
  label: string;
  status: CampaignTableTokenStatus;
}> = [
  {
    icon: <CircleIcon className="h-4 w-4" />,
    label: "Normal",
    status: "normal",
  },
  {
    icon: <HeartCrackIcon className="h-4 w-4" />,
    label: "Ferido",
    status: "injured",
  },
  {
    icon: <AlertTriangleIcon className="h-4 w-4" />,
    label: "Morrendo",
    status: "dying",
  },
  {
    icon: <ShieldAlertIcon className="h-4 w-4" />,
    label: "Inconsciente",
    status: "unconscious",
  },
  {
    icon: <SkullIcon className="h-4 w-4" />,
    label: "Morto",
    status: "dead",
  },
];

type DraftActiveMap = {
  map: CampaignMap;
  mapId: string;
};


export function CampaignTablePage({ campaignId }: CampaignTablePageProps) {
  const { accessToken, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [gridControlsMapId, setGridControlsMapId] = useState<string | null>(
    null,
  );
  const [draftActiveMap, setDraftActiveMap] = useState<DraftActiveMap | null>(
    null,
  );
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [snapTokensToGrid, setSnapTokensToGrid] = useState(true);

  useCampaignRealtime(campaignId);

  const campaignQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getCampaign(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId],
    // Tempo real (Socket.IO) faz a atualizacao instantanea; o polling lento
    // e so uma rede de seguranca caso o WebSocket caia.
    refetchInterval: 12000,
    refetchIntervalInBackground: true,
  });
  const charactersQuery = useCampaignCharacters(campaignId);

  const campaign = campaignQuery.data;
  const isGameMaster = campaign?.ownerId === user?.id;
  const maps = useMemo(() => campaign?.maps ?? [], [campaign?.maps]);
  const sounds = useMemo(() => campaign?.sounds ?? [], [campaign?.sounds]);
  const tableTokens = useMemo(() => campaign?.tableTokens ?? [], [campaign]);
  const charactersByEntityId = useMemo(
    () =>
      new Map(
        (charactersQuery.data ?? []).map((character) => [
          character.entityId,
          character,
        ]),
      ),
    [charactersQuery.data],
  );
  const activeMap = useMemo(
    () => maps.find((map) => map.id === campaign?.activeMapId) ?? null,
    [campaign?.activeMapId, maps],
  );
  const previewMap =
    draftActiveMap && draftActiveMap.mapId === activeMap?.id
      ? draftActiveMap.map
      : activeMap;
  const isGridControlsDirty = Boolean(
    previewMap &&
      activeMap &&
      gridControlsMapId === previewMap.id &&
      !areMapSettingsEqual(previewMap, activeMap),
  );

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        setIsFocusMode(false);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const updateMapMutation = useMutation({
    mutationFn: (map: CampaignMap) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return updateCampaignMap(accessToken, campaignId, map.id, {
        gridColor: map.grid.color,
        gridOffsetX: map.grid.offsetX,
        gridOffsetY: map.grid.offsetY,
        gridOpacity: map.grid.opacity,
        gridSize: map.grid.size,
        hasEmbeddedGrid: map.hasEmbeddedGrid,
        name: map.name,
        showGrid: map.grid.show,
      });
    },
    onError: (error) => {
      showToast({
        title: "Mapa nao atualizado",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign, savedMap) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      const refreshedMap =
        updatedCampaign.maps?.find((map) => map.id === savedMap.id) ?? null;

      setDraftActiveMap(
        refreshedMap ? { map: refreshedMap, mapId: refreshedMap.id } : null,
      );
      showToast({
        title: "Mapa atualizado",
        description: "Grid e configuracoes foram salvos.",
        type: "success",
      });
    },
  });

  const setActiveMapMutation = useMutation({
    mutationFn: (mapId: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return setActiveCampaignMap(accessToken, campaignId, mapId);
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
    },
  });

  const createTokenMutation = useMutation({
    mutationFn: (characterEntityId: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return createCampaignTableToken(accessToken, campaignId, {
        characterEntityId,
      });
    },
    onError: (error) => {
      showToast({
        title: "Token nao adicionado",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
      showToast({
        title: "Token adicionado",
        description: "A ficha foi colocada na mesa.",
        type: "success",
      });
    },
  });

  const updateTokenMutation = useMutation({
    mutationFn: ({
      isHidden,
      status,
      tokenId,
      x,
      y,
    }: {
      isHidden?: boolean;
      status?: CampaignTableTokenStatus;
      tokenId: string;
      x?: number;
      y?: number;
    }) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return updateCampaignTableToken(accessToken, campaignId, tokenId, {
        isHidden,
        status,
        x,
        y,
      });
    },
    onError: (error) => {
      showToast({
        title: "Token nao movido",
        description: getMutationErrorMessage(error),
        type: "error",
      });
      void queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: (tokenId: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return deleteCampaignTableToken(accessToken, campaignId, tokenId);
    },
    onError: (error) => {
      showToast({
        title: "Token nao removido",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: (updatedCampaign) => {
      updateCampaignCache(queryClient, campaignId, updatedCampaign);
    },
  });

  function handleToggleMap(mapId: string) {
    if (mapId === activeMap?.id) {
      setGridControlsMapId(null);
    }

    setActiveMapMutation.mutate(mapId);
  }

  function handleToggleGridControls(mapId: string) {
    setGridControlsMapId((currentMapId) =>
      currentMapId === mapId ? null : mapId,
    );

    if (mapId !== activeMap?.id) {
      setActiveMapMutation.mutate(mapId);
    }
  }

  function handleMoveToken(
    tokenId: string,
    position: { x: number; y: number },
  ) {
    updateTokenCache(queryClient, campaignId, tokenId, position);
    updateTokenMutation.mutate({ tokenId, ...position });
  }

  function handleSetTokenStatus(
    tokenId: string,
    status: CampaignTableTokenStatus,
  ) {
    updateTokenCache(queryClient, campaignId, tokenId, { status });
    updateTokenMutation.mutate({ status, tokenId });
  }

  function handleToggleTokenHidden(tokenId: string, isHidden: boolean) {
    updateTokenCache(queryClient, campaignId, tokenId, { isHidden });
    updateTokenMutation.mutate({ isHidden, tokenId });
  }

  async function handleToggleFocusMode() {
    const nextIsFocusMode = !isFocusMode;

    setIsFocusMode(nextIsFocusMode);

    if (typeof document === "undefined") {
      return;
    }

    try {
      if (nextIsFocusMode && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      if (!nextIsFocusMode && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // O navegador pode bloquear fullscreen fora de contexto interativo.
    }
  }

  return (
    <motion.section
      animate="visible"
      className={`grid w-full gap-6 2xl:gap-8 ${
        isFocusMode
          ? "fixed inset-0 z-50 h-dvh overflow-hidden bg-rpg-surface p-4"
          : ""
      }`}
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <AnimatePresence initial={false}>
        {!isFocusMode ? (
          <motion.header
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            variants={fadeInUp}
          >
            <Link
              className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-rpg-muted transition hover:text-rpg-primary"
              href={`/campaigns/${campaignId}`}
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Voltar para campanha
            </Link>

            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
                  <MapIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
                    Mesa virtual
                  </p>
                  <h1 className="truncate text-3xl font-black tracking-normal text-rpg-text">
                    {campaign?.name ?? "Área de jogo"}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-rpg-border bg-rpg-surface-muted px-3 py-2 text-sm font-black text-rpg-muted">
                  <LayersIcon className="h-4 w-4 text-rpg-primary" />
                  {maps.length} {maps.length === 1 ? "mapa" : "mapas"}
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-rpg-primary bg-rpg-primary-soft px-3 py-2 text-sm font-black text-rpg-primary transition hover:bg-rpg-primary hover:text-white"
                  onClick={handleToggleFocusMode}
                  type="button"
                >
                  <Maximize2Icon className="h-4 w-4" />
                  Tela cheia
                </button>
              </div>
            </div>
          </motion.header>
        ) : null}
      </AnimatePresence>

      <motion.section
        className={`grid gap-5 ${isFocusMode ? "h-full min-h-0" : ""}`}
        layout
        variants={fadeInUp}
      >
        <div
          className={`grid gap-5 ${
            isFocusMode
              ? "h-full min-h-0 xl:grid-cols-[minmax(0,1fr)_22rem]"
              : "xl:h-[min(42rem,calc(100dvh-12rem))] xl:min-h-[30rem] xl:grid-cols-[minmax(0,1fr)_22rem]"
          }`}
        >
          <div
            className={`grid min-w-0 ${
              isFocusMode ? "h-full min-h-0" : "xl:h-full xl:min-h-0"
            }`}
          >
            <section
              className={`grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface shadow-sm ${
                isFocusMode
                  ? "h-full min-h-0"
                  : "min-h-[30rem] xl:h-full xl:min-h-0"
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-rpg-border bg-rpg-surface px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-rpg-muted">
                    Mesa
                  </p>
                  <h2 className="truncate text-base font-black tracking-normal text-rpg-text">
                    {previewMap?.name ?? "Nenhum mapa ativo"}
                  </h2>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-rpg-border px-3 py-2 text-sm font-black text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary"
                  onClick={handleToggleFocusMode}
                  type="button"
                >
                  {isFocusMode ? (
                    <Minimize2Icon className="h-4 w-4" />
                  ) : (
                    <Maximize2Icon className="h-4 w-4" />
                  )}
                  {isFocusMode ? "Sair" : "Tela cheia"}
                </button>
              </div>
              <MapCanvas
                activeMap={previewMap}
                canMoveTokens={Boolean(campaign)}
                canSetTokenStatus={Boolean(isGameMaster)}
                charactersByEntityId={charactersByEntityId}
                isFocusMode={isFocusMode}
                isLoading={campaignQuery.isLoading}
                onMoveToken={handleMoveToken}
                onSetTokenStatus={handleSetTokenStatus}
                onToggleTokenHidden={handleToggleTokenHidden}
                shouldSnapTokens={snapTokensToGrid}
                tokens={tableTokens}
              />
              <TableSharedAudio sounds={sounds} />
            </section>
          </div>

          <AnimatePresence initial={false} mode="popLayout">
            <CampaignTableChatPanel
              accessToken={accessToken}
              campaignId={campaignId}
              gameMasterId={campaign?.ownerId}
              isCollapsed={isChatCollapsed}
              isFocusMode={isFocusMode}
              isGameMaster={Boolean(isGameMaster)}
              key={isChatCollapsed ? "chat-collapsed" : "chat-open"}
              onToggleCollapsed={() =>
                setIsChatCollapsed((currentValue) => !currentValue)
              }
            />
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {!isFocusMode && isGameMaster ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3"
              exit={{ opacity: 0, y: 16 }}
              initial={{ opacity: 0, y: 16 }}
              layout
              transition={{ duration: 0.2 }}
            >
              <TableControlCard
                icon={<LayersIcon className="h-4 w-4" />}
                title="Mapas"
              >
                <MapList
                  activeMapId={activeMap?.id}
                  campaignId={campaignId}
                  editingGridMapId={gridControlsMapId}
                  gridControlsMap={
                    previewMap && gridControlsMapId === previewMap.id
                      ? previewMap
                      : null
                  }
                  isGridControlsDirty={isGridControlsDirty}
                  isSavingGridControls={updateMapMutation.isPending}
                  maps={maps}
                  onChangeGridControls={(map) =>
                    setDraftActiveMap({ map, mapId: map.id })
                  }
                  onCloseGridControls={() => setGridControlsMapId(null)}
                  onSaveGridControls={(map) => updateMapMutation.mutate(map)}
                  onToggle={handleToggleMap}
                  onToggleGridControls={handleToggleGridControls}
                />
              </TableControlCard>

              <TableControlCard
                icon={<UsersIcon className="h-4 w-4" />}
                title="Jogadores"
              >
                <TablePlayersPanel
                  campaignId={campaignId}
                  characters={charactersQuery.data ?? []}
                  isCreatingToken={createTokenMutation.isPending}
                  isGameMaster={isGameMaster}
                  isLoading={charactersQuery.isLoading}
                  onCreateToken={(characterEntityId) =>
                    createTokenMutation.mutate(characterEntityId)
                  }
                  onDeleteToken={(tokenId) =>
                    deleteTokenMutation.mutate(tokenId)
                  }
                  onSnapChange={setSnapTokensToGrid}
                  snapTokensToGrid={snapTokensToGrid}
                  tokens={tableTokens}
                />
              </TableControlCard>

              <TableControlCard
                icon={<Volume2Icon className="h-4 w-4" />}
                title="Sons"
              >
                <TableSoundsPanel
                  accessToken={accessToken}
                  campaignId={campaignId}
                  sounds={sounds}
                />
              </TableControlCard>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </motion.section>

    </motion.section>
  );
}

function TableControlCard({
  children,
  className = "",
  icon,
  title,
}: Readonly<{
  children: ReactNode;
  className?: string;
  icon: ReactNode;
  title: string;
}>) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.details
      className={`group h-fit overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface shadow-sm ${className}`}
      layout
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-rpg-border px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2 text-sm font-black text-rpg-text">
          <span className="grid size-7 place-items-center rounded-lg bg-rpg-primary-soft text-rpg-primary">
            {icon}
          </span>
          {title}
        </span>
        <ChevronDownIcon className="h-4 w-4 text-rpg-muted transition group-open:rotate-180" />
      </summary>
      <motion.div
        className="grid gap-3 bg-rpg-surface-muted p-4"
        layout
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.details>
  );
}

function CampaignTableChatPanel({
  accessToken,
  campaignId,
  gameMasterId,
  isCollapsed,
  isFocusMode,
  isGameMaster,
  onToggleCollapsed,
}: Readonly<{
  accessToken?: string | null;
  campaignId: string;
  gameMasterId?: string;
  isCollapsed: boolean;
  isFocusMode: boolean;
  isGameMaster: boolean;
  onToggleCollapsed: () => void;
}>) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isReadingHistory, setIsReadingHistory] = useState(false);
  const [message, setMessage] = useState("");
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const isReadingHistoryRef = useRef(false);
  const previousMessagesCountRef = useRef(0);

  const chatMessagesQuery = useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getCampaignChatMessages(accessToken ?? "", campaignId),
    queryKey: ["campaign", campaignId, "chat-messages"],
    // Chat chega instantaneo pelo WebSocket; polling lento como fallback.
    refetchInterval: 12000,
    refetchIntervalInBackground: true,
  });

  const createMessageMutation = useMutation({
    mutationFn: (text: string) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return createCampaignChatMessage(accessToken, campaignId, {
        text,
        type: "message",
      });
    },
    onError: (error) => {
      showToast({
        title: "Mensagem nao enviada",
        description: getMutationErrorMessage(error),
        type: "error",
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
      setMessage("");
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return clearCampaignChatMessages(accessToken, campaignId);
    },
    onError: (error) => {
      showToast({
        title: "Chat nao limpo",
        description: getMutationErrorMessage(error),
        type: "error",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData<CampaignChatMessage[]>(
        ["campaign", campaignId, "chat-messages"],
        [],
      );
      showToast({
        title: "Chat limpo",
        description: "As mensagens da mesa foram removidas.",
        type: "success",
      });
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    createMessageMutation.mutate(trimmedMessage);
  }

  const messages = useMemo(
    () => chatMessagesQuery.data ?? [],
    [chatMessagesQuery.data],
  );
  const chatHeightClass = isFocusMode
    ? "h-full"
    : "h-[30rem] xl:h-full xl:min-h-0";

  function handleChatScroll() {
    const element = chatMessagesRef.current;

    if (!element) {
      return;
    }

    const nextIsReadingHistory =
      element.scrollHeight - element.scrollTop - element.clientHeight > 96;

    isReadingHistoryRef.current = nextIsReadingHistory;
    setIsReadingHistory(nextIsReadingHistory);
  }

  function scrollToLatest() {
    const element = chatMessagesRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      behavior: "smooth",
      top: element.scrollHeight,
    });
    isReadingHistoryRef.current = false;
    setIsReadingHistory(false);
  }

  useEffect(() => {
    const element = chatMessagesRef.current;

    if (!element || messages.length === 0) {
      previousMessagesCountRef.current = messages.length;
      return;
    }

    const isFirstLoad = previousMessagesCountRef.current === 0;
    const hasNewMessage = messages.length > previousMessagesCountRef.current;
    previousMessagesCountRef.current = messages.length;

    if (!isFirstLoad && (!hasNewMessage || isReadingHistoryRef.current)) {
      return;
    }

    requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
      isReadingHistoryRef.current = false;
    });
  }, [messages]);

  if (isCollapsed) {
    return (
      <motion.aside
        animate={{ opacity: 1 }}
        className={`relative ${chatHeightClass} w-full`}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        layout
        transition={{ duration: 0.22 }}
      >
        <motion.button
          animate={{ opacity: 1, x: 0 }}
          aria-label="Mostrar chat"
          className="absolute right-0 top-0 grid h-full w-[4.5rem] place-items-center rounded-3xl border border-rpg-border bg-rpg-surface text-rpg-muted shadow-sm transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
          initial={{ opacity: 0, x: 16 }}
          onClick={onToggleCollapsed}
          title="Mostrar chat"
          transition={{ duration: 0.2 }}
          type="button"
        >
          <span className="grid gap-3 justify-items-center">
            <MessageSquareIcon className="h-6 w-6" />
            <span className="[writing-mode:vertical-rl] text-xs font-black uppercase tracking-[0.16em]">
              Chat
            </span>
          </span>
        </motion.button>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className={`grid ${chatHeightClass} min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface shadow-sm`}
      exit={{ opacity: 0, x: 24 }}
      initial={{ opacity: 0, x: 24 }}
      layout
      transition={{ duration: 0.22 }}
    >
      <header className="border-b border-rpg-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rpg-primary-soft text-rpg-primary">
              <MessageSquareIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rpg-muted">
                Chat da mesa
              </p>
              <h2 className="truncate text-lg font-black tracking-normal text-rpg-text">
                Rolagens e mensagens
              </h2>
            </div>
          </div>
          <div className="relative shrink-0">
            <button
              aria-label="Abrir opcoes do chat"
              className="grid size-9 place-items-center rounded-lg border border-rpg-border text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary"
              onClick={() =>
                setIsActionsMenuOpen((currentValue) => !currentValue)
              }
              title="Opcoes do chat"
              type="button"
            >
              <MoreVerticalIcon className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {isActionsMenuOpen ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-30 grid w-44 gap-1 rounded-lg border border-rpg-border bg-rpg-surface p-1 shadow-xl"
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.16 }}
                >
                  {isGameMaster ? (
                    <button
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-black text-rpg-muted transition hover:bg-red-50 hover:text-rpg-danger disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        !messages.length || clearMessagesMutation.isPending
                      }
                      onClick={() => {
                        const shouldClear = window.confirm(
                          "Limpar todas as mensagens do chat?",
                        );

                        if (shouldClear) {
                          clearMessagesMutation.mutate();
                          setIsActionsMenuOpen(false);
                        }
                      }}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Limpar chat
                    </button>
                  ) : null}
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-black text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                    onClick={() => {
                      setIsActionsMenuOpen(false);
                      onToggleCollapsed();
                    }}
                    type="button"
                  >
                    <EyeOffIcon className="h-4 w-4" />
                    Ocultar chat
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div
        className="relative grid min-h-0 overflow-hidden bg-rpg-surface-muted"
      >
        <div
          className="grid min-h-0 content-start gap-3 overflow-y-auto p-4"
          onScroll={handleChatScroll}
          ref={chatMessagesRef}
        >
        {chatMessagesQuery.isLoading ? (
          <p className="rounded-lg border border-dashed border-rpg-border bg-rpg-surface px-3 py-3 text-sm font-bold text-rpg-muted">
            Carregando chat...
          </p>
        ) : null}

        {!chatMessagesQuery.isLoading && messages.length === 0 ? (
          <div className="grid place-items-center rounded-lg border border-dashed border-rpg-border bg-rpg-surface p-6 text-center">
            <MessageSquareIcon className="h-8 w-8 text-rpg-primary" />
            <p className="mt-3 text-sm font-bold text-rpg-muted">
              Nenhuma mensagem ainda.
            </p>
          </div>
        ) : null}

        {messages.map((chatMessage) => (
          <ChatMessageCard
            gameMasterId={gameMasterId}
            key={chatMessage.id}
            message={chatMessage}
          />
        ))}
        </div>

        <AnimatePresence>
          {isReadingHistory ? (
            <motion.button
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-rpg-primary px-3 py-2 text-xs font-black text-white shadow-xl shadow-rpg-primary/25"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              onClick={scrollToLatest}
              type="button"
            >
              Voltar ao mais recente
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <form
        className="grid grid-cols-[minmax(0,1fr)_2.75rem] gap-2 border-t border-rpg-border bg-rpg-surface p-3"
        onSubmit={handleSubmit}
      >
        <input
          className="min-w-0 rounded-lg border border-rpg-border bg-rpg-surface-muted px-3 py-2 text-sm font-bold text-rpg-text outline-none transition placeholder:text-rpg-muted/70 focus:border-rpg-primary focus:ring-2 focus:ring-rpg-primary/15"
          maxLength={500}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Mensagem"
          value={message}
        />
        <button
          aria-label="Enviar mensagem"
          className="grid aspect-square place-items-center rounded-lg bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!message.trim() || createMessageMutation.isPending}
          type="submit"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </motion.aside>
  );
}

function ChatMessageCard({
  gameMasterId,
  message,
}: Readonly<{ gameMasterId?: string; message: CampaignChatMessage }>) {
  const isRoll = message.type === "roll";
  const isGameMasterMessage = message.authorId === gameMasterId;
  const displayAvatarUrl = getCampaignAssetUrl(
    message.characterName ? message.characterAvatarUrl : message.authorAvatarUrl,
  );
  const rollTitle =
    isRoll && message.text !== message.rollFormula
      ? formatChatRollTitle(message.text)
      : "";

  return (
    <article
      className={`rounded-lg border bg-rpg-surface px-3 py-2 shadow-sm ${
        isGameMasterMessage
          ? "border-rpg-gold/50 bg-amber-50/70"
          : isRoll
            ? "border-rpg-primary/30"
            : "border-rpg-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-rpg-primary text-xs font-black text-white">
            {displayAvatarUrl ? (
              <img
                alt=""
                className="h-full w-full object-cover"
                src={displayAvatarUrl}
              />
            ) : (
              getCharacterInitials(message.characterName ?? message.authorName)
            )}
          </span>
          <div className="min-w-0">
            <p
              className={`flex min-w-0 items-center gap-1 truncate text-sm font-black ${
                isGameMasterMessage ? "text-amber-700" : "text-rpg-text"
              }`}
            >
              {isGameMasterMessage ? (
                <CrownIcon className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" />
              ) : null}
              <span className="truncate">
                {message.characterName ?? message.authorName}
              </span>
            </p>
            {message.characterName ? (
              <p className="truncate text-[0.7rem] font-bold text-rpg-muted">
                {message.authorName}
              </p>
            ) : null}
          </div>
        </div>
        {message.createdAt ? (
          <time className="shrink-0 text-[0.7rem] font-bold text-rpg-muted">
            {formatChatTime(message.createdAt)}
          </time>
        ) : null}
      </div>

      {isRoll ? (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-rpg-primary-soft px-3 py-2">
          <span className="min-w-0">
            {rollTitle ? (
              <span className="block truncate text-sm font-black text-rpg-text">
                {rollTitle}
              </span>
            ) : null}
            <span className="block truncate text-xs font-black uppercase tracking-[0.12em] text-rpg-primary">
              {message.rollFormula ?? message.text}
            </span>
          </span>
          <span className="text-xl font-black text-rpg-primary">
            {message.rollResult ?? message.text}
          </span>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-5 text-rpg-muted">
          {message.text}
        </p>
      )}
    </article>
  );
}

function formatChatRollTitle(title: string) {
  return title.replace(/[+*]+$/g, "").trim();
}

function updateTokenCache(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId: string,
  tokenId: string,
  tokenPatch: Partial<CampaignTableToken>,
) {
  queryClient.setQueryData<Campaign>(["campaign", campaignId], (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      tableTokens: (current.tableTokens ?? []).map((token) =>
        token.id === tokenId ? { ...token, ...tokenPatch } : token,
      ),
    };
  });
}

function MapCanvas({
  activeMap,
  canMoveTokens,
  canSetTokenStatus,
  charactersByEntityId,
  isFocusMode,
  isLoading,
  onMoveToken,
  onSetTokenStatus,
  onToggleTokenHidden,
  shouldSnapTokens,
  tokens,
}: Readonly<{
  activeMap: CampaignMap | null;
  canMoveTokens: boolean;
  canSetTokenStatus: boolean;
  charactersByEntityId: Map<string, CampaignCharacter>;
  isFocusMode: boolean;
  isLoading: boolean;
  onMoveToken: (tokenId: string, position: { x: number; y: number }) => void;
  onSetTokenStatus: (
    tokenId: string,
    status: CampaignTableTokenStatus,
  ) => void;
  onToggleTokenHidden: (tokenId: string, isHidden: boolean) => void;
  shouldSnapTokens: boolean;
  tokens: CampaignTableToken[];
}>) {
  const boardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [draggingToken, setDraggingToken] = useState<{
    offsetX: number;
    offsetY: number;
    tokenId: string;
    x: number;
    y: number;
  } | null>(null);
  const [statusMenuTokenId, setStatusMenuTokenId] = useState<string | null>(
    null,
  );
  const [imageMetrics, setImageMetrics] = useState<{
    height: number;
    left: number;
    naturalHeight: number;
    naturalWidth: number;
    scale: number;
    top: number;
    width: number;
  } | null>(null);

  const updateImageMetrics = useCallback(() => {
    const board = boardRef.current;
    const image = imageRef.current;

    if (!board || !image || image.naturalWidth === 0) {
      return;
    }

    const boardRect = board.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const scale = imageRect.width / image.naturalWidth;

    setImageMetrics({
      height: imageRect.height,
      left: imageRect.left - boardRect.left,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth,
      scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
      top: imageRect.top - boardRect.top,
      width: imageRect.width,
    });
  }, []);

  useEffect(() => {
    updateImageMetrics();
  }, [activeMap?.id, isFocusMode, updateImageMetrics]);

  useEffect(() => {
    window.addEventListener("resize", updateImageMetrics);
    document.addEventListener("fullscreenchange", updateImageMetrics);

    return () => {
      window.removeEventListener("resize", updateImageMetrics);
      document.removeEventListener("fullscreenchange", updateImageMetrics);
    };
  }, [updateImageMetrics]);

  useEffect(() => {
    const board = boardRef.current;
    const image = imageRef.current;

    if (!board || !image || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => updateImageMetrics());

    resizeObserver.observe(board);
    resizeObserver.observe(image);

    return () => resizeObserver.disconnect();
  }, [activeMap?.id, updateImageMetrics]);

  if (isLoading) {
    return (
      <div
        className={`grid place-items-center bg-rpg-surface-muted p-6 ${
          isFocusMode ? "h-full min-h-0" : "h-[30rem] xl:h-full"
        }`}
      >
        <p className="text-sm font-black text-rpg-muted">Carregando mesa...</p>
      </div>
    );
  }

  if (!activeMap) {
    return (
      <div
        className={`grid place-items-center bg-rpg-surface-muted p-6 ${
          isFocusMode ? "h-full min-h-0" : "h-[30rem] xl:h-full"
        }`}
      >
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
            <MapIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-black tracking-normal text-rpg-text">
            Nenhum mapa na mesa
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-rpg-muted">
            Cadastre mapas no hub da campanha e clique em um deles na lateral
            para exibir ou ocultar na mesa.
          </p>
        </div>
      </div>
    );
  }

  const grid = activeMap.grid ?? defaultGrid;
  const gridColor = hexToRgb(grid.color) ?? "124,58,237";
  const scaledTokenSize = imageMetrics
    ? getScaledTokenSize(grid, imageMetrics.scale)
    : tableTokenSize;

  function getConstrainedPosition(clientX: number, clientY: number) {
    const board = boardRef.current;

    if (!board) {
      return { x: 0, y: 0 };
    }

    const boardRect = board.getBoundingClientRect();
    const rawX = clientX - boardRect.left - (draggingToken?.offsetX ?? 0);
    const rawY = clientY - boardRect.top - (draggingToken?.offsetY ?? 0);
    const nextPosition = constrainTokenToBoard(
      { x: rawX, y: rawY },
      boardRect,
      imageMetrics,
      scaledTokenSize,
    );

    return shouldSnapTokens
      ? snapTokenToGrid(
          nextPosition,
          grid,
          boardRect,
          imageMetrics,
          scaledTokenSize,
        )
      : nextPosition;
  }

  function handleTokenPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    token: CampaignTableToken,
  ) {
    if (!canMoveTokens) {
      return;
    }

    const board = boardRef.current;

    if (!board) {
      return;
    }

    const boardRect = board.getBoundingClientRect();
    const tokenPosition = getTokenBoardPosition(token);

    event.currentTarget.setPointerCapture(event.pointerId);
    setStatusMenuTokenId(null);
    setDraggingToken({
      offsetX: event.clientX - boardRect.left - tokenPosition.x,
      offsetY: event.clientY - boardRect.top - tokenPosition.y,
      tokenId: token.id,
      x: tokenPosition.x,
      y: tokenPosition.y,
    });
  }

  function handleTokenPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!canMoveTokens || !draggingToken) {
      return;
    }

    setDraggingToken({
      ...draggingToken,
      ...getConstrainedPosition(event.clientX, event.clientY),
    });
  }

  function handleTokenPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (!canMoveTokens || !draggingToken) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    const mapPosition = boardPositionToMapPosition(
      { x: draggingToken.x, y: draggingToken.y },
      imageMetrics,
      scaledTokenSize,
    );

    onMoveToken(draggingToken.tokenId, mapPosition);
    setDraggingToken(null);
  }

  function getTokenBoardPosition(token: CampaignTableToken) {
    const position = draggingToken?.tokenId === token.id
      ? { x: draggingToken.x, y: draggingToken.y }
      : mapPositionToBoardPosition(
          { x: token.x, y: token.y },
          imageMetrics,
          scaledTokenSize,
        );

    if (!shouldSnapTokens || !imageMetrics || draggingToken?.tokenId === token.id) {
      return position;
    }

    return snapTokenToGrid(
      position,
      grid,
      imageMetrics,
      imageMetrics,
      scaledTokenSize,
    );
  }

  function handleTokenDoubleClick(tokenId: string) {
    if (!canSetTokenStatus) {
      return;
    }

    setStatusMenuTokenId((currentTokenId) =>
      currentTokenId === tokenId ? null : tokenId,
    );
  }

  return (
    <div
      className={`relative overflow-auto bg-slate-100 p-5 ${
        isFocusMode ? "h-full min-h-0" : "h-[30rem] xl:h-full xl:min-h-0"
      }`}
    >
      <div
        className="relative mx-auto grid h-full min-h-0 w-full place-items-center overflow-hidden rounded-2xl border border-rpg-border bg-slate-50 shadow-inner"
        ref={boardRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={activeMap.name}
          className="max-h-full max-w-full select-none object-contain"
          draggable={false}
          onLoad={updateImageMetrics}
          ref={imageRef}
          src={getCampaignAssetUrl(activeMap.imageUrl)}
        />
        {grid.show && imageMetrics ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              backgroundImage: `linear-gradient(rgba(${gridColor}, ${grid.opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(${gridColor}, ${grid.opacity}) 1px, transparent 1px)`,
              backgroundPosition: `${grid.offsetX * imageMetrics.scale}px ${grid.offsetY * imageMetrics.scale}px`,
              backgroundSize: `${grid.size * imageMetrics.scale}px ${grid.size * imageMetrics.scale}px`,
              height: imageMetrics.height,
              left: imageMetrics.left,
              top: imageMetrics.top,
              width: imageMetrics.width,
            }}
          />
        ) : null}
        {tokens.map((token) => {
          const character = charactersByEntityId.get(token.characterEntityId);
          const tokenName = character?.name ?? token.characterName;
          const tokenAvatarUrl = character?.avatarUrl ?? token.characterAvatarUrl;
          const position = getTokenBoardPosition(token);
          const tokenStatus = token.status ?? "normal";
          const statusStyle = getTokenStatusStyle(tokenStatus);
          const isStatusMenuOpen = statusMenuTokenId === token.id;
          const isHidden = Boolean(token.isHidden);

          return (
            <div
              className="absolute z-20"
              key={token.id}
              style={{
                left: position.x,
                top: position.y,
              }}
            >
              <button
                aria-label={`Mover token ${tokenName ?? "sem ficha"}`}
                className={`relative grid place-items-center rounded-full border-2 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition focus:outline-none focus:ring-4 focus:ring-rpg-primary/20 ${statusStyle.ring} ${statusStyle.background} ${
                  canMoveTokens
                    ? "cursor-grab hover:scale-105"
                    : "cursor-default"
                } ${isHidden ? "opacity-45 grayscale" : ""}`}
                onDoubleClick={() => handleTokenDoubleClick(token.id)}
                onPointerDown={(event) => handleTokenPointerDown(event, token)}
                onPointerMove={handleTokenPointerMove}
                onPointerUp={handleTokenPointerUp}
                style={{
                  height: scaledTokenSize,
                  touchAction: "none",
                  width: scaledTokenSize,
                }}
                title={
                  isHidden
                    ? `${tokenName ?? "Token"} (oculto dos jogadores)`
                    : (tokenName ?? "Token sem ficha")
                }
                type="button"
              >
                {tokenAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className={`h-full w-full rounded-full object-cover ${statusStyle.image}`}
                    draggable={false}
                    src={getCampaignAssetUrl(tokenAvatarUrl)}
                  />
                ) : (
                  getCharacterInitials(tokenName)
                )}
                {isHidden ? (
                  <span className="absolute -left-1 -top-1 grid size-5 place-items-center rounded-full border border-white bg-slate-900 text-white shadow-sm">
                    <EyeOffIcon className="h-3 w-3" />
                  </span>
                ) : null}
                {tokenStatus !== "normal" ? (
                  <span
                    className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border border-white text-white shadow-sm ${statusStyle.badge}`}
                    style={{
                      height: Math.max(16, scaledTokenSize * 0.42),
                      width: Math.max(16, scaledTokenSize * 0.42),
                    }}
                  >
                    {getTokenStatusIcon(tokenStatus)}
                  </span>
                ) : null}
              </button>

              {isStatusMenuOpen && canSetTokenStatus ? (
                <div className="absolute left-1/2 top-[calc(100%+0.5rem)] z-30 w-44 -translate-x-1/2 overflow-hidden rounded-lg border border-rpg-border bg-white p-1 shadow-xl">
                  {tokenStatusOptions.map((option) => (
                    <button
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-black transition ${
                        option.status === tokenStatus
                          ? "bg-rpg-primary-soft text-rpg-primary"
                          : "text-rpg-muted hover:bg-rpg-surface-muted hover:text-rpg-text"
                      }`}
                      key={option.status}
                      onClick={() => {
                        onSetTokenStatus(token.id, option.status);
                        setStatusMenuTokenId(null);
                      }}
                      type="button"
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                  <div className="my-1 border-t border-rpg-border" />
                  <button
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-black transition ${
                      isHidden
                        ? "bg-rpg-primary-soft text-rpg-primary"
                        : "text-rpg-muted hover:bg-rpg-surface-muted hover:text-rpg-text"
                    }`}
                    onClick={() => {
                      onToggleTokenHidden(token.id, !isHidden);
                      setStatusMenuTokenId(null);
                    }}
                    type="button"
                  >
                    {isHidden ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" />
                    )}
                    {isHidden ? "Revelar aos jogadores" : "Ocultar dos jogadores"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MapList({
  activeMapId,
  campaignId,
  editingGridMapId,
  gridControlsMap,
  isGridControlsDirty,
  isSavingGridControls,
  maps,
  onChangeGridControls,
  onCloseGridControls,
  onSaveGridControls,
  onToggle,
  onToggleGridControls,
}: Readonly<{
  activeMapId?: string;
  campaignId: string;
  editingGridMapId: string | null;
  gridControlsMap: CampaignMap | null;
  isGridControlsDirty: boolean;
  isSavingGridControls: boolean;
  maps: CampaignMap[];
  onChangeGridControls: (map: CampaignMap) => void;
  onCloseGridControls: () => void;
  onSaveGridControls: (map: CampaignMap) => void;
  onToggle: (mapId: string) => void;
  onToggleGridControls: (mapId: string) => void;
}>) {
  return (
    <div className="grid gap-2">
      {maps.length ? (
        maps.map((map) => {
          const isActive = map.id === activeMapId;
          const isEditingGrid = map.id === editingGridMapId;

          return (
            <div className="grid gap-2" key={map.id}>
              <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2">
                <button
                  className={`grid min-h-14 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-xl border p-1.5 pr-3 text-left transition hover:border-rpg-primary ${
                    isActive
                      ? "border-rpg-primary bg-white shadow-sm shadow-rpg-primary/10"
                      : "border-rpg-border bg-white"
                  }`}
                  onClick={() => onToggle(map.id)}
                  type="button"
                >
                  <span className="grid aspect-square place-items-center overflow-hidden rounded-lg bg-rpg-surface-muted ring-1 ring-rpg-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={getCampaignAssetUrl(map.imageUrl)}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-rpg-text">
                      {map.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs font-bold ${
                        isActive ? "text-rpg-primary" : "text-rpg-muted"
                      }`}
                    >
                      {isActive ? "Em exibicao" : "Clique para exibir"}
                    </span>
                  </span>
                </button>
                <button
                  aria-label={`Configurar mapa ${map.name}`}
                  className={`grid aspect-square place-items-center rounded-xl border text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary ${
                    isEditingGrid
                      ? "border-rpg-primary bg-rpg-primary-soft text-rpg-primary"
                      : "border-rpg-border bg-white"
                  }`}
                  onClick={() => onToggleGridControls(map.id)}
                  title="Configurar mapa"
                  type="button"
                >
                  <SettingsIcon className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {isEditingGrid && gridControlsMap ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    initial={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <GridControls
                      isDirty={isGridControlsDirty}
                      isSaving={isSavingGridControls}
                      map={gridControlsMap}
                      onChange={onChangeGridControls}
                      onClose={onCloseGridControls}
                      onSave={onSaveGridControls}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })
      ) : (
        <div className="grid gap-3 rounded-lg border border-dashed border-rpg-border px-3 py-4">
          <p className="text-sm font-bold text-rpg-muted">
            Nenhum mapa adicionado.
          </p>
          <Link
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-rpg-primary px-3 py-2 text-sm font-black text-rpg-primary transition hover:bg-rpg-primary-soft"
            href={`/campaigns/${campaignId}`}
          >
            Cadastrar mapa
          </Link>
        </div>
      )}
    </div>
  );
}

function TablePlayersPanel({
  campaignId,
  characters,
  isCreatingToken,
  isGameMaster,
  isLoading,
  onCreateToken,
  onDeleteToken,
  onSnapChange,
  snapTokensToGrid,
  tokens,
}: Readonly<{
  campaignId: string;
  characters: CampaignCharacter[];
  isCreatingToken: boolean;
  isGameMaster?: boolean;
  isLoading: boolean;
  onCreateToken: (characterEntityId: string) => void;
  onDeleteToken: (tokenId: string) => void;
  onSnapChange: (shouldSnap: boolean) => void;
  snapTokensToGrid: boolean;
  tokens: CampaignTableToken[];
}>) {
  const tokensByCharacterId = new Map(
    tokens.map((token) => [token.characterEntityId, token]),
  );
  const visibleCharacters = isGameMaster
    ? characters
    : characters.filter((character) =>
        tokensByCharacterId.has(character.entityId),
      );

  function handleToggleToken(character: CampaignCharacter) {
    const token = tokensByCharacterId.get(character.entityId);

    if (token) {
      onDeleteToken(token.id);
      return;
    }

    onCreateToken(character.entityId);
  }

  const emptyMessage = isGameMaster
    ? "Nenhuma ficha criada ainda."
    : "Nenhum token ativo na mesa.";

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-rpg-border bg-white p-3">
        <Switch
          className="w-full"
          isSelected={snapTokensToGrid}
          onChange={onSnapChange}
          size="sm"
        >
          {({ isSelected }) => (
            <Switch.Content className="flex w-full items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-sm font-black text-rpg-text">
                  Fixar tokens no grid
                </span>
                <span className="mt-0.5 block text-xs font-bold text-rpg-muted">
                  {isSelected ? "Movimento alinhado" : "Movimento livre"}
                </span>
              </span>
              <span
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                  isSelected ? "bg-rpg-primary" : "bg-rpg-border"
                }`}
              >
                <span
                  className={`block size-4 rounded-full bg-white shadow-sm transition ${
                    isSelected ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </Switch.Content>
          )}
        </Switch>
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-dashed border-rpg-border bg-rpg-surface px-3 py-3 text-sm font-bold text-rpg-muted">
          Carregando fichas...
        </p>
      ) : null}

      {!isLoading && visibleCharacters.length ? (
        <div className="grid gap-2">
          {visibleCharacters.map((character) => {
            const token = tokensByCharacterId.get(character.entityId);
            const isActive = Boolean(token);

            return (
              <div
                className={`grid grid-cols-[2.75rem_minmax(0,1fr)_2.25rem_auto] items-center gap-3 rounded-xl border p-1.5 pr-2 ${
                  isActive
                    ? "border-rpg-primary bg-white shadow-sm shadow-rpg-primary/10"
                    : "border-rpg-border bg-white"
                }`}
                key={character.entityId}
              >
                <TokenAvatar character={character} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-rpg-text">
                    {character.name}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs font-bold ${
                      isActive ? "text-rpg-primary" : "text-rpg-muted"
                    }`}
                  >
                    {isActive ? "Token na mesa" : "Token oculto"}
                  </span>
                </span>
                <Link
                  aria-label={`Abrir ficha de ${character.name}`}
                  className="grid aspect-square place-items-center rounded-md text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-primary"
                  href={`/campaigns/${campaignId}/characters/${character.entityId}`}
                  title="Abrir ficha"
                >
                  <FileTextIcon className="h-4 w-4" />
                </Link>
                {isGameMaster ? (
                  <Button
                    className={`rounded-lg px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "bg-rpg-primary text-white hover:bg-rpg-primary-hover"
                        : "border border-rpg-border bg-rpg-surface-muted text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
                    }`}
                    isDisabled={isCreatingToken}
                    onPress={() => handleToggleToken(character)}
                    variant="secondary"
                  >
                    {isActive ? "Ativo" : "Ativar"}
                  </Button>
                ) : (
                  <span className="rounded-lg bg-rpg-primary px-3 py-2 text-center text-xs font-black text-white">
                    Ativo
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {!isLoading && visibleCharacters.length === 0 ? (
        <p className="rounded-lg border border-dashed border-rpg-border bg-rpg-surface px-3 py-3 text-sm font-bold text-rpg-muted">
          {emptyMessage}
        </p>
      ) : null}
    </div>
  );
}

function TokenAvatar({
  character,
}: Readonly<{ character?: CampaignCharacter }>) {
  return (
    <span className="grid aspect-square place-items-center overflow-hidden rounded-md bg-rpg-primary text-xs font-black text-white">
      {character?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full object-cover"
          src={getCampaignAssetUrl(character.avatarUrl)}
        />
      ) : (
        getCharacterInitials(character?.name)
      )}
    </span>
  );
}

function TableSoundsPanel({
  accessToken,
  campaignId,
  sounds,
}: Readonly<{
  accessToken?: string | null;
  campaignId: string;
  sounds: CampaignSound[];
}>) {
  if (sounds.length === 0) {
    return (
      <div className="grid place-items-center rounded-lg border border-dashed border-rpg-border bg-rpg-surface p-6 text-center">
        <Volume2Icon className="h-8 w-8 text-rpg-primary" />
        <p className="mt-3 text-sm font-bold text-rpg-muted">
          Nenhum som cadastrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {sounds.map((sound) => (
        <TableSoundPlayer
          accessToken={accessToken}
          campaignId={campaignId}
          key={sound.id}
          sound={sound}
        />
      ))}
    </div>
  );
}

function TableSoundPlayer({
  accessToken,
  campaignId,
  sound,
}: Readonly<{
  accessToken?: string | null;
  campaignId: string;
  sound: CampaignSound;
}>) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const isPlaying = Boolean(sound.isPlaying);
  const isLooping = Boolean(sound.isLooping);
  const savedVolume = sound.volume ?? 80;
  const audioUrl = getCampaignAssetUrl(sound.audioUrl);
  const [draftVolumeState, setDraftVolumeState] = useState<{
    soundId: string;
    value: number;
  }>({ soundId: sound.id, value: savedVolume });
  const [durationState, setDurationState] = useState<{
    soundId: string;
    value: number;
  }>({ soundId: sound.id, value: 0 });
  const [timelineNow, setTimelineNow] = useState(() => Date.now());
  const pendingVolumeRef = useRef<number | null>(null);
  const duration =
    durationState.soundId === sound.id ? durationState.value : 0;
  const draftVolume =
    draftVolumeState.soundId === sound.id ? draftVolumeState.value : savedVolume;
  const updateSoundMutation = useMutation({
    mutationFn: (payload: {
      isLooping?: boolean;
      isPlaying?: boolean;
      playbackPosition?: number;
      volume?: number;
    }) => {
      if (!accessToken) {
        throw new Error("Sessao indisponivel.");
      }

      return updateCampaignSound(accessToken, campaignId, sound.id, payload);
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
    },
  });

  useEffect(() => {
    if (pendingVolumeRef.current === null) {
      return;
    }

    const nextVolume = pendingVolumeRef.current;
    const timeoutId = window.setTimeout(() => {
      updateSoundMutation.mutate({ volume: nextVolume });
      pendingVolumeRef.current = null;
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [draftVolume, updateSoundMutation]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimelineNow(Date.now());
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [isPlaying]);

  function handleVolumeChange(nextVolume: number) {
    const constrainedVolume = clampNumber(nextVolume, 0, 100);

    setDraftVolumeState({ soundId: sound.id, value: constrainedVolume });
    pendingVolumeRef.current = constrainedVolume;
  }

  function handleVolumeWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    handleVolumeChange(draftVolume + (event.deltaY > 0 ? -5 : 5));
  }

  function handleTogglePlayback() {
    updateSoundMutation.mutate({
      isPlaying: !isPlaying,
      playbackPosition: elapsedSeconds,
    });
  }

  function handleStopSound() {
    updateSoundMutation.mutate({
      isPlaying: false,
      playbackPosition: 0,
    });
  }

  function handleSeek(nextPosition: number) {
    updateSoundMutation.mutate({
      isPlaying,
      playbackPosition: clampNumber(nextPosition, 0, duration || nextPosition),
    });
  }

  const VolumeIcon =
    draftVolume === 0 ? VolumeXIcon : draftVolume < 50 ? Volume1Icon : Volume2Icon;
  const elapsedSeconds = getSoundElapsedSeconds({
    duration,
    isLooping,
    isPlaying,
    now: timelineNow,
    playbackPosition: sound.playbackPosition ?? 0,
    startedAt: sound.lastStartedAt,
  });

  return (
    <div className="grid gap-3 rounded-xl border border-rpg-border bg-white p-3 shadow-sm">
      <audio
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;

          if (Number.isFinite(nextDuration)) {
            setDurationState({ soundId: sound.id, value: nextDuration });
          }
        }}
        preload="metadata"
        src={audioUrl}
      />
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3">
        <span className="grid aspect-square place-items-center rounded-lg bg-rpg-primary-soft text-rpg-primary">
          {sound.type === "music" ? (
            <MusicIcon className="h-4 w-4" />
          ) : (
            <Volume2Icon className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-rpg-text">
            {sound.name}
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-rpg-muted">
            {sound.type === "music" ? "Musica" : "Efeito"}
          </span>
        </span>

        <div className="group relative" onWheel={handleVolumeWheel}>
          <Button
            aria-label={`Volume de ${sound.name}: ${draftVolume}%`}
            className="grid size-9 min-w-0 place-items-center rounded-lg border border-rpg-border text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary focus:border-rpg-primary focus:text-rpg-primary focus:outline-none"
            isIconOnly
            onPress={() => handleVolumeChange(draftVolume === 0 ? 80 : 0)}
            variant="secondary"
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
          <div className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] right-0 z-20 w-40 rounded-xl border border-rpg-border bg-rpg-surface p-3 opacity-0 shadow-xl shadow-rpg-text/10 transition hover:pointer-events-auto hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <Slider
              aria-label={`Volume de ${sound.name}`}
              maxValue={100}
              minValue={0}
              onChange={(value) => handleVolumeChange(getSliderNumber(value))}
              step={5}
              value={draftVolume}
            >
              <Slider.Track className="relative h-1.5 rounded-full bg-rpg-primary-soft">
                <Slider.Fill className="absolute h-full rounded-full bg-rpg-primary" />
                <Slider.Thumb className="top-1/2 size-4 rounded-full border-2 border-white bg-rpg-primary shadow-md" />
              </Slider.Track>
            </Slider>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex items-center gap-2">
        <Button
          aria-label={`${isPlaying ? "Pausar" : "Tocar"} ${sound.name}`}
          className={`grid size-9 min-w-0 place-items-center rounded-lg transition ${
            isPlaying
              ? "bg-rpg-primary text-white"
              : "border border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
          }`}
          isDisabled={updateSoundMutation.isPending}
          isIconOnly
          onPress={handleTogglePlayback}
          variant="secondary"
        >
          {isPlaying ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
        </Button>
        <Button
          aria-label={`Parar ${sound.name}`}
          className="grid size-9 min-w-0 place-items-center rounded-lg border border-rpg-border text-rpg-muted transition hover:border-rpg-danger hover:text-rpg-danger"
          isDisabled={updateSoundMutation.isPending}
          isIconOnly
          onPress={handleStopSound}
          variant="secondary"
        >
          <SquareIcon className="h-3 w-3 fill-current" />
        </Button>
        <Button
          aria-label={`${isLooping ? "Desligar repeticao" : "Ligar repeticao"} de ${sound.name}`}
          className={`grid size-9 min-w-0 place-items-center rounded-lg transition ${
            isLooping
              ? "bg-rpg-primary-soft text-rpg-primary ring-1 ring-rpg-primary/40"
              : "border border-rpg-border text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
          }`}
          isDisabled={updateSoundMutation.isPending}
          isIconOnly
          onPress={() => updateSoundMutation.mutate({ isLooping: !isLooping })}
          variant="secondary"
        >
          <Repeat2Icon className="h-4 w-4" />
        </Button>
        </div>

        <div className="grid min-w-0 gap-1">
          <Slider
            aria-label={`Linha do tempo de ${sound.name}`}
            maxValue={duration || Math.max(1, elapsedSeconds)}
            minValue={0}
            onChange={(value) => handleSeek(getSliderNumber(value))}
            step={1}
            value={duration > 0 ? elapsedSeconds : 0}
          >
            <Slider.Track className="relative h-1.5 rounded-full bg-rpg-primary-soft">
              <Slider.Fill className="absolute h-full rounded-full bg-rpg-primary" />
              <Slider.Thumb className="top-1/2 size-4 rounded-full border-2 border-white bg-rpg-primary shadow-md" />
            </Slider.Track>
          </Slider>
          <div className="flex items-center justify-between text-[0.68rem] font-black text-rpg-muted">
            <span>{formatDuration(elapsedSeconds)}</span>
            <span>{duration > 0 ? formatDuration(duration) : "--:--"}</span>
          </div>
        </div>

        <span className="rounded-lg bg-rpg-surface-muted px-2.5 py-2 text-right text-xs font-black text-rpg-muted">
          {draftVolume}%
        </span>
      </div>
    </div>
  );
}

function TableSharedAudio({ sounds }: Readonly<{ sounds: CampaignSound[] }>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showToast } = useToast();
  const [isAudioBlocked, setIsAudioBlocked] = useState(false);
  const playingSound = useMemo(
    () =>
      sounds
        .filter((sound) => sound.isPlaying)
        .sort((firstSound, secondSound) =>
          (secondSound.lastStartedAt ?? "").localeCompare(
            firstSound.lastStartedAt ?? "",
          ),
        )[0],
    [sounds],
  );
  const audioUrl = getCampaignAssetUrl(playingSound?.audioUrl);
  const playingSoundLastStartedAt = playingSound?.lastStartedAt ?? "";
  const playbackKey = `${playingSound?.id ?? ""}:${playingSoundLastStartedAt}`;
  const volume = (playingSound?.volume ?? 80) / 100;
  const isLooping = Boolean(playingSound?.isLooping);
  const playbackPosition = playingSound?.playbackPosition ?? 0;

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.loop = isLooping;
  }, [isLooping]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!playbackKey || playbackKey === ":" || !audioUrl) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
    }

    const startedAtTimestamp = playingSoundLastStartedAt
      ? new Date(playingSoundLastStartedAt).getTime()
      : Number.NaN;
    const synchronizedPosition = Number.isFinite(startedAtTimestamp)
      ? Math.max(0, (Date.now() - startedAtTimestamp) / 1000)
      : playbackPosition;

    if (Math.abs(audio.currentTime - synchronizedPosition) > 1) {
      try {
        audio.currentTime = synchronizedPosition;
      } catch {
        audio.currentTime = 0;
      }
    }

    void audio.play().then(
      () => setIsAudioBlocked(false),
      () => {
        setIsAudioBlocked(true);
        showToast({
          title: "Audio bloqueado pelo navegador",
          description: "Clique em Ativar audio para ouvir a mesa.",
          type: "error",
        });
      },
    );
  }, [audioUrl, playbackKey, playbackPosition, playingSoundLastStartedAt, showToast]);

  function handleEnableAudio() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    void audio.play().then(() => setIsAudioBlocked(false));
  }

  return (
    <>
      <audio ref={audioRef} />
      <AnimatePresence>
        {isAudioBlocked && playingSound ? (
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-rpg-primary px-4 py-2 text-sm font-black text-white shadow-xl shadow-rpg-primary/25"
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
            onClick={handleEnableAudio}
            type="button"
          >
            Ativar audio da mesa
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function GridControls({
  isDirty,
  isSaving,
  map,
  onChange,
  onClose,
  onSave,
}: Readonly<{
  isDirty: boolean;
  isSaving: boolean;
  map: CampaignMap;
  onChange: (map: CampaignMap) => void;
  onClose: () => void;
  onSave: (map: CampaignMap) => void;
}>) {
  const [gridInputValues, setGridInputValues] = useState({
    offsetX: String(map.grid.offsetX),
    offsetY: String(map.grid.offsetY),
    opacity: String(map.grid.opacity),
    size: String(map.grid.size),
  });

  function updateDraft(nextMap: Partial<CampaignMap>) {
    onChange({ ...map, ...nextMap });
  }

  function updateGrid(nextGrid: Partial<CampaignMap["grid"]>) {
    onChange({
      ...map,
      grid: {
        ...map.grid,
        ...nextGrid,
      },
    });
  }

  function updateGridNumber(
    field: "offsetX" | "offsetY" | "opacity" | "size",
    value: number,
  ) {
    setGridInputValues((current) => ({
      ...current,
      [field]: String(value),
    }));
    updateGrid({ [field]: value });
  }

  function updateGridNumberInput(
    field: "offsetX" | "offsetY" | "opacity" | "size",
    value: string,
    min: number,
    max: number,
  ) {
    setGridInputValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (value === "" || value === "-" || value === "." || value === "-.") {
      return;
    }

    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue)) {
      return;
    }

    updateGrid({ [field]: clampNumber(parsedValue, min, max) });
  }

  function normalizeGridNumberInput(
    field: "offsetX" | "offsetY" | "opacity" | "size",
    value: number,
  ) {
    setGridInputValues((current) => ({
      ...current,
      [field]: String(value),
    }));
  }

  return (
    <section className="grid max-h-[28rem] gap-4 overflow-y-auto rounded-xl border border-rpg-border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Grid3X3Icon className="h-4 w-4 shrink-0 text-rpg-primary" />
          <h2 className="truncate text-sm font-black uppercase tracking-[0.14em] text-rpg-muted">
            Grid do mapa
          </h2>
        </div>
        <button
          aria-label="Fechar configuracao do mapa"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text"
          onClick={onClose}
          type="button"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <input
        className="rounded-lg border border-rpg-border bg-rpg-surface-muted px-3 py-2 text-sm font-bold text-rpg-text outline-none focus:border-rpg-primary focus:ring-2 focus:ring-rpg-primary/15"
        onChange={(event) => updateDraft({ name: event.target.value })}
        value={map.name}
      />

      <label className="flex items-center gap-2 text-sm font-bold text-rpg-muted">
        <input
          checked={map.hasEmbeddedGrid}
          className="size-4 accent-rpg-primary"
          onChange={(event) =>
            updateDraft({ hasEmbeddedGrid: event.target.checked })
          }
          type="checkbox"
        />
        A imagem ja tem grid
      </label>

      <button
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rpg-border bg-rpg-surface-muted px-3 py-2 text-sm font-black text-rpg-muted transition hover:border-rpg-primary hover:text-rpg-primary"
        onClick={() => updateGrid({ show: !map.grid.show })}
        type="button"
      >
        {map.grid.show ? (
          <EyeIcon className="h-4 w-4" />
        ) : (
          <EyeOffIcon className="h-4 w-4" />
        )}
        {map.grid.show ? "Grid visivel" : "Grid oculto"}
      </button>

      <GridRangeControl
        inputValue={gridInputValues.size}
        label="Tamanho"
        max={160}
        min={16}
        onBlur={() => normalizeGridNumberInput("size", map.grid.size)}
        onChange={(value) => updateGridNumber("size", value)}
        onInputChange={(value) =>
          updateGridNumberInput("size", value, 16, 160)
        }
        step={1}
        suffix="px"
        value={map.grid.size}
      />
      <GridRangeControl
        inputValue={gridInputValues.offsetX}
        label="Offset X"
        max={160}
        min={-160}
        onBlur={() => normalizeGridNumberInput("offsetX", map.grid.offsetX)}
        onChange={(value) => updateGridNumber("offsetX", value)}
        onInputChange={(value) =>
          updateGridNumberInput("offsetX", value, -160, 160)
        }
        step={1}
        suffix="px"
        value={map.grid.offsetX}
      />
      <GridRangeControl
        inputValue={gridInputValues.offsetY}
        label="Offset Y"
        max={160}
        min={-160}
        onBlur={() => normalizeGridNumberInput("offsetY", map.grid.offsetY)}
        onChange={(value) => updateGridNumber("offsetY", value)}
        onInputChange={(value) =>
          updateGridNumberInput("offsetY", value, -160, 160)
        }
        step={1}
        suffix="px"
        value={map.grid.offsetY}
      />
      <GridRangeControl
        inputValue={gridInputValues.opacity}
        label="Opacidade"
        max={1}
        min={0.05}
        onBlur={() => normalizeGridNumberInput("opacity", map.grid.opacity)}
        onChange={(value) => updateGridNumber("opacity", value)}
        onInputChange={(value) =>
          updateGridNumberInput("opacity", value, 0.05, 1)
        }
        step={0.05}
        value={map.grid.opacity}
      />

      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-rpg-muted">
        Cor
        <input
          className="h-10 w-full rounded-lg border border-rpg-border bg-rpg-surface-muted p-1"
          onChange={(event) => updateGrid({ color: event.target.value })}
          type="color"
          value={map.grid.color}
        />
      </label>

      <button
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving || !isDirty}
        onClick={() => onSave(map)}
        type="button"
      >
        <SaveIcon className="h-4 w-4" />
        {isDirty ? "Salvar grid" : "Grid salvo"}
      </button>
    </section>
  );
}

function GridRangeControl({
  inputValue,
  label,
  max,
  min,
  onBlur,
  onChange,
  onInputChange,
  step,
  suffix,
  value,
}: Readonly<{
  inputValue: string;
  label: string;
  max: number;
  min: number;
  onBlur: () => void;
  onChange: (value: number) => void;
  onInputChange: (value: string) => void;
  step: number;
  suffix?: string;
  value: number;
}>) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-rpg-muted">
      <span className="flex items-center justify-between">
        {label}
        <span className="text-rpg-text">
          {value}
          {suffix}
        </span>
      </span>
      <span className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3">
        <input
          className="accent-rpg-primary"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="range"
          value={value}
        />
        <span className="flex items-center gap-1 rounded-lg border border-rpg-border bg-rpg-surface-muted px-2 py-1.5">
          <input
            className="min-w-0 flex-1 bg-transparent text-right text-sm font-black text-rpg-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            inputMode="decimal"
            max={max}
            min={min}
            onBlur={onBlur}
            onChange={(event) => onInputChange(event.target.value)}
            step={step}
            type="text"
            value={inputValue}
          />
          {suffix ? (
            <span className="text-[0.65rem] font-black text-rpg-muted">
              {suffix}
            </span>
          ) : null}
        </span>
      </span>
    </label>
  );
}

function areMapSettingsEqual(firstMap: CampaignMap, secondMap: CampaignMap) {
  return (
    firstMap.name === secondMap.name &&
    firstMap.hasEmbeddedGrid === secondMap.hasEmbeddedGrid &&
    firstMap.grid.color === secondMap.grid.color &&
    firstMap.grid.offsetX === secondMap.grid.offsetX &&
    firstMap.grid.offsetY === secondMap.grid.offsetY &&
    firstMap.grid.opacity === secondMap.grid.opacity &&
    firstMap.grid.show === secondMap.grid.show &&
    firstMap.grid.size === secondMap.grid.size
  );
}

function formatChatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getTokenStatusStyle(status: CampaignTableTokenStatus) {
  const styles: Record<
    CampaignTableTokenStatus,
    {
      background: string;
      badge: string;
      image: string;
      ring: string;
    }
  > = {
    dead: {
      background: "bg-slate-950",
      badge: "bg-slate-950",
      image: "grayscale opacity-70",
      ring: "border-slate-950",
    },
    dying: {
      background: "bg-rpg-danger",
      badge: "bg-rpg-danger",
      image: "brightness-75 saturate-150",
      ring: "border-rpg-danger",
    },
    injured: {
      background: "bg-amber-500",
      badge: "bg-amber-500",
      image: "saturate-125",
      ring: "border-amber-500",
    },
    normal: {
      background: "bg-rpg-primary",
      badge: "bg-rpg-primary",
      image: "",
      ring: "border-white",
    },
    unconscious: {
      background: "bg-slate-500",
      badge: "bg-slate-500",
      image: "grayscale",
      ring: "border-slate-500",
    },
  };

  return styles[status];
}

function getTokenStatusIcon(status: CampaignTableTokenStatus) {
  const icons: Record<CampaignTableTokenStatus, ReactNode> = {
    dead: <SkullIcon className="h-3 w-3" />,
    dying: <AlertTriangleIcon className="h-3 w-3" />,
    injured: <HeartCrackIcon className="h-3 w-3" />,
    normal: <CircleIcon className="h-3 w-3" />,
    unconscious: <ShieldAlertIcon className="h-3 w-3" />,
  };

  return icons[status];
}

function snapTokenToGrid(
  position: { x: number; y: number },
  grid: CampaignMapGrid,
  boardRect: { height: number; width: number },
  imageMetrics: {
    height: number;
    left: number;
    naturalHeight: number;
    naturalWidth: number;
    scale: number;
    top: number;
    width: number;
  } | null,
  tokenSize: number,
) {
  const tokenCenterX = position.x + tokenSize / 2;
  const tokenCenterY = position.y + tokenSize / 2;
  const gridScale = imageMetrics?.scale ?? 1;
  const gridOffsetX = (imageMetrics?.left ?? 0) + grid.offsetX * gridScale;
  const gridOffsetY = (imageMetrics?.top ?? 0) + grid.offsetY * gridScale;
  const gridSize = grid.size * gridScale;
  const gridCellX = Math.floor((tokenCenterX - gridOffsetX) / gridSize);
  const gridCellY = Math.floor((tokenCenterY - gridOffsetY) / gridSize);
  const snappedX =
    gridOffsetX + gridCellX * gridSize + gridSize / 2 - tokenSize / 2;
  const snappedY =
    gridOffsetY + gridCellY * gridSize + gridSize / 2 - tokenSize / 2;
  const minX = imageMetrics?.left ?? 0;
  const minY = imageMetrics?.top ?? 0;
  const maxX = imageMetrics
    ? imageMetrics.left + imageMetrics.width - tokenSize
    : boardRect.width - tokenSize;
  const maxY = imageMetrics
    ? imageMetrics.top + imageMetrics.height - tokenSize
    : boardRect.height - tokenSize;

  return {
    x: clampNumber(snappedX, minX, maxX),
    y: clampNumber(snappedY, minY, maxY),
  };
}

function getScaledTokenSize(grid: CampaignMapGrid, imageScale: number) {
  const visibleGridSize = grid.size * imageScale;
  const preferredSize = visibleGridSize * 0.82;

  return clampNumber(preferredSize, minimumTableTokenSize, 76);
}

function constrainTokenToBoard(
  position: { x: number; y: number },
  boardRect: DOMRect,
  imageMetrics: {
    height: number;
    left: number;
    scale: number;
    top: number;
    width: number;
  } | null,
  tokenSize: number,
) {
  const minX = imageMetrics?.left ?? 0;
  const minY = imageMetrics?.top ?? 0;
  const maxX = imageMetrics
    ? imageMetrics.left + imageMetrics.width - tokenSize
    : boardRect.width - tokenSize;
  const maxY = imageMetrics
    ? imageMetrics.top + imageMetrics.height - tokenSize
    : boardRect.height - tokenSize;

  return {
    x: clampNumber(position.x, minX, maxX),
    y: clampNumber(position.y, minY, maxY),
  };
}

function mapPositionToBoardPosition(
  position: { x: number; y: number },
  imageMetrics: {
    left: number;
    scale: number;
    top: number;
  } | null,
  tokenSize = tableTokenSize,
) {
  if (!imageMetrics) {
    return {
      x: position.x - tokenSize / 2,
      y: position.y - tokenSize / 2,
    };
  }

  return {
    x: imageMetrics.left + position.x * imageMetrics.scale - tokenSize / 2,
    y: imageMetrics.top + position.y * imageMetrics.scale - tokenSize / 2,
  };
}

function boardPositionToMapPosition(
  position: { x: number; y: number },
  imageMetrics: {
    height: number;
    left: number;
    naturalHeight: number;
    naturalWidth: number;
    scale: number;
    top: number;
    width: number;
  } | null,
  tokenSize: number,
) {
  if (!imageMetrics) {
    return {
      x: Math.round(position.x + tokenSize / 2),
      y: Math.round(position.y + tokenSize / 2),
    };
  }

  const tokenRadiusOnMap = tokenSize / 2 / imageMetrics.scale;
  const x =
    (position.x + tokenSize / 2 - imageMetrics.left) / imageMetrics.scale;
  const y =
    (position.y + tokenSize / 2 - imageMetrics.top) / imageMetrics.scale;

  return {
    x: Math.round(
      clampNumber(
        x,
        tokenRadiusOnMap,
        imageMetrics.naturalWidth - tokenRadiusOnMap,
      ),
    ),
    y: Math.round(
      clampNumber(
        y,
        tokenRadiusOnMap,
        imageMetrics.naturalHeight - tokenRadiusOnMap,
      ),
    ),
  };
}

function getCharacterInitials(name?: string) {
  if (!name?.trim()) {
    return "?";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials.toUpperCase();
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSliderNumber(value: number | number[]) {
  if (Array.isArray(value)) {
    return value[0] ?? 0;
  }

  return value;
}

function getSoundElapsedSeconds({
  duration,
  isLooping,
  isPlaying,
  now,
  playbackPosition,
  startedAt,
}: Readonly<{
  duration: number;
  isLooping: boolean;
  isPlaying: boolean;
  now: number;
  playbackPosition: number;
  startedAt?: string;
}>) {
  if (!isPlaying || !startedAt) {
    return playbackPosition;
  }

  const startedAtTimestamp = new Date(startedAt).getTime();

  if (!Number.isFinite(startedAtTimestamp)) {
    return playbackPosition;
  }

  const rawElapsedSeconds = Math.max(0, (now - startedAtTimestamp) / 1000);

  if (duration <= 0) {
    return rawElapsedSeconds;
  }

  if (isLooping) {
    return rawElapsedSeconds % duration;
  }

  return Math.min(rawElapsedSeconds, duration);
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
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

function hexToRgb(hexColor: string) {
  const cleanColor = hexColor.replace("#", "");

  if (!/^[\da-f]{6}$/i.test(cleanColor)) {
    return null;
  }

  const value = Number.parseInt(cleanColor, 16);

  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
}
