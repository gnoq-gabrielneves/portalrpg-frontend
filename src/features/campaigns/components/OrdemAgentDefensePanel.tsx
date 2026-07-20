export function OrdemAgentDefensePanel({
  block,
  defense,
  dodge,
}: Readonly<{ block: number; defense: number; dodge: number }>) {
  return (
    <section className="grid grid-cols-3 items-start gap-3">
      <DefenseStat label="Defesa" value={defense} />
      <DefenseStat label="Bloqueio" value={block} />
      <DefenseStat label="Esquiva" value={dodge} />
    </section>
  );
}

function DefenseStat({
  label,
  value,
}: Readonly<{ label: string; value: number }>) {
  return (
    <div className="grid justify-items-center gap-2 text-center">
      <div className="grid size-16 place-items-center rounded-lg border-4 border-rpg-text text-2xl font-black text-rpg-text">
        {value}
      </div>
      <p className="text-xs font-black uppercase text-rpg-muted">{label}</p>
    </div>
  );
}
