"use client";

import {
  Button,
  Label,
  ListBox,
  SearchField,
  Select,
} from "@heroui/react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useSupportedSystems } from "@/shared/hooks/useSupportedSystems";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  FlagIcon,
  PlusIcon,
  ScrollTextIcon,
  SwordsIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCampaigns } from "../hooks/useCampaigns";

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

function getCampaignDescription(description?: string) {
  const fallbackDescription = "Sem descricao por enquanto.";
  const normalizedDescription = (description || fallbackDescription)
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedDescription.length <= 180) {
    return normalizedDescription;
  }

  return `${normalizedDescription.slice(0, 177).trimEnd()}...`;
}

export function CampaignsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const { data: supportedSystems = [], isLoading: isLoadingSystems } =
    useSupportedSystems();
  const activeSupportedSystems = supportedSystems.filter(
    (system) => system.isActive,
  );
  const campaignFilters = useMemo(
    () => ({
      search: debouncedSearchValue,
      supportedSystemId: selectedSystemId ?? undefined,
    }),
    [debouncedSearchValue, selectedSystemId],
  );
  const { data: campaigns = [], isLoading } = useCampaigns(campaignFilters);
  const hasActiveFilters =
    debouncedSearchValue.trim().length > 0 || Boolean(selectedSystemId);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  function clearFilters() {
    setSearchValue("");
    setDebouncedSearchValue("");
    setSelectedSystemId(null);
  }

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      {/* Cabecalho da pagina: segue o mesmo padrao visual da Central de ajuda. */}
      <motion.header
        className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
        variants={fadeInUp}
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
              <FlagIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
                Campanhas
              </p>
              <h1 className="text-3xl font-black tracking-normal text-rpg-text">
                Suas mesas
              </h1>
            </div>
          </div>

          <Link
            className="flex items-center justify-center gap-2 rounded-2xl bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
            href="/campaigns/new"
          >
            <PlusIcon className="h-5 w-5" />
            Nova campanha
          </Link>
        </div>

        {/* Filtros consultam o backend para manter a lista consistente com as regras da API. */}
        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_minmax(14rem,18rem)_auto] lg:items-end">
          <SearchField
            aria-label="Buscar campanha"
            className="flex flex-col gap-2"
            onChange={setSearchValue}
            value={searchValue}
          >
            <Label className="text-sm font-semibold text-rpg-text">
              Buscar campanha
            </Label>
            <SearchField.Group className="flex h-11 items-center gap-3 rounded-2xl border border-rpg-border bg-white px-4 text-rpg-text shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft">
              <SearchField.SearchIcon className="h-5 w-5 text-rpg-primary" />
              <SearchField.Input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-slate-400"
                placeholder="Nome, sistema ou descricao"
              />
              {searchValue ? (
                <SearchField.ClearButton className="grid size-7 place-items-center rounded-lg text-rpg-muted transition hover:bg-rpg-surface-muted hover:text-rpg-text">
                  <XIcon className="h-4 w-4" />
                </SearchField.ClearButton>
              ) : null}
            </SearchField.Group>
          </SearchField>

          <Select
            className="flex flex-col gap-2"
            isDisabled={isLoadingSystems}
            onSelectionChange={(key) => {
              const nextSystemId = String(key);
              setSelectedSystemId(nextSystemId === "all" ? null : nextSystemId);
            }}
            selectedKey={selectedSystemId ?? "all"}
          >
            <Label className="text-sm font-semibold text-rpg-text">
              Sistema
            </Label>
            <Select.Trigger className="flex h-11 w-full items-center justify-between rounded-2xl border border-rpg-border bg-white px-4 text-left text-sm font-semibold text-rpg-text shadow-sm outline-none transition focus:border-rpg-primary focus:ring-4 focus:ring-rpg-primary-soft disabled:cursor-not-allowed disabled:bg-rpg-surface-muted disabled:text-rpg-muted">
              <Select.Value className="truncate text-sm font-semibold text-rpg-text">
                {selectedSystemId
                  ? activeSupportedSystems.find(
                      (system) => system._id === selectedSystemId,
                    )?.name
                  : "Todos os sistemas"}
              </Select.Value>
              <Select.Indicator className="text-rpg-muted">
                <ChevronDownIcon className="h-4 w-4" />
              </Select.Indicator>
            </Select.Trigger>
            <Select.Popover className="min-w-(--trigger-width) overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface p-1 shadow-xl">
              <ListBox className="grid max-h-64 gap-1 overflow-auto">
                <ListBox.Item
                  className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary selected:bg-rpg-primary selected:text-white"
                  id="all"
                >
                  Todos os sistemas
                </ListBox.Item>
                {activeSupportedSystems.map((system) => (
                  <ListBox.Item
                    className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary selected:bg-rpg-primary selected:text-white"
                    id={system._id}
                    key={system._id}
                  >
                    {system.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          <Button
            className="h-11 rounded-2xl border border-rpg-border px-4 font-bold text-rpg-muted transition hover:border-rpg-primary hover:bg-rpg-primary-soft hover:text-rpg-primary disabled:opacity-50"
            isDisabled={!hasActiveFilters}
            onPress={clearFilters}
            variant="secondary"
          >
            Limpar
          </Button>
        </div>

      </motion.header>

      <motion.div variants={fadeInUp}>
        {isLoading ? (
        <div className="rounded-2xl border border-rpg-border bg-rpg-surface p-6 text-sm text-rpg-muted">
          Carregando campanhas...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-dashed border-rpg-border bg-rpg-surface p-10 text-center">
          <SwordsIcon className="h-10 w-10 text-rpg-primary" />
          <h2 className="mt-4 text-xl font-black tracking-normal text-rpg-text">
            {hasActiveFilters
              ? "Nenhuma campanha encontrada"
              : "Nenhuma campanha ainda"}
          </h2>
          <p className="mt-2 max-w-md text-justify text-sm leading-6 text-rpg-muted">
            {hasActiveFilters
              ? "Ajuste a busca ou o sistema para encontrar outras mesas."
              : "Crie a primeira campanha para organizar jogadores, sessoes e o material da sua mesa."}
          </p>
          {hasActiveFilters ? (
            <Button
              className="mt-5 rounded-lg border border-rpg-border px-4 py-3 font-bold text-rpg-muted transition hover:border-rpg-primary hover:bg-rpg-primary-soft hover:text-rpg-primary"
              onPress={clearFilters}
              variant="secondary"
            >
              Limpar filtros
            </Button>
          ) : (
            <Link
              className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-4 py-3 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
              href="/campaigns/new"
            >
              <PlusIcon className="h-5 w-5" />
              Criar campanha
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign, index) => {
            const iconUrl = getCampaignIconUrl(campaign.iconUrl);

            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 12 }}
                key={campaign._id}
                transition={{ delay: index * 0.04 }}
              >
                <Link
                  className="block h-full rounded-lg border border-rpg-border bg-rpg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rpg-primary hover:shadow-lg"
                  href={`/campaigns/${campaign._id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black tracking-normal text-rpg-text">
                        {campaign.name}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-rpg-primary">
                        {campaign.system || "Sistema a definir"}
                      </p>
                    </div>
                    <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-rpg-primary-soft text-rpg-primary shadow-sm">
                      {iconUrl ? (
                        <span
                          aria-hidden="true"
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${iconUrl})` }}
                        />
                      ) : (
                        <ScrollTextIcon className="h-6 w-6" />
                      )}
                    </span>
                  </div>

                  <p className="mt-4 min-h-[4.5rem] text-justify text-sm leading-6 text-rpg-muted">
                    {getCampaignDescription(campaign.description)}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-rpg-muted">
                    <CalendarDaysIcon className="h-4 w-4" />
                    {campaign.updatedAt
                      ? new Date(campaign.updatedAt).toLocaleDateString(
                          "pt-BR",
                        )
                      : "Recente"}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      </motion.div>
    </motion.section>
  );
}
