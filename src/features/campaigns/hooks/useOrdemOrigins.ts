"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrdemOrigins } from "../services/ordemRulesService";

export function useOrdemOrigins() {
  return useQuery({
    queryFn: getOrdemOrigins,
    queryKey: ["ordem-rules", "origins"],
  });
}
