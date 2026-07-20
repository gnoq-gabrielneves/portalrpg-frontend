import { Button } from "@heroui/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";

export function CampaignCharacterHeader({
  campaignId,
  isCustomizing,
  isSaveDisabled,
  isSaving,
  onDelete,
  onToggleCustomization,
}: Readonly<{
  campaignId: string;
  isCustomizing: boolean;
  isSaveDisabled: boolean;
  isSaving: boolean;
  onDelete: () => void;
  onToggleCustomization: () => void;
}>) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <Link
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-rpg-muted transition hover:text-rpg-primary"
        href={`/campaigns/${campaignId}`}
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para campanha
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold transition ${
            isCustomizing
              ? "border-rpg-primary bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20"
              : "border-rpg-primary bg-white text-rpg-primary hover:bg-rpg-primary-soft"
          }`}
          onPress={onToggleCustomization}
          type="button"
          variant="secondary"
        >
          <PencilIcon className="h-4 w-4" />
          {isCustomizing ? "Fechar edição" : "Editar"}
        </Button>
        {isCustomizing ? (
          <>
            <Button
              className="flex items-center gap-2 rounded-lg bg-rpg-danger px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rpg-danger/20 transition hover:brightness-95"
              onPress={onDelete}
              type="button"
            >
              <Trash2Icon className="h-4 w-4" />
              Excluir ficha
            </Button>
            <Button
              className="flex items-center gap-2 rounded-lg bg-rpg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
              isDisabled={isSaveDisabled}
              type="submit"
            >
              <SaveIcon className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar ficha"}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
