import { Button, InputGroup, Label, TextField } from "@heroui/react";
import { UpdateOrdemAgentPayload } from "../types/campaign";
import { ResourceFieldName } from "../types/ordemAgentSheet";

export function OrdemAgentResourceBar({
  barClassName,
  currentValue,
  label,
  maxDefaultValue,
  maxValue,
  maxName,
  name,
  onAdjust,
  onCurrentChange,
  shouldLockMax = false,
}: Readonly<{
  barClassName: string;
  currentValue: number;
  label: string;
  maxDefaultValue: string;
  maxValue: number;
  maxName: keyof UpdateOrdemAgentPayload;
  name: ResourceFieldName;
  onAdjust: (name: ResourceFieldName, delta: number) => void;
  onCurrentChange: (name: ResourceFieldName, value: number) => void;
  shouldLockMax?: boolean;
}>) {
  const progress = getResourceProgress(currentValue, maxValue);

  return (
    <div className="grid gap-1">
      <p className="text-center text-xs font-black uppercase text-rpg-muted">
        {label}
      </p>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1">
        <ResourceStepGroup
          ariaLabel={label}
          direction="down"
          onAdjust={(delta) => onAdjust(name, delta)}
        />
        <div className="relative grid min-h-10 grid-cols-[1fr_auto_1fr] items-center overflow-hidden rounded-lg border border-rpg-border bg-rpg-surface-muted px-2 text-rpg-text shadow-inner">
          <span
            aria-hidden="true"
            className={`${barClassName} absolute inset-y-0 left-0 transition-[width] duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5"
          />
          <ResourceValueInput
            ariaLabel={`${label} atual`}
            name={name}
            onChange={(value) => onCurrentChange(name, value)}
            value={String(currentValue)}
          />
          <span className="relative z-10 mx-1 rounded-md bg-white/85 px-1 text-sm font-black text-rpg-text shadow-sm">
            /
          </span>
          <ResourceValueInput
            ariaLabel={`${label} maximo`}
            name={maxName}
            readOnly={shouldLockMax}
            value={maxDefaultValue}
          />
        </div>
        <ResourceStepGroup
          ariaLabel={label}
          direction="up"
          onAdjust={(delta) => onAdjust(name, delta)}
        />
      </div>
    </div>
  );
}

function ResourceStepGroup({
  ariaLabel,
  direction,
  onAdjust,
}: Readonly<{
  ariaLabel: string;
  direction: "down" | "up";
  onAdjust: (delta: number) => void;
}>) {
  const steps = direction === "down" ? [-5, -1] : [1, 5];

  return (
    <div className="grid grid-cols-2 gap-1">
      {steps.map((step) => (
        <Button
          aria-label={`${step > 0 ? "Aumentar" : "Diminuir"} ${ariaLabel} em ${Math.abs(step)}`}
          className="grid size-8 min-w-0 place-items-center rounded-lg border border-rpg-border bg-white px-0 text-xs font-black text-rpg-muted shadow-sm transition hover:border-rpg-primary hover:text-rpg-primary"
          key={step}
          onPress={() => onAdjust(step)}
          type="button"
          variant="secondary"
        >
          {step > 0 ? `+${step}` : step}
        </Button>
      ))}
    </div>
  );
}

function getResourceProgress(currentValue: number, maxValue: number) {
  if (maxValue <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (currentValue / maxValue) * 100));
}

function ResourceValueInput({
  ariaLabel,
  name,
  onChange,
  readOnly = false,
  value,
}: Readonly<{
  ariaLabel: string;
  name: keyof UpdateOrdemAgentPayload;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  value: string;
}>) {
  return (
    <TextField
      aria-label={ariaLabel}
      className="min-w-0"
      name={name}
      type="number"
      value={value}
    >
      <Label className="sr-only">{ariaLabel}</Label>
      <InputGroup className="min-w-0 border-0 bg-transparent p-0 shadow-none">
        <InputGroup.Input
          className="relative z-10 h-8 min-w-0 flex-1 appearance-none rounded-md bg-white/85 p-0 text-center text-base font-black text-rpg-text outline-none shadow-sm transition focus:bg-white focus:ring-2 focus:ring-rpg-primary-soft [appearance:textfield] read-only:cursor-default [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          min={0}
          onChange={(event) => onChange?.(Number(event.currentTarget.value))}
          readOnly={readOnly}
        />
      </InputGroup>
    </TextField>
  );
}
