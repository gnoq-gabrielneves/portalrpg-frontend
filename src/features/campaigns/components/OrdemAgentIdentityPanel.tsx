import { Label, ListBox, Select } from "@heroui/react";
import { ImageIcon, UserRoundIcon } from "lucide-react";
import {
  CHARACTER_ICON_MAX_SIZE,
  ordemAgentClassOptions,
} from "../constants/ordemAgentSheet";
import { OrdemAgentClass } from "../types/campaign";
import { OrdemClassTrack, OrdemOrigin } from "../types/ordemRules";
import {
  OrdemAgentNumberInput,
  OrdemAgentTextInput,
} from "./OrdemAgentSheetInputs";

export function OrdemAgentIdentityPanel({
  agentClass,
  avatarUrl,
  characterName,
  defaultNex,
  defaultOrigin,
  defaultPath,
  isCustomizing,
  isLoadingRules,
  nexValue,
  onClassChange,
  onDirty,
  onOriginChange,
  onPathChange,
  origins,
  paths,
  selectedOriginKey,
  selectedPathKey,
  selectedIconError,
  selectedIconName,
  setSelectedIconError,
  setSelectedIconName,
}: Readonly<{
  agentClass: OrdemAgentClass;
  avatarUrl: string | null;
  characterName: string;
  defaultNex: number;
  defaultOrigin: string;
  defaultPath: string;
  isCustomizing: boolean;
  isLoadingRules: boolean;
  nexValue: number;
  onClassChange: (agentClass: OrdemAgentClass) => void;
  onDirty: () => void;
  onOriginChange: (originKey: string) => void;
  onPathChange: (pathKey: string) => void;
  origins: OrdemOrigin[];
  paths: OrdemClassTrack[];
  selectedOriginKey: string;
  selectedPathKey: string;
  selectedIconError: string;
  selectedIconName: string;
  setSelectedIconError: (error: string) => void;
  setSelectedIconName: (name: string) => void;
}>) {
  const originName =
    origins.find((origin) => origin.key === (selectedOriginKey || defaultOrigin))
      ?.name ||
    defaultOrigin ||
    "Sem origem";
  const className =
    ordemAgentClassOptions.find((option) => option.value === agentClass)
      ?.label ?? "Sem classe";
  const pathName =
    paths.find((path) => path.key === (selectedPathKey || defaultPath))?.name ||
    (nexValue < 10 ? "Libera no NEX 10%" : "Sem trilha");

  if (!isCustomizing) {
    return (
      <section className="min-w-0 rounded-3xl border border-rpg-border bg-rpg-surface p-5 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center">
          <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface-muted shadow-sm">
            {avatarUrl ? (
              <span
                aria-hidden="true"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              />
            ) : (
              <UserRoundIcon className="h-10 w-10 text-rpg-muted" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wide text-rpg-muted">
              Personagem
            </p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-normal text-rpg-text">
              {characterName || "Personagem sem nome"}
            </h1>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <IdentityInfo label="Origem" value={originName} />
              <IdentityInfo label="Classe" value={className} />
              <IdentityInfo label="Trilha" value={pathName} />
              <IdentityInfo label="NEX" value={`${nexValue}%`} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid min-w-0 gap-4 rounded-3xl border border-rpg-border bg-rpg-surface p-5 shadow-sm">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[5rem_minmax(14rem,1.4fr)_minmax(9rem,0.85fr)_minmax(9rem,0.85fr)_minmax(8rem,0.65fr)] xl:items-end">
        <label
          className={`group grid size-20 place-items-center overflow-hidden rounded-xl border border-rpg-border bg-rpg-surface-muted ${
            isCustomizing ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {avatarUrl ? (
            <span
              aria-hidden="true"
              className="h-full w-full bg-cover bg-center transition group-hover:scale-105"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            />
          ) : (
            <UserRoundIcon className="h-9 w-9 text-rpg-muted" />
          )}
          <input
            accept="image/*"
            className="sr-only"
            disabled={!isCustomizing}
            name="icon"
            onChange={(event) => {
              const selectedFile = event.currentTarget.files?.[0];

              if (!selectedFile) {
                onDirty();
                setSelectedIconError("");
                setSelectedIconName("");
                return;
              }

              if (selectedFile.size > CHARACTER_ICON_MAX_SIZE) {
                onDirty();
                event.currentTarget.value = "";
                setSelectedIconError("Use uma imagem com ate 20MB.");
                setSelectedIconName("");
                return;
              }

              onDirty();
              setSelectedIconError("");
              setSelectedIconName(selectedFile.name);
            }}
            type="file"
          />
        </label>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <OrdemAgentTextInput
            defaultValue={characterName}
            isEditing={isCustomizing}
            label="Personagem"
            name="name"
            required
          />
          <OriginSelect
            fallbackValue={defaultOrigin}
            isCustomizing={isCustomizing}
            isLoading={isLoadingRules}
            onChange={onOriginChange}
            origins={origins}
            selectedKey={selectedOriginKey}
          />
        </div>

        <ClassSelect
          agentClass={agentClass}
          isCustomizing={isCustomizing}
          onChange={onClassChange}
        />
        <PathSelect
          fallbackValue={defaultPath}
          isCustomizing={isCustomizing}
          isLoading={isLoadingRules}
          nexValue={nexValue}
          onChange={onPathChange}
          paths={paths}
          selectedKey={selectedPathKey}
        />
        <OrdemAgentNumberInput
          defaultValue={String(defaultNex)}
          isEditing={isCustomizing}
          label="NEX"
          max={99}
          min={0}
          name="nex"
          required
        />
      </div>

      {selectedIconName ? (
        <p className="flex items-center gap-2 text-xs font-semibold text-rpg-muted">
          <ImageIcon className="h-4 w-4 text-rpg-primary" />
          {selectedIconName}
        </p>
      ) : null}
      {selectedIconError ? (
        <p className="text-sm font-medium text-rpg-danger">
          {selectedIconError}
        </p>
      ) : null}
    </section>
  );
}

function IdentityInfo({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0 rounded-2xl border border-rpg-border bg-rpg-surface-muted px-4 py-3">
      <p className="text-[0.65rem] font-black uppercase tracking-wide text-rpg-muted">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-rpg-text">{value}</p>
    </div>
  );
}

function OriginSelect({
  fallbackValue,
  isCustomizing,
  isLoading,
  onChange,
  origins,
  selectedKey,
}: Readonly<{
  fallbackValue: string;
  isCustomizing: boolean;
  isLoading: boolean;
  onChange: (originKey: string) => void;
  origins: OrdemOrigin[];
  selectedKey: string;
}>) {
  return (
    <>
      <input name="origin" type="hidden" value={selectedKey || fallbackValue} />
      <Select
        className="min-w-0 flex flex-col gap-1"
        fullWidth
        isDisabled={!isCustomizing || isLoading}
        onSelectionChange={(key) => {
          if (isStringSelectionKey(key)) {
            onChange(key);
          }
        }}
        selectedKey={selectedKey}
        variant="secondary"
      >
        <Label className="text-xs font-black uppercase text-rpg-muted">
          Origem
        </Label>
        <Select.Trigger
          className={`flex min-h-10 min-w-0 items-center justify-between rounded-lg border px-3 py-2 text-sm font-bold text-rpg-text outline-none transition ${
            isCustomizing
              ? "border-rpg-border bg-white shadow-sm focus-visible:border-rpg-primary focus-visible:ring-4 focus-visible:ring-rpg-primary-soft"
              : "border-transparent bg-transparent px-0 shadow-none"
          }`}
        >
          <Select.Value className="truncate" />
          <Select.Indicator className="h-4 w-4 text-rpg-muted" />
        </Select.Trigger>
        <Select.Popover className="rounded-lg border border-rpg-border bg-white p-1 shadow-xl">
          <ListBox>
            {origins.map((origin) => (
              <ListBox.Item
                className="rounded-md px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                id={origin.key}
                key={origin.key}
                textValue={origin.name}
              >
                {origin.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </>
  );
}

function PathSelect({
  fallbackValue,
  isCustomizing,
  isLoading,
  nexValue,
  onChange,
  paths,
  selectedKey,
}: Readonly<{
  fallbackValue: string;
  isCustomizing: boolean;
  isLoading: boolean;
  nexValue: number;
  onChange: (pathKey: string) => void;
  paths: OrdemClassTrack[];
  selectedKey: string;
}>) {
  const isLockedByNex = nexValue < 10;

  return (
    <>
      <input name="path" type="hidden" value={selectedKey || fallbackValue} />
      <Select
        className="min-w-0 flex flex-col gap-1"
        fullWidth
        isDisabled={!isCustomizing || isLoading || isLockedByNex}
        onSelectionChange={(key) => {
          if (isStringSelectionKey(key)) {
            onChange(key);
          }
        }}
        placeholder={isLockedByNex ? "Libera no NEX 10%" : "Selecione"}
        selectedKey={selectedKey}
        variant="secondary"
      >
        <Label className="text-xs font-black uppercase text-rpg-muted">
          Trilha
        </Label>
        <Select.Trigger
          className={`flex min-h-10 min-w-0 items-center justify-between rounded-lg border px-3 py-2 text-sm font-bold text-rpg-text outline-none transition ${
            isCustomizing && !isLockedByNex
              ? "border-rpg-border bg-white shadow-sm focus-visible:border-rpg-primary focus-visible:ring-4 focus-visible:ring-rpg-primary-soft"
              : "border-transparent bg-transparent px-0 shadow-none"
          }`}
        >
          <Select.Value className="truncate" />
          <Select.Indicator className="h-4 w-4 text-rpg-muted" />
        </Select.Trigger>
        <Select.Popover className="rounded-lg border border-rpg-border bg-white p-1 shadow-xl">
          <ListBox>
            {paths.map((path) => (
              <ListBox.Item
                className="rounded-md px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                id={path.key}
                key={path.key}
                textValue={path.name}
              >
                {path.name}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </>
  );
}

function ClassSelect({
  agentClass,
  isCustomizing,
  onChange,
}: Readonly<{
  agentClass: OrdemAgentClass;
  isCustomizing: boolean;
  onChange: (agentClass: OrdemAgentClass) => void;
}>) {
  return (
    <Select
      className="min-w-0 flex flex-col gap-1"
      fullWidth
      isDisabled={!isCustomizing}
      onSelectionChange={(key) => {
        if (isOrdemAgentClass(key)) {
          onChange(key);
        }
      }}
      selectedKey={agentClass}
      variant="secondary"
    >
      <Label className="text-xs font-black uppercase text-rpg-muted">
        Classe
      </Label>
      <Select.Trigger
        className={`flex min-h-10 min-w-0 items-center justify-between rounded-lg border px-3 py-2 text-sm font-bold text-rpg-text outline-none transition ${
          isCustomizing
            ? "border-rpg-border bg-white shadow-sm focus-visible:border-rpg-primary focus-visible:ring-4 focus-visible:ring-rpg-primary-soft"
            : "border-transparent bg-transparent px-0 shadow-none"
        }`}
      >
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
  );
}

function isOrdemAgentClass(
  value: string | number | null,
): value is OrdemAgentClass {
  if (value === null) {
    return false;
  }

  return ordemAgentClassOptions.some((option) => option.value === value);
}

function isStringSelectionKey(value: string | number | null): value is string {
  return typeof value === "string" && value.length > 0;
}
