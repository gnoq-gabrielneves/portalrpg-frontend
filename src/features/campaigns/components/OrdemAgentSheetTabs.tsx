import { Button, InputGroup, Label, Switch, TextField } from "@heroui/react";
import {
  ChevronDownIcon,
  CheckIcon,
  Dice5Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  emptyTabActions,
  emptyTabMessages,
  sheetTabs,
} from "../constants/ordemAgentSheet";
import { OrdemAgentManualPower } from "../types/campaign";
import { SheetTab } from "../types/ordemAgentSheet";
import { OrdemOriginPower } from "../types/ordemRules";
import { OrdemAgentTextAreaInput } from "./OrdemAgentSheetInputs";

type ManualPowerField =
  | "category"
  | "damageRoll"
  | "description"
  | "hasDamageRoll"
  | "hasTestRoll"
  | "isRollable"
  | "name"
  | "testRoll";
type PowerRollKind = "Dano" | "Teste";
type PowerRollResult = {
  detail?: string;
  expression: string;
  id: string;
  isInvalid?: boolean;
  isRolling: boolean;
  kind: PowerRollKind;
  title: string;
  total?: number;
};
export type PowerRollCompletePayload = {
  expression: string;
  kind: PowerRollKind;
  title: string;
  total: number;
};
const flaticonDicePaths: Record<number, string> = {
  4: "M138 0Q127 2 117 8L21 68Q4 80 0.5 100.5Q-3 121 9 138L111 282Q121 296 138 300ZM291 138 189 282V283Q179 296 162 300V0Q173 2 183 8L279 69Q296 81 299.5 101Q303 121 291 138Z",
  6: "M28 234Q34 241 43 246L118 291Q133 300 150 300Q167 300 182 291L257 246Q266 241 272 234L150 160ZM163 139V1Q173 3 182 9L257 54Q271 62 279 76.5Q287 91 287 107V193Q287 202 284 212ZM138 139 16 212Q13 202 13 193V108Q13 91 21 76.5Q29 62 43 54L118 9Q127 3 137 1Z",
  8: "M14 166Q17 179 26 190L113 285Q123 296 137 300V129ZM163 129 286 166Q283 179 273 191L187 285Q177 296 163 300ZM138 103 13 140Q15 123 27 109L113 15Q123 4 138 0ZM163 103V0Q177 4 188 15L274 110Q285 123 287 140Z",
  10: "M185 154 150 128 115 154 150 251ZM91 161 138 292Q140 295 143 297.5Q146 300 150 300Q139 300 129 295Q119 290 111 282L25 179Q15 165 13 148ZM162 292 209 161 288 148Q285 165 275 179L189 282Q182 290 171.5 295Q161 300 150 300Q154 300 157.5 297.5Q161 295 162 292ZM138 106 97 137 15 123Q19 109 29 98L114 14Q124 3 138 0ZM203 137 163 106V0Q176 3 186 13L271 98Q281 109 286 123Z",
  12: "M78 128 11 209 31 242 138 215V158ZM269 242 163 215V158L222 128L289 209ZM150 136 91 106 130 0H170L209 106ZM236 106 198 5 206 9 246 33Q259 41 267 54L291 94Q300 109 300 126V174Q300 178 299 183ZM150 238 251 263 206 291Q191 300 174 300H126Q109 300 94 291L54 267L48 263ZM64 106 1 182Q0 178 0 174V126Q0 109 9 94L33 54Q41 41 54 33L94 9L101 5Z",
  20: "M190 163 150 99 110 163ZM125 91 87 153 48 98ZM216 196 274 231Q267 240 257 246L182 291Q171 298 159 299Q160 299 216 196ZM192 188 150 264 108 188ZM213 153 175 91 252 98ZM84 196Q113 247 141 299Q129 298 118 291L43 246Q33 240 26 231ZM228 174Q257 134 286 94Q288 100 287 107V193Q287 201 285 208ZM163 65V1Q173 3 182 9L257 54Q271 62 279 76ZM72 174 15 208Q13 201 13 192V108Q13 100 14 94ZM138 65Q79 70 21 76Q29 62 43 54L118 9Q127 3 138 1Z",
};

export function OrdemAgentSheetTabs({
  activeTab,
  appearance,
  automaticPowers,
  history,
  isCustomizing,
  manualPowers,
  notes,
  objective,
  onRollComplete,
  onManualPowersChange,
  onTabChange,
  personality,
}: Readonly<{
  activeTab: SheetTab;
  appearance: string;
  automaticPowers: OrdemOriginPower[];
  history: string;
  isCustomizing: boolean;
  manualPowers: OrdemAgentManualPower[];
  notes: string;
  objective: string;
  onRollComplete?: (roll: PowerRollCompletePayload) => void;
  onManualPowersChange: (manualPowers: OrdemAgentManualPower[]) => void;
  onTabChange: (tab: SheetTab) => void;
  personality: string;
}>) {
  return (
    <section className="grid min-h-[42rem] min-w-0 gap-5 overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface p-5 shadow-sm xl:content-start">
      <div className="flex flex-wrap items-center gap-2 border-b border-rpg-border">
        {sheetTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <Button
              className={`flex items-center gap-2 rounded-none border-b-2 px-3 py-3 text-sm font-bold transition ${
                isActive
                  ? "border-rpg-primary text-rpg-primary"
                  : "border-transparent text-rpg-muted hover:text-rpg-text"
              }`}
              key={tab.value}
              onPress={() => onTabChange(tab.value)}
              type="button"
              variant="secondary"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      <ActiveSheetTab
        activeTab={activeTab}
        appearance={appearance}
        automaticPowers={automaticPowers}
        history={history}
        isCustomizing={isCustomizing}
        manualPowers={manualPowers}
        notes={notes}
        objective={objective}
        onRollComplete={onRollComplete}
        onManualPowersChange={onManualPowersChange}
        personality={personality}
      />
    </section>
  );
}

function ActiveSheetTab({
  activeTab,
  appearance,
  automaticPowers,
  history,
  isCustomizing,
  manualPowers,
  notes,
  objective,
  onRollComplete,
  onManualPowersChange,
  personality,
}: Readonly<{
  activeTab: SheetTab;
  appearance: string;
  automaticPowers: OrdemOriginPower[];
  history: string;
  isCustomizing: boolean;
  manualPowers: OrdemAgentManualPower[];
  notes: string;
  objective: string;
  onRollComplete?: (roll: PowerRollCompletePayload) => void;
  onManualPowersChange: (manualPowers: OrdemAgentManualPower[]) => void;
  personality: string;
}>) {
  if (activeTab === "description") {
    return (
      <div className="grid gap-5">
        <OrdemAgentTextAreaInput
          defaultValue={notes}
          isEditing={isCustomizing}
          label="Anotações"
          name="notes"
          placeholder="Anotações pessoais do agente..."
        />
        <OrdemAgentTextAreaInput
          defaultValue={appearance}
          isEditing={isCustomizing}
          label="Aparência"
          name="appearance"
          placeholder="Nome, gênero, idade, descrição física..."
        />
        <OrdemAgentTextAreaInput
          defaultValue={personality}
          isEditing={isCustomizing}
          label="Personalidade"
          name="personality"
          placeholder="Traços marcantes, opiniões, ideais..."
        />
        <OrdemAgentTextAreaInput
          defaultValue={history}
          isEditing={isCustomizing}
          label="Histórico"
          name="history"
          placeholder="Infância, relação com a família, contato com o Paranormal, eventos bons e ruins..."
        />
        <OrdemAgentTextAreaInput
          defaultValue={objective}
          isEditing={isCustomizing}
          label="Objetivo"
          name="objective"
          placeholder="Por que ele faz parte da Ordem? Porque luta contra o Outro Lado?"
        />
      </div>
    );
  }

  if (activeTab === "powers") {
    return (
      <PowersTab
        automaticPowers={automaticPowers}
        isCustomizing={isCustomizing}
        manualPowers={manualPowers}
        onRollComplete={onRollComplete}
        onManualPowersChange={onManualPowersChange}
      />
    );
  }

  return (
    <div className="grid min-h-[28rem] content-center justify-items-center gap-5 rounded-2xl border border-dashed border-rpg-border bg-rpg-surface">
      <Dice5Icon className="h-10 w-10 text-rpg-primary" />
      <p className="text-xl font-black text-rpg-text">
        {emptyTabMessages[activeTab]}
      </p>
      <Button
        className="rounded-lg border border-rpg-primary bg-white px-5 py-3 text-sm font-bold text-rpg-primary transition hover:bg-rpg-primary-soft"
        type="button"
        variant="secondary"
      >
        {emptyTabActions[activeTab]}
      </Button>
    </div>
  );
}

function PowersTab({
  automaticPowers,
  isCustomizing,
  manualPowers,
  onRollComplete,
  onManualPowersChange,
}: Readonly<{
  automaticPowers: OrdemOriginPower[];
  isCustomizing: boolean;
  manualPowers: OrdemAgentManualPower[];
  onRollComplete?: (roll: PowerRollCompletePayload) => void;
  onManualPowersChange: (manualPowers: OrdemAgentManualPower[]) => void;
}>) {
  const [openPowerIds, setOpenPowerIds] = useState<Set<string>>(new Set());
  const [rollResult, setRollResult] = useState<PowerRollResult | null>(null);
  const rollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimeout.current) {
        clearTimeout(rollTimeout.current);
      }
    };
  }, []);

  function handleAddPower() {
    const id = crypto.randomUUID();

    setOpenPowerIds((current) => new Set(current).add(id));
    onManualPowersChange([
      ...manualPowers,
      {
        category: "",
        damageRoll: "1d6",
        description: "",
        hasDamageRoll: false,
        hasTestRoll: true,
        id,
        isRollable: false,
        name: "Nova habilidade",
        testRoll: "1d20",
      },
    ]);
  }

  function handlePowerChange(
    powerId: string,
    field: ManualPowerField,
    value: boolean | string,
  ) {
    onManualPowersChange(
      manualPowers.map((power) => {
        if (power.id !== powerId) {
          return power;
        }

        const nextPower = { ...power, [field]: value };

        if (field === "isRollable" && value === true) {
          return {
            ...nextPower,
            damageRoll: nextPower.damageRoll || "1d6",
            hasTestRoll: nextPower.hasTestRoll ?? true,
            testRoll: nextPower.testRoll || "1d20",
          };
        }

        if (field === "hasDamageRoll" && value === true) {
          return {
            ...nextPower,
            damageRoll: nextPower.damageRoll || "1d6",
          };
        }

        if (field === "hasTestRoll" && value === true) {
          return {
            ...nextPower,
            testRoll: nextPower.testRoll || "1d20",
          };
        }

        return nextPower;
      }),
    );
  }

  function handleRemovePower(powerId: string) {
    setOpenPowerIds((current) => {
      const nextOpenPowerIds = new Set(current);
      nextOpenPowerIds.delete(powerId);

      return nextOpenPowerIds;
    });
    onManualPowersChange(
      manualPowers.filter((power) => power.id !== powerId),
    );
  }

  function handlePowerOpenChange(powerId: string, isOpen: boolean) {
    setOpenPowerIds((current) => {
      const nextOpenPowerIds = new Set(current);

      if (isOpen) {
        nextOpenPowerIds.add(powerId);
      } else {
        nextOpenPowerIds.delete(powerId);
      }

      return nextOpenPowerIds;
    });
  }

  function handleDoneEditingPower(powerId: string) {
    handlePowerOpenChange(powerId, false);
  }

  function handleRollPower({
    expression,
    kind,
    title,
  }: {
    expression: string;
    kind: PowerRollKind;
    title: string;
  }) {
    if (rollTimeout.current) {
      clearTimeout(rollTimeout.current);
    }

    const id = crypto.randomUUID();
    const result = rollDiceExpression(expression);

    setRollResult({
      expression,
      id,
      isInvalid: !result,
      isRolling: true,
      kind,
      title,
    });

    rollTimeout.current = setTimeout(() => {
      setRollResult({
        detail: result?.detail,
        expression,
        id,
        isInvalid: !result,
        isRolling: false,
        kind,
        title,
        total: result?.total,
      });

      if (result) {
        onRollComplete?.({
          expression,
          kind,
          title,
          total: result.total,
        });
      }
    }, 650);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {isCustomizing ? (
          <div className="flex justify-end">
            <Button
              className="flex w-fit items-center gap-2 rounded-lg bg-rpg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
              onPress={handleAddPower}
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
              Adicionar habilidade
            </Button>
          </div>
        ) : null}

        {automaticPowers.length || manualPowers.length ? (
          <div className="grid gap-3">
            {automaticPowers.length ? (
              <div className="grid gap-3">
                {automaticPowers.map((power) => (
                  <PowerCard
                    badge="Origem"
                    description={power.summary}
                    key={power.key}
                    title={power.name}
                  />
                ))}
              </div>
            ) : null}

            {manualPowers.length ? (
              <div className="grid gap-3">
                {manualPowers.map((power) =>
                  isCustomizing ? (
                    <ManualPowerEditorCard
                      isOpen={openPowerIds.has(power.id)}
                      key={power.id}
                      onChange={handlePowerChange}
                      onDone={handleDoneEditingPower}
                      onOpenChange={handlePowerOpenChange}
                      onRemove={handleRemovePower}
                      power={power}
                    />
                  ) : (
                    <PowerCard
                      badge={getPowerCategory(power)}
                      description={power.description || "Sem descrição."}
                      key={power.id}
                      onRoll={handleRollPower}
                      rollablePower={power}
                      title={power.name}
                    />
                  ),
                )}
              </div>
            ) : null}
          </div>
        ) : isCustomizing ? (
          <p className="rounded-xl border border-dashed border-rpg-border bg-white p-4 text-sm font-semibold text-rpg-muted">
            Nenhuma habilidade adicionada. Use o botão acima para adicionar uma
            habilidade.
          </p>
        ) : (
          <p className="rounded-xl border border-dashed border-rpg-border bg-white p-4 text-sm font-semibold text-rpg-muted">
            Você ainda não possui habilidades.
          </p>
        )}
      </div>
      {rollResult ? (
        <PowerRollResultPanel
          onClose={() => setRollResult(null)}
          result={rollResult}
        />
      ) : null}
    </div>
  );
}

function ManualPowerEditorCard({
  isOpen,
  onChange,
  onDone,
  onOpenChange,
  onRemove,
  power,
}: Readonly<{
  isOpen: boolean;
  onChange: (
    powerId: string,
    field: ManualPowerField,
    value: boolean | string,
  ) => void;
  onDone: (powerId: string) => void;
  onOpenChange: (powerId: string, isOpen: boolean) => void;
  onRemove: (powerId: string) => void;
  power: OrdemAgentManualPower;
}>) {
  return (
    <details
      className="group w-full overflow-hidden rounded-xl border border-rpg-border bg-white shadow-sm transition open:border-rpg-primary/40"
      onToggle={(event) => onOpenChange(power.id, event.currentTarget.open)}
      open={isOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition hover:bg-rpg-primary-soft/40 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-rpg-primary">
            {getPowerCategory(power)}
          </p>
          <h4 className="mt-1 truncate text-base font-black tracking-normal text-rpg-text">
            {power.name || "Nova habilidade"}
          </h4>
          <p className="mt-1 truncate text-xs font-semibold text-rpg-muted">
            {power.isRollable ? "Com rolagem configurada" : "Sem rolagem"}
          </p>
        </div>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-rpg-muted transition group-open:rotate-180" />
      </summary>
      <div className="grid gap-3 border-t border-rpg-border p-4">
        <ManualPowerEditor
          onChange={onChange}
          onDone={onDone}
          onRemove={onRemove}
          power={power}
        />
      </div>
    </details>
  );
}

function PowerCard({
  badge,
  description,
  onRoll,
  rollablePower,
  title,
}: Readonly<{
  badge: string;
  description: string;
  onRoll?: (roll: {
    expression: string;
    kind: PowerRollKind;
    title: string;
  }) => void;
  rollablePower?: OrdemAgentManualPower;
  title: string;
}>) {
  const hasDamageRoll =
    rollablePower?.isRollable &&
    rollablePower.hasDamageRoll &&
    Boolean(rollablePower.damageRoll?.trim());
  const hasTestRoll =
    rollablePower?.isRollable &&
    rollablePower.hasTestRoll &&
    Boolean(rollablePower.testRoll?.trim());
  const damageRollExpression = rollablePower?.damageRoll?.trim() || "1d6";
  const testRollExpression = rollablePower?.testRoll?.trim() || "1d20";

  return (
    <details className="group w-full overflow-hidden rounded-xl border border-rpg-border bg-white shadow-sm transition open:border-rpg-primary/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition hover:bg-rpg-primary-soft/40 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-rpg-primary">
            {badge}
          </p>
          <h4 className="mt-1 truncate text-base font-black tracking-normal text-rpg-text">
            {title}
          </h4>
        </div>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-rpg-muted transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-rpg-border px-4 pb-4 pt-3">
        <p className="text-justify text-sm font-semibold leading-6 text-rpg-muted">
          {description}
        </p>
        {hasTestRoll || hasDamageRoll ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {hasTestRoll ? (
              <Button
                className="flex items-center gap-2 rounded-lg border border-rpg-primary bg-rpg-primary-soft px-3 py-2 text-xs font-black uppercase text-rpg-primary transition hover:bg-rpg-primary hover:text-white"
                onPress={() =>
                  onRoll?.({
                    expression: testRollExpression,
                    kind: "Teste",
                    title,
                  })
                }
                type="button"
                variant="secondary"
              >
                <DiceExpressionIcon
                  className="text-xl"
                  expression={testRollExpression}
                />
                Rolar teste
              </Button>
            ) : null}
            {hasDamageRoll ? (
              <Button
                className="flex items-center gap-2 rounded-lg border border-rpg-danger bg-red-50 px-3 py-2 text-xs font-black uppercase text-rpg-danger transition hover:bg-rpg-danger hover:text-white"
                onPress={() =>
                  onRoll?.({
                    expression: damageRollExpression,
                    kind: "Dano",
                    title,
                  })
                }
                type="button"
                variant="secondary"
              >
                <DiceExpressionIcon
                  className="text-xl"
                  expression={damageRollExpression}
                />
                Rolar dano
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}

function PowerRollResultPanel({
  onClose,
  result,
}: Readonly<{
  onClose: () => void;
  result: PowerRollResult;
}>) {
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl shadow-rpg-text/10">
      <div className="flex items-center justify-between gap-3 border-b border-rpg-border bg-rpg-surface-muted px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-rpg-primary">
            {result.kind}
          </p>
          <h3 className="truncate text-sm font-black tracking-normal text-rpg-text">
            {result.title}
          </h3>
        </div>
        <button
          aria-label="Fechar resultado da rolagem"
          className="grid size-7 shrink-0 place-items-center rounded-lg text-sm font-black text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
          onClick={onClose}
          type="button"
        >
          x
        </button>
      </div>
      <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-4 p-4">
        <div className="grid size-14 place-items-center rounded-2xl border border-rpg-primary/20 bg-rpg-primary-soft text-rpg-primary shadow-sm">
          <DiceExpressionIcon
            className={`h-9 w-9 ${
              result.isRolling ? "animate-spin" : "animate-pulse"
            }`}
            expression={result.expression}
          />
        </div>
        <div className="min-w-0">
          {result.isRolling ? (
            <p className="text-2xl font-black tracking-normal">Rolando...</p>
          ) : result.isInvalid ? (
            <p className="text-xl font-black tracking-normal text-rpg-danger">
              Inválida
            </p>
          ) : (
            <div className="flex min-w-0 items-end gap-3">
              <p className="text-4xl font-black leading-none tracking-normal text-rpg-primary">
                {result.total}
              </p>
              <p className="pb-1 text-sm font-black uppercase text-rpg-muted">
                {result.expression}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManualPowerEditor({
  onChange,
  onDone,
  onRemove,
  power,
}: Readonly<{
  onChange: (
    powerId: string,
    field: ManualPowerField,
    value: boolean | string,
  ) => void;
  onDone: (powerId: string) => void;
  onRemove: (powerId: string) => void;
  power: OrdemAgentManualPower;
}>) {
  return (
    <>
      <div className="flex items-start gap-3">
        <TextField
          className="grid min-w-0 flex-1 gap-1"
          value={power.name}
          onChange={(value) => onChange(power.id, "name", value)}
        >
          <Label className="text-xs font-black uppercase text-rpg-muted">
            Nome
          </Label>
          <InputGroup className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft">
            <InputGroup.Input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold text-rpg-text outline-none" />
          </InputGroup>
        </TextField>
        <Button
          className="mt-5 grid size-10 min-w-0 place-items-center rounded-lg bg-rpg-danger px-0 text-white shadow-lg shadow-rpg-danger/20 transition hover:brightness-95"
          onPress={() => onRemove(power.id)}
          type="button"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
      <TextField
        className="grid gap-1"
        value={power.category ?? ""}
        onChange={(value) => onChange(power.id, "category", value)}
      >
        <Label className="text-xs font-black uppercase text-rpg-muted">
          Categoria
        </Label>
        <InputGroup className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft">
          <InputGroup.Input
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold text-rpg-text outline-none"
            placeholder="Manual"
          />
        </InputGroup>
      </TextField>
      <TextField
        className="grid gap-1"
        value={power.description}
        onChange={(value) => onChange(power.id, "description", value)}
      >
        <Label className="text-xs font-black uppercase text-rpg-muted">
          Descrição
        </Label>
        <InputGroup className="min-h-28 rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft">
          <InputGroup.TextArea
            className="min-h-24 min-w-0 flex-1 resize-none bg-transparent p-3 text-sm font-semibold leading-6 text-rpg-text outline-none"
          />
        </InputGroup>
      </TextField>
      <div className="grid gap-3 rounded-lg border border-rpg-border bg-rpg-surface-muted p-3">
        <Switch
          className="w-full"
          isSelected={Boolean(power.isRollable)}
          onChange={(isSelected) =>
            onChange(power.id, "isRollable", isSelected)
          }
          size="md"
        >
          {({ isSelected }) => (
            <Switch.Content className="flex w-full items-center justify-between gap-4">
              <span className="min-w-0">
                <span className="block text-sm font-black text-rpg-text">
                  Habilidade com rolagem
                </span>
                <span className="mt-1 block text-xs font-semibold text-rpg-muted">
                  {isSelected
                    ? "Teste e dano podem ser rolados pelo card."
                    : "Sem botoes de rolagem no modo visualizacao."}
                </span>
              </span>
              <span
                className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
                  isSelected ? "bg-rpg-primary" : "bg-rpg-border"
                }`}
              >
                <span
                  className={`size-4 rounded-full bg-white shadow transition ${
                    isSelected ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </Switch.Content>
          )}
        </Switch>

        {power.isRollable ? (
          <div className="grid gap-3 md:grid-cols-2">
            <RollConfigField
              expression={power.testRoll ?? "1d20"}
              isEnabled={power.hasTestRoll ?? true}
              label="Teste"
              onExpressionChange={(value) =>
                onChange(power.id, "testRoll", value)
              }
              onToggle={(isEnabled) =>
                onChange(power.id, "hasTestRoll", isEnabled)
              }
              placeholder="1d20+5"
            />
            <RollConfigField
              expression={power.damageRoll ?? "1d6"}
              isEnabled={Boolean(power.hasDamageRoll)}
              label="Dano"
              onExpressionChange={(value) =>
                onChange(power.id, "damageRoll", value)
              }
              onToggle={(isEnabled) =>
                onChange(power.id, "hasDamageRoll", isEnabled)
              }
              placeholder="2d6+3"
            />
          </div>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button
          className="flex items-center gap-2 rounded-lg bg-rpg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
          onPress={() => onDone(power.id)}
          type="button"
        >
          <CheckIcon className="h-4 w-4" />
          Salvar habilidade
        </Button>
      </div>
    </>
  );
}

function RollConfigField({
  expression,
  isEnabled,
  label,
  onExpressionChange,
  onToggle,
  placeholder,
}: Readonly<{
  expression: string;
  isEnabled: boolean;
  label: string;
  onExpressionChange: (value: string) => void;
  onToggle: (isEnabled: boolean) => void;
  placeholder: string;
}>) {
  return (
    <div
      className={`grid gap-2 rounded-lg border p-3 transition ${
        isEnabled
          ? "border-rpg-primary bg-white"
          : "border-rpg-border bg-rpg-surface"
      }`}
    >
      <Switch
        className="w-full"
        isSelected={isEnabled}
        onChange={onToggle}
        size="sm"
      >
        {({ isSelected }) => (
          <Switch.Content className="flex w-full items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-rpg-muted">
              Rolar {label}
            </span>
            <span
              className={`flex h-5 w-9 shrink-0 items-center rounded-full p-1 transition ${
                isSelected ? "bg-rpg-primary" : "bg-rpg-border"
              }`}
            >
              <span
                className={`size-3 rounded-full bg-white shadow transition ${
                  isSelected ? "translate-x-4" : ""
                }`}
              />
            </span>
          </Switch.Content>
        )}
      </Switch>
      <TextField
        className="grid gap-1"
        isDisabled={!isEnabled}
        value={expression}
        onChange={onExpressionChange}
      >
        <Label className="sr-only">Expressao de {label}</Label>
        <InputGroup className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft disabled:opacity-60">
          <InputGroup.Input
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold text-rpg-text outline-none disabled:cursor-not-allowed"
            placeholder={placeholder}
          />
        </InputGroup>
      </TextField>
    </div>
  );
}

function rollDiceExpression(expression: string) {
  const normalizedExpression = expression.replace(/\s+/g, "");

  if (!normalizedExpression) {
    return null;
  }

  const tokenRegex = /[+-]?(?:\d*d\d+|\d+)/gi;
  const tokens = normalizedExpression.match(tokenRegex);

  if (!tokens || tokens.join("") !== normalizedExpression) {
    return null;
  }

  let total = 0;
  const parts: string[] = [];

  for (const token of tokens) {
    const sign = token.startsWith("-") ? -1 : 1;
    const cleanToken = token.replace(/^[+-]/, "");
    const diceMatch = cleanToken.match(/^(\d*)d(\d+)$/i);

    if (!diceMatch) {
      const modifier = Number(cleanToken) * sign;
      total += modifier;
      parts.push(formatSignedValue(modifier));
      continue;
    }

    const amount = Number(diceMatch[1] || 1);
    const sides = Number(diceMatch[2]);

    if (!Number.isInteger(amount) || !Number.isInteger(sides) || amount < 1 || sides < 2 || amount > 100) {
      return null;
    }

    const rolls = Array.from({ length: amount }, () =>
      Math.floor(Math.random() * sides) + 1,
    );
    const subtotal = rolls.reduce((sum, roll) => sum + roll, 0) * sign;
    total += subtotal;
    parts.push(`${sign < 0 ? "-" : ""}${amount}d${sides} [${rolls.join(", ")}]`);
  }

  return {
    detail: `${parts.join(" + ").replace(/\+ -/g, "- ")} = ${total}`,
    total,
  };
}

function formatSignedValue(value: number) {
  return value >= 0 ? `+${value}` : String(value);
}

function getPowerCategory(power: OrdemAgentManualPower) {
  return power.category?.trim() || "Manual";
}

function DiceExpressionIcon({
  className,
  expression,
}: Readonly<{
  className?: string;
  expression: string;
}>) {
  const diceSides = getFirstDiceSides(expression);
  const dicePath =
    flaticonDicePaths[diceSides] ??
    (diceSides <= 6 ? flaticonDicePaths[6] : flaticonDicePaths[20]);
  const transform = diceSides === 6 ? "rotate(-30 150 150)" : undefined;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="-4 0 308 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={dicePath} transform={transform} />
    </svg>
  );
}

function getFirstDiceSides(expression: string) {
  const diceMatch = expression.match(/\d*d(\d+)/i);

  if (!diceMatch) {
    return 20;
  }

  return Number(diceMatch[1]) || 20;
}
