import { InputGroup, TextField } from "@heroui/react";
import Image from "next/image";
import {
  ATTRIBUTE_WHEEL_IMAGE,
  attributeFields,
} from "../constants/ordemAgentSheet";
import { OrdemAgentAttributes, UpdateOrdemAgentPayload } from "../types/campaign";

export function OrdemAgentAttributeWheel({
  attributes,
  isCustomizing,
}: Readonly<{
  attributes: OrdemAgentAttributes | undefined;
  isCustomizing: boolean;
}>) {
  return (
    <section className="relative mx-auto aspect-square w-full max-w-84">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-contain opacity-80 brightness-0"
        fill
        priority
        src={ATTRIBUTE_WHEEL_IMAGE}
      />
      {attributeFields.map((field) => (
        <AttributeInput
          abbreviation={field.abbreviation}
          defaultValue={String(attributes?.[field.name] ?? 1)}
          isCustomizing={isCustomizing}
          key={field.name}
          label={field.label}
          name={field.name}
          x={field.x}
          y={field.y}
        />
      ))}
    </section>
  );
}

function AttributeInput({
  abbreviation,
  defaultValue,
  isCustomizing,
  label,
  name,
  x,
  y,
}: Readonly<{
  abbreviation: string;
  defaultValue: string;
  isCustomizing: boolean;
  label: string;
  name: keyof UpdateOrdemAgentPayload;
  x: number;
  y: number;
}>) {
  return (
    <TextField
      aria-label={label}
      className="absolute grid h-10 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center text-center"
      defaultValue={defaultValue}
      isReadOnly={!isCustomizing}
      name={name}
      style={{ left: `${x}%`, top: `${y}%` }}
      type="number"
    >
      <InputGroup className="grid h-10 w-12 place-items-center border-0 bg-transparent p-0 shadow-none">
        <InputGroup.Input
          className="h-10 w-12 border-0 bg-transparent p-0 text-center text-3xl font-black leading-none text-rpg-text outline-none [appearance:textfield] read-only:cursor-default [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          max={3}
          min={0}
        />
      </InputGroup>
      <span className="sr-only">{abbreviation}</span>
    </TextField>
  );
}
