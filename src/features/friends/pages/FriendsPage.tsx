"use client";

import { Button, Card, Label, SearchField } from "@heroui/react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import {
  CheckIcon,
  SearchIcon,
  UserPlusIcon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toAbsoluteApiAssetUrl } from "@/features/profile/services/profileService";
import { useFriendMutations } from "../hooks/useFriendMutations";
import { useFriendRequests } from "../hooks/useFriendRequests";
import { useFriendSearch } from "../hooks/useFriendSearch";
import { useFriends } from "../hooks/useFriends";
import { FriendSearchResult, FriendUser } from "../types/friend";

export function FriendsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const { data: friendships = [], isLoading: isLoadingFriends } = useFriends();
  const { data: requests, isLoading: isLoadingRequests } = useFriendRequests();
  const { data: searchResults = [], isFetching: isSearching } =
    useFriendSearch(debouncedSearchValue);
  const {
    acceptRequest,
    declineRequest,
    removeFriendship,
    sendRequest,
  } = useFriendMutations();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const incomingRequests = requests?.incoming ?? [];
  const outgoingRequests = requests?.outgoing ?? [];
  const hasSearchTerm = debouncedSearchValue.length >= 2;

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.header
        className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
            <UsersRoundIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
              Social
            </p>
            <h1 className="text-3xl font-black tracking-normal text-rpg-text">
              Amigos
            </h1>
          </div>
        </div>

        {/* Busca usa o endpoint /friends/search para manter o filtro no backend. */}
        <SearchField
          aria-label="Buscar pessoas"
          className="mt-6 flex flex-col gap-2"
          onChange={setSearchValue}
          value={searchValue}
        >
          <Label className="text-sm font-semibold text-rpg-text">
            Buscar por nome ou email
          </Label>
          <SearchField.Group className="flex h-11 items-center gap-3 rounded-2xl border border-rpg-border bg-white px-4 text-rpg-text shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft">
            <SearchField.SearchIcon className="h-5 w-5 text-rpg-primary">
              <SearchIcon className="h-5 w-5" />
            </SearchField.SearchIcon>
            <SearchField.Input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-slate-400"
              placeholder="Digite pelo menos 2 caracteres"
            />
            {searchValue ? (
              <SearchField.ClearButton className="grid size-7 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text">
                <XIcon className="h-4 w-4" />
              </SearchField.ClearButton>
            ) : null}
          </SearchField.Group>
        </SearchField>
      </motion.header>

      <div className="grid gap-6 2xl:gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <motion.section className="grid gap-6" variants={fadeInUp}>
          <Card className="border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <div>
                <Card.Title className="text-xl font-black text-rpg-text">
                  Encontrar jogadores
                </Card.Title>
                <Card.Description className="mt-1 text-sm text-rpg-muted">
                  Adicione pessoas para depois convidar para suas campanhas.
                </Card.Description>
              </div>
            </Card.Header>
            <Card.Content className="grid gap-3 p-5">
              {!hasSearchTerm ? (
                <EmptyState text="Busque pelo nome ou email de outro jogador." />
              ) : null}

              {hasSearchTerm && isSearching ? (
                <EmptyState text="Buscando jogadores..." />
              ) : null}

              {hasSearchTerm && !isSearching && searchResults.length === 0 ? (
                <EmptyState text="Nenhum jogador encontrado." />
              ) : null}

              {searchResults.map((result) => (
                <SearchResultItem
                  isPending={sendRequest.isPending}
                  key={result.id}
                  onSendRequest={() => sendRequest.mutate(result.id)}
                  result={result}
                />
              ))}
            </Card.Content>
          </Card>

          <Card className="border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <div>
                <Card.Title className="text-xl font-black text-rpg-text">
                  Solicitações recebidas
                </Card.Title>
                <Card.Description className="mt-1 text-sm text-rpg-muted">
                  Aceite quem pode entrar na sua rede de jogadores.
                </Card.Description>
              </div>
            </Card.Header>
            <Card.Content className="grid gap-3 p-5">
              {isLoadingRequests ? <EmptyState text="Carregando pedidos..." /> : null}
              {!isLoadingRequests && incomingRequests.length === 0 ? (
                <EmptyState text="Nenhum pedido recebido." />
              ) : null}
              {incomingRequests.map((request) => (
                <UserRow
                  actions={
                    <div className="flex gap-2">
                      <Button
                        className="rounded-lg bg-rpg-primary px-3 py-2 font-bold text-white"
                        isDisabled={acceptRequest.isPending}
                        onPress={() => acceptRequest.mutate(request.id)}
                      >
                        <CheckIcon className="h-4 w-4" />
                        Aceitar
                      </Button>
                      <Button
                        className="rounded-lg border border-rpg-border px-3 py-2 font-bold text-rpg-muted hover:bg-rpg-surface-muted"
                        isDisabled={declineRequest.isPending}
                        onPress={() => declineRequest.mutate(request.id)}
                        variant="secondary"
                      >
                        Recusar
                      </Button>
                    </div>
                  }
                  key={request.id}
                  user={request.requester}
                />
              ))}
            </Card.Content>
          </Card>
        </motion.section>

        <motion.aside className="grid gap-6 content-start" variants={fadeInUp}>
          <Card className="border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <Card.Title className="text-xl font-black text-rpg-text">
                Seus amigos
              </Card.Title>
            </Card.Header>
            <Card.Content className="grid gap-3 p-5">
              {isLoadingFriends ? <EmptyState text="Carregando amigos..." /> : null}
              {!isLoadingFriends && friendships.length === 0 ? (
                <EmptyState text="Sua lista de amigos ainda está vazia." />
              ) : null}
              {friendships.map((friendship) => (
                <UserRow
                  actions={
                    <Button
                      className="rounded-lg border border-rpg-border px-3 py-2 font-bold text-rpg-muted hover:bg-rpg-surface-muted"
                      isDisabled={removeFriendship.isPending}
                      onPress={() => removeFriendship.mutate(friendship.id)}
                      variant="secondary"
                    >
                      Remover
                    </Button>
                  }
                  key={friendship.id}
                  user={friendship.friend}
                />
              ))}
            </Card.Content>
          </Card>

          <Card className="border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <Card.Title className="text-xl font-black text-rpg-text">
                Pedidos enviados
              </Card.Title>
            </Card.Header>
            <Card.Content className="grid gap-3 p-5">
              {isLoadingRequests ? <EmptyState text="Carregando enviados..." /> : null}
              {!isLoadingRequests && outgoingRequests.length === 0 ? (
                <EmptyState text="Nenhum pedido pendente." />
              ) : null}
              {outgoingRequests.map((request) => (
                <UserRow
                  actions={
                    <span className="rounded-lg bg-rpg-primary-soft px-3 py-2 text-sm font-bold text-rpg-primary">
                      Pendente
                    </span>
                  }
                  key={request.id}
                  user={request.recipient}
                />
              ))}
            </Card.Content>
          </Card>
        </motion.aside>
      </div>
    </motion.section>
  );
}

function SearchResultItem({
  isPending,
  onSendRequest,
  result,
}: Readonly<{
  isPending: boolean;
  onSendRequest: () => void;
  result: FriendSearchResult;
}>) {
  const statusLabel = getSearchStatusLabel(result.friendshipStatus);
  const canSendRequest = result.friendshipStatus === "none";

  return (
    <UserRow
      actions={
        canSendRequest ? (
          <Button
            className="rounded-lg bg-rpg-primary px-3 py-2 font-bold text-white"
            isDisabled={isPending}
            onPress={onSendRequest}
          >
            <UserPlusIcon className="h-4 w-4" />
            Adicionar
          </Button>
        ) : (
          <span className="rounded-lg bg-rpg-primary-soft px-3 py-2 text-sm font-bold text-rpg-primary">
            {statusLabel}
          </span>
        )
      }
      user={result}
    />
  );
}

function UserRow({
  actions,
  user,
}: Readonly<{
  actions: React.ReactNode;
  user: FriendUser;
}>) {
  const avatarUrl = toAbsoluteApiAssetUrl(user.avatarUrl);
  const [hasAvatarError, setHasAvatarError] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-rpg-primary text-sm font-black text-white">
          {avatarUrl && !hasAvatarError ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              onError={() => setHasAvatarError(true)}
              src={avatarUrl}
            />
          ) : (
            getInitials(user.displayName)
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-rpg-text">
            {user.displayName}
          </span>
          <span className="block truncate text-xs font-semibold text-rpg-muted">
            {user.email}
          </span>
        </span>
      </div>
      <div className="flex shrink-0 justify-end">{actions}</div>
    </div>
  );
}

function EmptyState({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-2xl border border-dashed border-rpg-border bg-rpg-surface p-5 text-center text-sm font-semibold text-rpg-muted">
      {text}
    </div>
  );
}

function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase())
    .join("");
}

function getSearchStatusLabel(status: FriendSearchResult["friendshipStatus"]) {
  const labels: Record<FriendSearchResult["friendshipStatus"], string> = {
    friend: "Amigo",
    none: "Adicionar",
    pending_received: "Aguardando você",
    pending_sent: "Pendente",
  };

  return labels[status];
}
