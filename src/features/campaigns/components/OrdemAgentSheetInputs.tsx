import { InputGroup, Label, TextField } from "@heroui/react";
import { UpdateOrdemAgentPayload } from "../types/campaign";

export function OrdemAgentTextInput({
  defaultValue,
  isEditing = true,
  label,
  name,
  required,
}: Readonly<{
  defaultValue: string;
  isEditing?: boolean;
  label: string;
  name: keyof UpdateOrdemAgentPayload;
  required?: boolean;
}>) {
  return (
    <TextField
      className="grid min-w-0 gap-1"
      defaultValue={defaultValue}
      isRequired={required}
      name={name}
      isReadOnly={!isEditing}
    >
      <Label className="text-xs font-black uppercase text-rpg-muted">
        {label}
      </Label>
      <InputGroup
        className={`min-w-0 rounded-lg border shadow-sm transition ${
          isEditing
            ? "border-rpg-border bg-white focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <InputGroup.Input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold text-rpg-text outline-none read-only:px-0" />
      </InputGroup>
    </TextField>
  );
}

export function OrdemAgentTextAreaInput({
  defaultValue,
  isEditing = true,
  label,
  name,
  placeholder,
}: Readonly<{
  defaultValue: string;
  isEditing?: boolean;
  label: string;
  name: keyof UpdateOrdemAgentPayload;
  placeholder: string;
}>) {
  return (
    <TextField
      className="grid gap-2"
      defaultValue={defaultValue}
      isReadOnly={!isEditing}
      name={name}
    >
      <Label className="text-xs font-black uppercase text-rpg-muted">
        {label}
      </Label>
      <InputGroup
        className={`min-h-40 rounded-lg border shadow-sm ${
          isEditing ? "border-rpg-border bg-white" : "border-transparent bg-rpg-surface-muted"
        }`}
      >
        <InputGroup.TextArea
          className="min-h-36 min-w-0 flex-1 resize-none bg-transparent p-4 text-sm font-semibold leading-6 text-rpg-text outline-none placeholder:text-slate-400"
          placeholder={placeholder}
        />
      </InputGroup>
    </TextField>
  );
}

export function OrdemAgentNumberInput({
  defaultValue,
  isEditing = true,
  label,
  max,
  min,
  name,
  required,
}: Readonly<{
  defaultValue: string;
  isEditing?: boolean;
  label: string;
  max: number;
  min: number;
  name: keyof UpdateOrdemAgentPayload;
  required?: boolean;
}>) {
  return (
    <TextField
      className="grid min-w-0 gap-1"
      defaultValue={defaultValue}
      isRequired={required}
      isReadOnly={!isEditing}
      name={name}
      type="number"
    >
      <Label className="text-xs font-black uppercase text-rpg-muted">
        {label}
      </Label>
      <InputGroup
        className={`min-w-0 rounded-lg border shadow-sm transition ${
          isEditing
            ? "border-rpg-border bg-white focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <InputGroup.Input
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-bold text-rpg-text outline-none read-only:px-0"
          max={max}
          min={min}
        />
      </InputGroup>
    </TextField>
  );
}

export function SkillNumberInput({
  defaultValue,
  isEditing = true,
  label,
  max,
  min,
  name,
  step,
}: Readonly<{
  defaultValue: string;
  isEditing?: boolean;
  label: string;
  max: number;
  min: number;
  name: string;
  step?: number;
}>) {
  return (
    <TextField
      aria-label={label}
      className="min-w-0"
      defaultValue={defaultValue}
      isReadOnly={!isEditing}
      name={name}
      type="number"
    >
      <InputGroup
        className={`min-w-0 bg-transparent shadow-none ${
          isEditing ? "border-b border-rpg-border" : "border-b border-transparent"
        }`}
      >
        <InputGroup.Input
          className="h-6 min-w-0 flex-1 appearance-none bg-transparent px-1 text-center text-sm font-black outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          max={max}
          min={min}
          step={step}
        />
      </InputGroup>
    </TextField>
  );
}
