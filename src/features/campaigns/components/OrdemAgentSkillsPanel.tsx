import { Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { getSkillInputName } from "../services/ordemAgentSheetForm";
import {
  OrdemAgentAttributes,
  OrdemAgentSkill,
  OrdemAgentSkillAttribute,
} from "../types/campaign";
import { SkillNumberInput } from "./OrdemAgentSheetInputs";

type SkillRollResult = {
  detail: string;
  id: string;
  isRolling: boolean;
  title: string;
  total?: number;
};
export type SkillRollCompletePayload = {
  expression: string;
  title: string;
  total: number;
};

const attributeBySkill: Record<
  OrdemAgentSkillAttribute,
  keyof OrdemAgentAttributes
> = {
  AGI: "agility",
  FOR: "strength",
  INT: "intellect",
  PRE: "presence",
  VIG: "vigor",
};

const flaticonD20Path =
  "M190 163 150 99 110 163ZM125 91 87 153 48 98ZM216 196 274 231Q267 240 257 246L182 291Q171 298 159 299Q160 299 216 196ZM192 188 150 264 108 188ZM213 153 175 91 252 98ZM84 196Q113 247 141 299Q129 298 118 291L43 246Q33 240 26 231ZM228 174Q257 134 286 94Q288 100 287 107V193Q287 201 285 208ZM163 65V1Q173 3 182 9L257 54Q271 62 279 76ZM72 174 15 208Q13 201 13 192V108Q13 100 14 94ZM138 65Q79 70 21 76Q29 62 43 54L118 9Q127 3 138 1Z";

export function OrdemAgentSkillsPanel({
  attributes,
  isCustomizing,
  onRollComplete,
  skills,
}: Readonly<{
  attributes: OrdemAgentAttributes;
  isCustomizing: boolean;
  onRollComplete?: (roll: SkillRollCompletePayload) => void;
  skills: OrdemAgentSkill[];
}>) {
  const [rollResult, setRollResult] = useState<SkillRollResult | null>(null);
  const rollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rollTimeout.current) {
        clearTimeout(rollTimeout.current);
      }
    };
  }, []);

  function handleRollSkill(skill: OrdemAgentSkill) {
    if (rollTimeout.current) {
      clearTimeout(rollTimeout.current);
    }

    const id = crypto.randomUUID();
    const diceAmount = Math.max(1, attributes[attributeBySkill[skill.attribute]]);
    const rolls = Array.from({ length: diceAmount }, () =>
      Math.floor(Math.random() * 20) + 1,
    );
    const bestRoll = Math.max(...rolls);
    const bonus = skill.trainingBonus + skill.otherBonus;
    const total = bestRoll + bonus;

    setRollResult({
      detail: "",
      id,
      isRolling: true,
      title: skill.label,
    });

    rollTimeout.current = setTimeout(() => {
      const expression = `${diceAmount}d20${formatBonus(bonus)}`;

      setRollResult({
        detail: expression,
        id,
        isRolling: false,
        title: skill.label,
        total,
      });
      onRollComplete?.({
        expression,
        title: skill.label,
        total,
      });
    }, 650);
  }

  return (
    <section className="min-w-0 rounded-3xl border border-rpg-border bg-rpg-surface p-4 shadow-sm">
      <div className="mb-3 grid grid-cols-[minmax(7rem,1fr)_3.5rem_3.5rem_3.5rem] gap-2 px-1 text-xs font-black uppercase text-rpg-muted">
        <p>Perícia</p>
        <p className="text-center">Dados</p>
        <p className="text-center">Bônus</p>
        <p className="text-center">Treino</p>
      </div>
      <div className="grid gap-1">
        {skills.map((skill) => {
          const hasBonus = skill.trainingBonus > 0 || skill.otherBonus > 0;

          return (
            <div
              className={`grid grid-cols-[minmax(7rem,1fr)_3.5rem_3.5rem_3.5rem] items-center gap-2 text-sm font-bold ${
                hasBonus ? "text-emerald-600" : "text-rpg-text"
              }`}
              key={skill.key}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  aria-label={`Rolar ${skill.label}`}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-rpg-muted transition hover:bg-rpg-primary-soft hover:text-rpg-primary"
                  onPress={() => handleRollSkill(skill)}
                  type="button"
                  variant="secondary"
                >
                  <D20Icon className="h-4 w-4" />
                </Button>
                <span className="truncate">{skill.label}</span>
              </div>
              <p className="text-center text-rpg-muted">
                ( {skill.attribute} )
              </p>
              <SkillNumberInput
                defaultValue={String(skill.otherBonus)}
                isEditing={isCustomizing}
                label={`Bonus de ${skill.label}`}
                max={99}
                min={-99}
                name={getSkillInputName(skill.key, "otherBonus")}
              />
              <SkillNumberInput
                defaultValue={String(skill.trainingBonus)}
                isEditing={isCustomizing}
                label={`Treino de ${skill.label}`}
                max={15}
                min={0}
                name={getSkillInputName(skill.key, "trainingBonus")}
                step={5}
              />
            </div>
          );
        })}
      </div>

      {rollResult ? (
        <SkillRollResultPanel
          onClose={() => setRollResult(null)}
          result={rollResult}
        />
      ) : null}
    </section>
  );
}

function SkillRollResultPanel({
  onClose,
  result,
}: Readonly<{
  onClose: () => void;
  result: SkillRollResult;
}>) {
  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface text-rpg-text shadow-2xl shadow-rpg-text/10">
      <div className="flex items-center justify-between gap-3 border-b border-rpg-border bg-rpg-surface-muted px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-rpg-primary">
            Perícia
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
          <D20Icon
            className={`h-9 w-9 ${
              result.isRolling ? "animate-spin" : "animate-pulse"
            }`}
          />
        </div>
        <div className="min-w-0">
          {result.isRolling ? (
            <p className="text-2xl font-black tracking-normal">Rolando...</p>
          ) : (
            <div className="flex min-w-0 items-end gap-3">
              <p className="text-4xl font-black leading-none tracking-normal text-rpg-primary">
                {result.total}
              </p>
              <p className="pb-1 text-sm font-black uppercase text-rpg-muted">
                {result.detail}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBonus(value: number) {
  if (value === 0) {
    return "";
  }

  return value > 0 ? `+${value}` : String(value);
}

function D20Icon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="-4 0 308 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={flaticonD20Path} />
    </svg>
  );
}
