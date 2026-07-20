import { SupportedSystem } from "@/shared/database/SupportedSystems";
import { Chip } from "@heroui/react";
import { CheckCircle2Icon, CircleIcon } from "lucide-react";

export function SupportedSystemItem({
  system,
}: Readonly<{ system: SupportedSystem }>) {
  // Campos opcionais do tipo SupportedSystem aparecem apenas quando vierem da API.
  const systemDetails = [
    system.type ? `Nicho: ${system.type}` : null,
    system.version ? `Versão ${system.version}` : null,
    system.year ? `Lançado em ${system.year}` : null,
  ].filter(Boolean);

  // O icone muda junto com o estado ativo/inativo do sistema.
  const StatusIcon = system.isActive ? CheckCircle2Icon : CircleIcon;

  return (
    <article className="rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4 transition hover:border-rpg-primary/40 hover:bg-rpg-primary-soft/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-rpg-text">
            {system.name}
          </h2>
          {system.description && (
            <p className="mt-1 line-clamp-2 text-justify text-sm leading-6 text-rpg-muted">
              {system.description}
            </p>
          )}
        </div>

        <Chip
          className={
            system.isActive
              ? "bg-rpg-success/20 text-emerald-700"
              : "bg-rpg-border text-rpg-muted"
          }
          size="sm"
        >
          <span className="flex items-center gap-1.5">
            <StatusIcon className="h-3.5 w-3.5" />
            {system.isActive ? "Ativo" : "Inativo"}
          </span>
        </Chip>
      </div>

      {systemDetails.length > 0 && (
        <ul className="mt-4 grid gap-2 text-sm font-semibold text-rpg-muted">
          {systemDetails.map((detail) => (
            <li className="flex items-center gap-2" key={detail}>
              <span className="h-1.5 w-1.5 rounded-full bg-rpg-primary" />
              {detail}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
