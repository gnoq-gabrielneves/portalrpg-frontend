import { Skeleton } from "@heroui/react";

// Skeleton replica o tamanho aproximado dos itens reais para evitar salto visual.
export function SupportedSystemsSkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((item) => (
        <Skeleton className="h-28 rounded-2xl" key={item} />
      ))}
    </div>
  );
}
